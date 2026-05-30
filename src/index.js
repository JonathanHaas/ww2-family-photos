const MANIFEST_KEY = "metadata/archive.json";
const SESSION_COOKIE = "archive_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/admin") {
        return handleAdmin(request, env);
      }

      if (url.pathname === "/api/galleries" && request.method === "GET") {
        return jsonResponse(await getPublicArchive(env));
      }

      if (url.pathname === "/api/login" && request.method === "POST") {
        return handleLogin(request, env);
      }

      if (url.pathname === "/api/logout" && request.method === "POST") {
        return handleLogout();
      }

      if (url.pathname === "/api/admin" && request.method === "GET") {
        await requireAdmin(request, env);
        return jsonResponse(await getPublicArchive(env));
      }

      if (url.pathname === "/api/galleries" && request.method === "POST") {
        await requireAdmin(request, env);
        return handleCreateGallery(request, env);
      }

      if (url.pathname.startsWith("/api/galleries/") && request.method === "PUT") {
        await requireAdmin(request, env);
        return handleUpdateGallery(request, env, getPathId(url.pathname, "/api/galleries/"));
      }

      if (url.pathname.startsWith("/api/galleries/") && request.method === "DELETE") {
        await requireAdmin(request, env);
        return handleDeleteGallery(env, getPathId(url.pathname, "/api/galleries/"));
      }

      if (url.pathname === "/api/photos" && request.method === "POST") {
        await requireAdmin(request, env);
        return handleUploadPhoto(request, env);
      }

      if (url.pathname.startsWith("/api/photos/") && request.method === "PUT") {
        await requireAdmin(request, env);
        return handleUpdatePhoto(request, env, getPathId(url.pathname, "/api/photos/"));
      }

      if (url.pathname.startsWith("/api/photos/") && request.method === "DELETE") {
        await requireAdmin(request, env);
        return handleDeletePhoto(env, getPathId(url.pathname, "/api/photos/"));
      }

      if (url.pathname.startsWith("/photo/") && request.method === "GET") {
        return handlePhoto(url, env);
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonResponse({ error: error.message }, { status: error.status });
      }

      console.error(JSON.stringify({
        message: "Unhandled request failure",
        error: error instanceof Error ? error.message : String(error)
      }));

      return jsonResponse({ error: "Something went wrong." }, { status: 500 });
    }
  }
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function handleAdmin(request, env) {
  if (await isAdmin(request, env)) {
    return htmlResponse(renderAdminApp());
  }

  return htmlResponse(renderLoginApp());
}

async function handleLogin(request, env) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!env.ADMIN_PASSWORD) {
    throw new HttpError(500, "Upload password is not configured.");
  }

  if (!(await safeEqual(password, env.ADMIN_PASSWORD))) {
    throw new HttpError(401, "That password did not work.");
  }

  const cookie = await createSessionCookie(env);
  return jsonResponse({ ok: true }, { headers: { "Set-Cookie": cookie } });
}

function handleLogout() {
  return jsonResponse(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
      }
    }
  );
}

async function handleCreateGallery(request, env) {
  const body = await request.json().catch(() => null);
  const title = cleanText(body?.title, 80);
  const description = cleanText(body?.description, 220);

  if (!title) {
    throw new HttpError(400, "Gallery title is required.");
  }

  const manifest = await getManifest(env);
  const gallery = {
    id: createSlug(title, manifest.galleries.map((item) => item.id)),
    title,
    description,
    createdAt: new Date().toISOString()
  };

  manifest.galleries.unshift(gallery);
  await saveManifest(env, manifest);

  return jsonResponse({ gallery }, { status: 201 });
}

async function handleUpdateGallery(request, env, galleryId) {
  const body = await request.json().catch(() => null);
  const title = cleanText(body?.title, 80);
  const description = cleanText(body?.description, 220);

  if (!galleryId) {
    throw new HttpError(400, "Gallery id is required.");
  }

  if (!title) {
    throw new HttpError(400, "Gallery title is required.");
  }

  const manifest = await getManifest(env);
  const gallery = manifest.galleries.find((item) => item.id === galleryId);

  if (!gallery) {
    throw new HttpError(404, "Gallery not found.");
  }

  gallery.title = title;
  gallery.description = description;
  gallery.updatedAt = new Date().toISOString();
  await saveManifest(env, manifest);

  return jsonResponse({ gallery });
}

async function handleDeleteGallery(env, galleryId) {
  if (!galleryId) {
    throw new HttpError(400, "Gallery id is required.");
  }

  const manifest = await getManifest(env);
  const gallery = manifest.galleries.find((item) => item.id === galleryId);

  if (!gallery) {
    throw new HttpError(404, "Gallery not found.");
  }

  const deletedPhotos = manifest.photos.filter((photo) => photo.galleryId === galleryId);
  await Promise.all(deletedPhotos.map((photo) => env.ARCHIVE_KV.delete(photo.key)));
  manifest.galleries = manifest.galleries.filter((item) => item.id !== galleryId);
  manifest.photos = manifest.photos.filter((photo) => photo.galleryId !== galleryId);
  await saveManifest(env, manifest);

  return jsonResponse({ ok: true, deletedPhotos: deletedPhotos.length });
}

async function handleUploadPhoto(request, env) {
  const form = await request.formData();
  const galleryId = cleanText(form.get("galleryId"), 90);
  const title = cleanText(form.get("title"), 100) || "Untitled Photo";
  const caption = cleanText(form.get("caption"), 280);
  const tags = parseTags(form.get("tags"));
  const file = form.get("photo");

  if (!galleryId) {
    throw new HttpError(400, "Choose a gallery.");
  }

  if (!(file instanceof File)) {
    throw new HttpError(400, "Choose a photo to upload.");
  }

  if (!IMAGE_TYPES.has(file.type)) {
    throw new HttpError(400, "Upload a JPEG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new HttpError(400, "Photos must be 10 MB or smaller.");
  }

  const manifest = await getManifest(env);
  const gallery = manifest.galleries.find((item) => item.id === galleryId);

  if (!gallery) {
    throw new HttpError(400, "That gallery does not exist.");
  }

  const extension = extensionForType(file.type);
  const key = `photos/${galleryId}/${Date.now()}-${crypto.randomUUID()}${extension}`;

  await env.ARCHIVE_KV.put(key, file.stream(), {
    metadata: {
      contentType: file.type,
      originalName: cleanText(file.name, 120),
      galleryId
    }
  });

  const photo = {
    id: crypto.randomUUID(),
    galleryId,
    key,
    title,
    caption,
    tags,
    contentType: file.type,
    size: file.size,
    createdAt: new Date().toISOString()
  };

  manifest.photos.unshift(photo);
  await saveManifest(env, manifest);

  return jsonResponse({ photo: publicPhoto(photo) }, { status: 201 });
}

async function handleUpdatePhoto(request, env, photoId) {
  const body = await request.json().catch(() => null);
  const galleryId = cleanText(body?.galleryId, 90);
  const title = cleanText(body?.title, 100) || "Untitled Photo";
  const caption = cleanText(body?.caption, 280);
  const tags = parseTags(body?.tags);

  if (!photoId) {
    throw new HttpError(400, "Photo id is required.");
  }

  if (!galleryId) {
    throw new HttpError(400, "Choose a gallery.");
  }

  const manifest = await getManifest(env);
  const photo = manifest.photos.find((item) => item.id === photoId);
  const gallery = manifest.galleries.find((item) => item.id === galleryId);

  if (!photo) {
    throw new HttpError(404, "Photo not found.");
  }

  if (!gallery) {
    throw new HttpError(400, "That gallery does not exist.");
  }

  photo.galleryId = galleryId;
  photo.title = title;
  photo.caption = caption;
  photo.tags = tags;
  photo.updatedAt = new Date().toISOString();
  await saveManifest(env, manifest);

  return jsonResponse({ photo: publicPhoto(photo) });
}

async function handleDeletePhoto(env, photoId) {
  if (!photoId) {
    throw new HttpError(400, "Photo id is required.");
  }

  const manifest = await getManifest(env);
  const photo = manifest.photos.find((item) => item.id === photoId);

  if (!photo) {
    throw new HttpError(404, "Photo not found.");
  }

  await env.ARCHIVE_KV.delete(photo.key);
  manifest.photos = manifest.photos.filter((item) => item.id !== photoId);
  await saveManifest(env, manifest);

  return jsonResponse({ ok: true });
}

async function handlePhoto(url, env) {
  const key = decodeURIComponent(url.pathname.replace(/^\/photo\//, ""));

  if (!key.startsWith("photos/")) {
    throw new HttpError(404, "Photo not found.");
  }

  const object = await env.ARCHIVE_KV.getWithMetadata(key, { type: "stream" });

  if (!object.value) {
    throw new HttpError(404, "Photo not found.");
  }

  const headers = new Headers();
  headers.set("content-type", object.metadata?.contentType || "application/octet-stream");
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(object.value, { headers });
}

async function getPublicArchive(env) {
  const manifest = await getManifest(env);
  return {
    galleries: manifest.galleries,
    photos: manifest.photos.map(publicPhoto)
  };
}

function publicPhoto(photo) {
  return {
    id: photo.id,
    galleryId: photo.galleryId,
    title: photo.title,
    caption: photo.caption,
    tags: Array.isArray(photo.tags) ? photo.tags : [],
    createdAt: photo.createdAt,
    url: `/photo/${encodeURIComponent(photo.key)}`
  };
}

async function getManifest(env) {
  const manifest = await env.ARCHIVE_KV.get(MANIFEST_KEY, { type: "json" });
  return {
    galleries: Array.isArray(manifest?.galleries) ? manifest.galleries : [],
    photos: Array.isArray(manifest?.photos) ? manifest.photos : []
  };
}

async function saveManifest(env, manifest) {
  await env.ARCHIVE_KV.put(MANIFEST_KEY, JSON.stringify(manifest, null, 2));
}

async function requireAdmin(request, env) {
  if (!(await isAdmin(request, env))) {
    throw new HttpError(401, "Please sign in to upload.");
  }
}

async function isAdmin(request, env) {
  const cookie = getCookie(request, SESSION_COOKIE);
  return Boolean(cookie && await verifySessionCookie(cookie, env));
}

async function createSessionCookie(env) {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(JSON.stringify({
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    nonce: crypto.randomUUID()
  }));
  const signature = await sign(payload, env.ADMIN_PASSWORD);
  return `${SESSION_COOKIE}=${payload}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

async function verifySessionCookie(cookie, env) {
  if (!env.ADMIN_PASSWORD) {
    return false;
  }

  const [payload, signature] = cookie.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expected = await sign(payload, env.ADMIN_PASSWORD);

  if (!(await safeEqual(signature, expected))) {
    return false;
  }

  try {
    const data = JSON.parse(base64UrlDecode(payload));
    return Number(data.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

async function safeEqual(left, right) {
  const leftHash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(left)));
  const rightHash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(right)));
  let diff = leftHash.length ^ rightHash.length;

  for (let index = 0; index < leftHash.length; index += 1) {
    diff |= leftHash[index] ^ rightHash[index];
  }

  return diff === 0;
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const prefix = `${name}=`;
  const cookie = cookies.find((item) => item.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : "";
}

function getPathId(pathname, prefix) {
  const id = decodeURIComponent(pathname.slice(prefix.length)).trim();
  return id && !id.includes("/") ? id : "";
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function parseTags(value) {
  if (typeof value !== "string") {
    return [];
  }

  return [...new Set(value
    .split(",")
    .map((item) => cleanText(item, 32).toLowerCase())
    .filter(Boolean))]
    .slice(0, 12);
}

function createSlug(title, existingIds) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 54) || "gallery";
  let slug = base;
  let count = 2;

  while (existingIds.includes(slug)) {
    slug = `${base}-${count}`;
    count += 1;
  }

  return slug;
}

function extensionForType(type) {
  return {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
  }[type] || "";
}

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { ...init, headers });
}

function htmlResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(body, { ...init, headers });
}

function base64UrlEncode(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function renderLoginApp() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Upload | WW2 Family Photos</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="admin-page">
    <main class="admin-shell">
      <section class="admin-panel">
        <p class="kicker">Private Upload</p>
        <h1>Family Archive</h1>
        <form class="admin-form" id="loginForm">
          <label class="admin-field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" required />
          </label>
          <div class="admin-actions">
            <button class="admin-button" type="submit">Sign In</button>
            <a class="admin-button secondary" href="/">View Site</a>
          </div>
          <p class="admin-status" id="status"></p>
        </form>
      </section>
    </main>
    <script>
      const form = document.querySelector("#loginForm");
      const status = document.querySelector("#status");

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        status.textContent = "Checking password...";
        const password = new FormData(form).get("password");
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password })
        });

        if (response.ok) {
          location.href = "/admin";
          return;
        }

        const data = await response.json().catch(() => ({}));
        status.textContent = data.error || "Sign in failed.";
      });
    </script>
  </body>
</html>`;
}

function renderAdminApp() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Upload | WW2 Family Photos</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="admin-page">
    <header class="admin-toolbar" aria-label="Archive admin toolbar">
      <div>
        <p class="kicker">Admin</p>
        <strong>Photo Archive</strong>
      </div>
      <nav aria-label="Admin actions">
        <a class="admin-tool-button" href="/">View Site</a>
        <a class="admin-tool-button" href="#createGallery">New Gallery</a>
        <a class="admin-tool-button" href="#uploadImage">Upload Image</a>
        <a class="admin-tool-button" href="#manageGalleries">Galleries</a>
        <a class="admin-tool-button" href="#manageImages">Images</a>
        <button class="admin-tool-button" id="refreshButton" type="button">Refresh</button>
        <button class="admin-tool-button danger" id="toolbarLogoutButton" type="button">Sign Out</button>
      </nav>
    </header>
    <main class="admin-shell">
      <section class="admin-panel">
        <p class="kicker">Upload</p>
        <h1>Photo Archive</h1>
        <form class="admin-form" id="galleryForm">
          <div class="admin-section-anchor" id="createGallery"></div>
          <label class="admin-field">
            <span>New gallery</span>
            <input name="title" maxlength="80" required />
          </label>
          <label class="admin-field">
            <span>Description</span>
            <textarea name="description" maxlength="220"></textarea>
          </label>
          <button class="admin-button" type="submit">Create Gallery</button>
        </form>
        <hr />
        <form class="admin-form" id="photoForm">
          <div class="admin-section-anchor" id="uploadImage"></div>
          <label class="admin-field">
            <span>Gallery</span>
            <select name="galleryId" id="gallerySelect" required></select>
          </label>
          <label class="admin-field">
            <span>Photo title</span>
            <input name="title" maxlength="100" required />
          </label>
          <label class="admin-field">
            <span>Caption</span>
            <textarea name="caption" maxlength="280"></textarea>
          </label>
          <label class="admin-field">
            <span>Tags</span>
            <input name="tags" maxlength="180" placeholder="fred, uniform, letters" />
          </label>
          <label class="admin-field">
            <span>Photo</span>
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
          </label>
          <div class="admin-actions">
            <button class="admin-button" type="submit">Upload Photo</button>
            <a class="admin-button secondary" href="/">View Site</a>
            <button class="admin-button secondary" id="logoutButton" type="button">Sign Out</button>
          </div>
          <p class="admin-status" id="status"></p>
        </form>
      </section>
      <section class="admin-panel">
        <p class="kicker">Manage</p>
        <h2>Archive</h2>
        <div class="admin-manager">
          <section>
            <div class="admin-section-anchor" id="manageGalleries"></div>
            <h3>Galleries</h3>
            <div class="admin-list" id="galleryManager"></div>
          </section>
          <section>
            <div class="admin-section-anchor" id="manageImages"></div>
            <h3>Images</h3>
            <div class="admin-list" id="photoManager"></div>
          </section>
        </div>
      </section>
    </main>
    <script>
      const galleryForm = document.querySelector("#galleryForm");
      const photoForm = document.querySelector("#photoForm");
      const gallerySelect = document.querySelector("#gallerySelect");
      const galleryManager = document.querySelector("#galleryManager");
      const photoManager = document.querySelector("#photoManager");
      const status = document.querySelector("#status");
      const logoutButton = document.querySelector("#logoutButton");
      const toolbarLogoutButton = document.querySelector("#toolbarLogoutButton");
      const refreshButton = document.querySelector("#refreshButton");
      let archive = { galleries: [], photos: [] };

      async function requestJson(url, options) {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Request failed.");
        }

        return data;
      }

      function setStatus(message) {
        status.textContent = message;
      }

      function galleryOptions(selectedId) {
        return archive.galleries.map((gallery) => {
          const selected = gallery.id === selectedId ? " selected" : "";
          return "<option value=\\"" + gallery.id + "\\"" + selected + ">" + escapeHtml(gallery.title) + "</option>";
        }).join("");
      }

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, (character) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[character]);
      }

      function renderArchive() {
        gallerySelect.replaceChildren();
        galleryManager.replaceChildren();
        photoManager.replaceChildren();

        if (!archive.galleries.length) {
          const option = document.createElement("option");
          option.textContent = "Create a gallery first";
          option.value = "";
          gallerySelect.append(option);
          galleryManager.textContent = "No galleries yet.";
          photoManager.textContent = "No images yet.";
          return;
        }

        archive.galleries.forEach((gallery) => {
          const option = document.createElement("option");
          option.value = gallery.id;
          option.textContent = gallery.title;
          gallerySelect.append(option);

          const galleryPhotos = archive.photos.filter((photo) => photo.galleryId === gallery.id);
          const count = galleryPhotos.length;
          const tags = [...new Set(galleryPhotos.flatMap((photo) => photo.tags || []))];
          const item = document.createElement("article");
          item.innerHTML = "<form class=\\"manage-form gallery-manage-form\\" data-gallery-id=\\"" + gallery.id + "\\">" +
            "<label class=\\"admin-field\\"><span>Title</span><input name=\\"title\\" maxlength=\\"80\\" required /></label>" +
            "<label class=\\"admin-field\\"><span>Description</span><textarea name=\\"description\\" maxlength=\\"220\\"></textarea></label>" +
            "<small></small><div class=\\"tag-list\\"></div>" +
            "<div class=\\"admin-actions\\"><button class=\\"admin-button\\" type=\\"submit\\">Save Gallery</button>" +
            "<button class=\\"admin-button secondary danger\\" data-delete-gallery=\\"" + gallery.id + "\\" type=\\"button\\">Delete Gallery</button></div>" +
            "</form>";
          item.querySelector("[name=title]").value = gallery.title;
          item.querySelector("[name=description]").value = gallery.description || "";
          item.querySelector("small").textContent = count + (count === 1 ? " photo" : " photos");
          item.querySelector(".tag-list").replaceChildren(...tags.map((tag) => {
            const span = document.createElement("span");
            span.textContent = tag;
            return span;
          }));
          galleryManager.append(item);
        });

        if (!archive.photos.length) {
          photoManager.textContent = "No images yet.";
          return;
        }

        archive.photos.forEach((photo) => {
          const item = document.createElement("article");
          item.className = "photo-manage-item";
          item.innerHTML = "<img class=\\"admin-thumb\\" src=\\"" + photo.url + "\\" alt=\\"\\" loading=\\"lazy\\" />" +
            "<form class=\\"manage-form photo-manage-form\\" data-photo-id=\\"" + photo.id + "\\">" +
            "<label class=\\"admin-field\\"><span>Gallery</span><select name=\\"galleryId\\" required>" + galleryOptions(photo.galleryId) + "</select></label>" +
            "<label class=\\"admin-field\\"><span>Title</span><input name=\\"title\\" maxlength=\\"100\\" required /></label>" +
            "<label class=\\"admin-field\\"><span>Caption</span><textarea name=\\"caption\\" maxlength=\\"280\\"></textarea></label>" +
            "<label class=\\"admin-field\\"><span>Tags</span><input name=\\"tags\\" maxlength=\\"180\\" /></label>" +
            "<div class=\\"admin-actions\\"><button class=\\"admin-button\\" type=\\"submit\\">Save Image</button>" +
            "<button class=\\"admin-button secondary danger\\" data-delete-photo=\\"" + photo.id + "\\" type=\\"button\\">Delete Image</button></div>" +
            "</form>";
          item.querySelector(".admin-thumb").alt = photo.title || "Archive image";
          item.querySelector("[name=title]").value = photo.title || "";
          item.querySelector("[name=caption]").value = photo.caption || "";
          item.querySelector("[name=tags]").value = (photo.tags || []).join(", ");
          photoManager.append(item);
        });
      }

      async function loadArchive() {
        archive = await requestJson("/api/admin");
        renderArchive();
      }

      galleryForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setStatus("Creating gallery...");
        const form = new FormData(galleryForm);
        await requestJson("/api/galleries", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: form.get("title"),
            description: form.get("description")
          })
        });
        galleryForm.reset();
        setStatus("Gallery created.");
        await loadArchive();
      });

      photoForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setStatus("Uploading photo...");
        await requestJson("/api/photos", {
          method: "POST",
          body: new FormData(photoForm)
        });
        photoForm.reset();
        setStatus("Photo uploaded.");
        await loadArchive();
      });

      galleryManager.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.target.closest(".gallery-manage-form");

        if (!form) {
          return;
        }

        const data = new FormData(form);
        setStatus("Saving gallery...");
        await requestJson("/api/galleries/" + encodeURIComponent(form.dataset.galleryId), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: data.get("title"),
            description: data.get("description")
          })
        });
        setStatus("Gallery saved.");
        await loadArchive();
      });

      galleryManager.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-delete-gallery]");

        if (!button) {
          return;
        }

        const gallery = archive.galleries.find((item) => item.id === button.dataset.deleteGallery);
        const count = archive.photos.filter((photo) => photo.galleryId === button.dataset.deleteGallery).length;

        if (!confirm("Delete " + (gallery?.title || "this gallery") + " and " + count + " image" + (count === 1 ? "" : "s") + "?")) {
          return;
        }

        setStatus("Deleting gallery...");
        await requestJson("/api/galleries/" + encodeURIComponent(button.dataset.deleteGallery), { method: "DELETE" });
        setStatus("Gallery deleted.");
        await loadArchive();
      });

      photoManager.addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.target.closest(".photo-manage-form");

        if (!form) {
          return;
        }

        const data = new FormData(form);
        setStatus("Saving image...");
        await requestJson("/api/photos/" + encodeURIComponent(form.dataset.photoId), {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            galleryId: data.get("galleryId"),
            title: data.get("title"),
            caption: data.get("caption"),
            tags: data.get("tags")
          })
        });
        setStatus("Image saved.");
        await loadArchive();
      });

      photoManager.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-delete-photo]");

        if (!button) {
          return;
        }

        const photo = archive.photos.find((item) => item.id === button.dataset.deletePhoto);

        if (!confirm("Delete " + (photo?.title || "this image") + "?")) {
          return;
        }

        setStatus("Deleting image...");
        await requestJson("/api/photos/" + encodeURIComponent(button.dataset.deletePhoto), { method: "DELETE" });
        setStatus("Image deleted.");
        await loadArchive();
      });

      logoutButton.addEventListener("click", async () => {
        await fetch("/api/logout", { method: "POST" });
        location.href = "/admin";
      });

      toolbarLogoutButton.addEventListener("click", async () => {
        await fetch("/api/logout", { method: "POST" });
        location.href = "/admin";
      });

      refreshButton.addEventListener("click", async () => {
        setStatus("Refreshing archive...");
        await loadArchive();
        setStatus("Archive refreshed.");
      });

      loadArchive().catch((error) => {
        status.textContent = error.message;
      });
    </script>
  </body>
</html>`;
}
