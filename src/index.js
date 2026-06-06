const MANIFEST_KEY = "metadata/archive.json";
const SESSION_COOKIE = "archive_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DEFAULT_GALLERY_ID = "family-archive";
const DEFAULT_GALLERY = {
  id: DEFAULT_GALLERY_ID,
  title: "Family Archive",
  description: "Shared family photos organized by tags.",
  createdAt: "2026-06-06T00:00:00.000Z"
};
const SOURCE_GALLERY_ID = "national-archives";
const SOURCE_GALLERY = {
  id: SOURCE_GALLERY_ID,
  title: "National Archives",
  description: "Public-domain World War II source photos from the National Archives.",
  createdAt: "2026-05-30T00:00:00.000Z",
  source: "National Archives"
};
const FAMILY_SCANS_GALLERY_ID = "family-scans";
const FAMILY_SCANS_GALLERY = {
  id: FAMILY_SCANS_GALLERY_ID,
  title: "Family Scans",
  description: "Individual photos cropped from family source scans. Details can be updated as names, dates, and locations are confirmed.",
  createdAt: "2026-06-05T00:00:00.000Z",
  source: "Family scan"
};
const SOURCE_PHOTOS = [
  {
    id: "source-national-archives-ww2-42",
    galleryId: SOURCE_GALLERY_ID,
    title: "Wartime Source Photo 42",
    caption: "Public-domain World War II photograph from the National Archives.",
    altText: "Black and white World War II source photograph from the National Archives.",
    tags: ["source", "ww2", "national archives"],
    url: "https://www.archives.gov/files/research/military/ww2/photos/images/ww2-42.jpg",
    source: "National Archives",
    createdAt: "2026-05-30T00:00:00.000Z"
  },
  {
    id: "source-national-archives-ww2-50",
    galleryId: SOURCE_GALLERY_ID,
    title: "Wartime Source Photo 50",
    caption: "Public-domain World War II photograph from the National Archives.",
    altText: "Black and white World War II source photograph from the National Archives.",
    tags: ["source", "ww2", "national archives"],
    url: "https://www.archives.gov/files/research/military/ww2/photos/images/ww2-50.jpg",
    source: "National Archives",
    createdAt: "2026-05-30T00:00:00.000Z"
  },
  {
    id: "source-national-archives-ww2-64",
    galleryId: SOURCE_GALLERY_ID,
    title: "Wartime Source Photo 64",
    caption: "Public-domain World War II photograph from the National Archives.",
    altText: "Black and white World War II source photograph from the National Archives.",
    tags: ["source", "ww2", "national archives"],
    url: "https://www.archives.gov/files/research/military/ww2/photos/images/ww2-64.jpg",
    source: "National Archives",
    createdAt: "2026-05-30T00:00:00.000Z"
  },
  {
    id: "source-national-archives-ww2-90",
    galleryId: SOURCE_GALLERY_ID,
    title: "Wartime Source Photo 90",
    caption: "Public-domain World War II photograph from the National Archives.",
    altText: "Black and white World War II source photograph from the National Archives.",
    tags: ["source", "ww2", "national archives"],
    url: "https://www.archives.gov/files/research/military/ww2/photos/images/ww2-90.jpg",
    source: "National Archives",
    createdAt: "2026-05-30T00:00:00.000Z"
  },
  {
    id: "source-national-archives-ww2-111",
    galleryId: SOURCE_GALLERY_ID,
    title: "Wartime Source Photo 111",
    caption: "Public-domain World War II photograph from the National Archives.",
    altText: "Black and white World War II source photograph from the National Archives.",
    tags: ["source", "ww2", "national archives"],
    url: "https://www.archives.gov/files/research/military/ww2/photos/images/ww2-111.jpg",
    source: "National Archives",
    createdAt: "2026-05-30T00:00:00.000Z"
  }
];
const FAMILY_SCAN_PHOTOS = [
  {
    id: "family-scan-service-portrait",
    galleryId: FAMILY_SCANS_GALLERY_ID,
    title: "Service Portrait",
    caption: "Default metadata from the family scan. Add the service member's name, branch, date, and location when confirmed.",
    altText: "Black and white service portrait of a uniformed World War II serviceman.",
    tags: ["family scan", "ww2", "portrait", "service"],
    url: "/assets/family-scans/service-portrait.jpg",
    source: "Family scan",
    createdAt: "2026-06-05T00:00:00.000Z"
  },
  {
    id: "family-scan-flags-on-deck",
    galleryId: FAMILY_SCANS_GALLERY_ID,
    title: "Flags On Deck",
    caption: "Default metadata from the family scan. Several sailors or servicemen stand on deck holding Japanese flags.",
    altText: "Black and white photo of servicemen standing on a ship deck with Japanese flags.",
    tags: ["family scan", "ww2", "ship", "flags"],
    url: "/assets/family-scans/flags-on-deck.jpg",
    source: "Family scan",
    createdAt: "2026-06-05T00:00:00.000Z"
  },
  {
    id: "family-scan-army-boat-ps-134",
    galleryId: FAMILY_SCANS_GALLERY_ID,
    title: "U.S. Army PS-134 Boat",
    caption: "Default metadata from the family scan. A U.S. Army boat marked PS-134 sits on the water.",
    altText: "Black and white photo of a U.S. Army PS-134 boat on the water.",
    tags: ["family scan", "ww2", "boat", "army"],
    url: "/assets/family-scans/army-boat-ps-134.jpg",
    source: "Family scan",
    createdAt: "2026-06-05T00:00:00.000Z"
  },
  {
    id: "family-scan-deck-gun",
    galleryId: FAMILY_SCANS_GALLERY_ID,
    title: "Deck Gun",
    caption: "Default metadata from the family scan. A serviceman sits beside a large mounted gun aboard a vessel.",
    altText: "Black and white photo of a serviceman seated beside a mounted deck gun.",
    tags: ["family scan", "ww2", "ship", "equipment"],
    url: "/assets/family-scans/deck-gun.jpg",
    source: "Family scan",
    createdAt: "2026-06-05T00:00:00.000Z"
  },
  {
    id: "family-scan-flags-group",
    galleryId: FAMILY_SCANS_GALLERY_ID,
    title: "Group With Flags",
    caption: "Default metadata from the family scan. A group poses outdoors with Japanese flags near the water.",
    altText: "Black and white photo of a group of servicemen posing with Japanese flags near the water.",
    tags: ["family scan", "ww2", "group", "flags"],
    url: "/assets/family-scans/flags-group.jpg",
    source: "Family scan",
    createdAt: "2026-06-05T00:00:00.000Z"
  },
  {
    id: "family-scan-soldier-in-field",
    galleryId: FAMILY_SCANS_GALLERY_ID,
    title: "Soldier In Field",
    caption: "Default metadata from the family scan. A helmeted serviceman stands in tall grass holding equipment.",
    altText: "Black and white photo of a helmeted serviceman standing in a field with equipment.",
    tags: ["family scan", "ww2", "field", "soldier"],
    url: "/assets/family-scans/soldier-in-field.jpg",
    source: "Family scan",
    createdAt: "2026-06-05T00:00:00.000Z"
  },
  {
    id: "family-scan-shoreline-vehicle",
    galleryId: FAMILY_SCANS_GALLERY_ID,
    title: "Shoreline Vehicle",
    caption: "Default metadata from the family scan. Servicemen are gathered around a vehicle or landing craft near the shoreline.",
    altText: "Black and white photo of servicemen around a vehicle or landing craft near a shoreline.",
    tags: ["family scan", "ww2", "shoreline", "vehicle"],
    url: "/assets/family-scans/shoreline-vehicle.jpg",
    source: "Family scan",
    createdAt: "2026-06-05T00:00:00.000Z"
  }
];

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

      if (url.pathname === "/api/poster" && request.method === "PUT") {
        await requireAdmin(request, env);
        return await handleSetPoster(request, env);
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
  await Promise.all(deletedPhotos
    .filter((photo) => photo.key)
    .map((photo) => env.ARCHIVE_KV.delete(photo.key)));
  if (deletedPhotos.some((photo) => photo.id === manifest.posterPhotoId)) {
    manifest.posterPhotoId = "";
  }
  manifest.galleries = manifest.galleries.filter((item) => item.id !== galleryId);
  manifest.photos = manifest.photos.filter((photo) => photo.galleryId !== galleryId);
  await saveManifest(env, manifest);

  return jsonResponse({ ok: true, deletedPhotos: deletedPhotos.length });
}

async function handleUploadPhoto(request, env) {
  const form = await request.formData();
  const galleryId = cleanText(form.get("galleryId"), 90) || DEFAULT_GALLERY_ID;
  const title = cleanText(form.get("title"), 100) || "Untitled Photo";
  const caption = cleanText(form.get("caption"), 280);
  const altText = cleanText(form.get("altText"), 220);
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
    altText,
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
  const requestedGalleryId = cleanText(body?.galleryId, 90);
  const title = cleanText(body?.title, 100) || "Untitled Photo";
  const caption = cleanText(body?.caption, 280);
  const altText = cleanText(body?.altText, 220);
  const tags = parseTags(body?.tags);

  if (!photoId) {
    throw new HttpError(400, "Photo id is required.");
  }

  const manifest = await getManifest(env);
  const photo = manifest.photos.find((item) => item.id === photoId);
  const galleryId = requestedGalleryId || photo?.galleryId || DEFAULT_GALLERY_ID;
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
  photo.altText = altText;
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

  if (photo.key) {
    await env.ARCHIVE_KV.delete(photo.key);
  }

  manifest.photos = manifest.photos.filter((item) => item.id !== photoId);
  if (manifest.posterPhotoId === photoId) {
    manifest.posterPhotoId = "";
  }
  await saveManifest(env, manifest);

  return jsonResponse({ ok: true });
}

async function handleSetPoster(request, env) {
  const body = await request.json().catch(() => null);
  const photoId = cleanText(body?.photoId, 120);

  if (!photoId) {
    throw new HttpError(400, "Photo id is required.");
  }

  const manifest = await getManifest(env);
  const photo = manifest.photos.find((item) => item.id === photoId);

  if (!photo) {
    throw new HttpError(404, "Photo not found.");
  }

  manifest.posterPhotoId = photoId;
  manifest.updatedAt = new Date().toISOString();
  await saveManifest(env, manifest);

  return jsonResponse({ poster: publicPhoto(photo) });
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
  const posterPhoto = manifest.photos.find((photo) => photo.id === manifest.posterPhotoId);
  return {
    galleries: manifest.galleries,
    photos: manifest.photos.map(publicPhoto),
    poster: posterPhoto ? publicPhoto(posterPhoto) : null
  };
}

function publicPhoto(photo) {
  return {
    id: photo.id,
    galleryId: photo.galleryId,
    title: photo.title,
    caption: photo.caption,
    altText: altTextForPhoto(photo),
    tags: Array.isArray(photo.tags) ? photo.tags : [],
    source: photo.source || "",
    createdAt: photo.createdAt,
    url: photo.url || `/photo/${encodeURIComponent(photo.key)}`
  };
}

function altTextForPhoto(photo) {
  const explicitAlt = cleanText(photo.altText, 220);

  if (explicitAlt) {
    return explicitAlt;
  }

  const title = cleanText(photo.title, 100);
  const caption = cleanText(photo.caption, 160);

  if (title && caption) {
    return `${title}. ${caption}`;
  }

  return title || caption || "Family archive photo";
}

async function getManifest(env) {
  const storedManifest = await env.ARCHIVE_KV.get(MANIFEST_KEY, { type: "json" });
  const manifest = {
    galleries: Array.isArray(storedManifest?.galleries) ? storedManifest.galleries : [],
    photos: Array.isArray(storedManifest?.photos) ? storedManifest.photos : [],
    posterPhotoId: typeof storedManifest?.posterPhotoId === "string" ? storedManifest.posterPhotoId : "",
    seededSources: Boolean(storedManifest?.seededSources),
    seededFamilyScans: Boolean(storedManifest?.seededFamilyScans)
  };

  let shouldSave = false;

  if (!manifest.seededSources) {
    seedSourcePhotos(manifest);
    shouldSave = true;
  }

  if (!manifest.seededFamilyScans) {
    seedFamilyScanPhotos(manifest);
    shouldSave = true;
  }

  if (ensureDefaultGallery(manifest)) {
    shouldSave = true;
  }

  if (shouldSave) {
    await saveManifest(env, manifest);
  }

  return manifest;
}

async function saveManifest(env, manifest) {
  await env.ARCHIVE_KV.put(MANIFEST_KEY, JSON.stringify(manifest, null, 2));
}

function seedSourcePhotos(manifest) {
  ensureDefaultGallery(manifest);

  if (!manifest.galleries.some((gallery) => gallery.id === SOURCE_GALLERY_ID)) {
    manifest.galleries.push({ ...SOURCE_GALLERY });
  }

  const existingPhotoIds = new Set(manifest.photos.map((photo) => photo.id));
  const missingPhotos = SOURCE_PHOTOS
    .filter((photo) => !existingPhotoIds.has(photo.id))
    .map((photo) => ({ ...photo, tags: [...photo.tags] }));
  manifest.photos.push(...missingPhotos);
  manifest.seededSources = true;
}

function seedFamilyScanPhotos(manifest) {
  ensureDefaultGallery(manifest);

  if (!manifest.galleries.some((gallery) => gallery.id === FAMILY_SCANS_GALLERY_ID)) {
    manifest.galleries.unshift({ ...FAMILY_SCANS_GALLERY });
  }

  const existingPhotoIds = new Set(manifest.photos.map((photo) => photo.id));
  const missingPhotos = FAMILY_SCAN_PHOTOS
    .filter((photo) => !existingPhotoIds.has(photo.id))
    .map((photo) => ({ ...photo, tags: [...photo.tags] }));
  manifest.photos.unshift(...missingPhotos);
  manifest.seededFamilyScans = true;
}

function ensureDefaultGallery(manifest) {
  if (!manifest.galleries.some((gallery) => gallery.id === DEFAULT_GALLERY_ID)) {
    manifest.galleries.unshift({ ...DEFAULT_GALLERY });
    return true;
  }

  return false;
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
        <a class="admin-tool-button" href="#uploadImage">Upload Image</a>
        <a class="admin-tool-button" href="#manageImages">Images</a>
        <button class="admin-tool-button" id="refreshButton" type="button">Refresh</button>
        <button class="admin-tool-button danger" id="toolbarLogoutButton" type="button">Sign Out</button>
      </nav>
    </header>
    <main class="admin-shell admin-image-workspace">
      <section class="admin-panel image-panel">
        <p class="kicker">Images</p>
        <h1>Upload</h1>
        <form class="admin-form" id="photoForm">
          <div class="admin-section-anchor" id="uploadImage"></div>
          <label class="admin-field">
            <span>Photo title</span>
            <input name="title" maxlength="100" required />
          </label>
          <label class="admin-field">
            <span>Caption</span>
            <textarea name="caption" maxlength="280"></textarea>
          </label>
          <label class="admin-field">
            <span>Alt text</span>
            <textarea name="altText" maxlength="220" placeholder="Describe the image for screen readers."></textarea>
          </label>
          <label class="admin-field">
            <span>Tags</span>
            <input name="tags" id="uploadTags" maxlength="180" placeholder="fred, uniform, letters" />
          </label>
          <div class="admin-tag-picker" id="uploadTagPicker" aria-label="Existing tags"></div>
          <label class="admin-field">
            <span>Photo</span>
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
          </label>
          <div class="admin-actions">
            <button class="admin-button image-button" type="submit">Upload Image</button>
            <a class="admin-button secondary" href="/">View Site</a>
            <button class="admin-button secondary" id="logoutButton" type="button">Sign Out</button>
          </div>
          <p class="admin-status" id="status"></p>
        </form>

        <div class="admin-manager">
          <div class="admin-section-anchor" id="manageImages"></div>
          <div class="admin-section-heading">
            <p class="kicker">Manage</p>
            <h2>Images</h2>
          </div>
          <div class="admin-filterbar" aria-label="Image filters">
            <label class="admin-field">
              <span>Search</span>
              <input id="imageSearch" type="search" placeholder="Search title, caption, tags" />
            </label>
            <label class="admin-field">
              <span>Show</span>
              <select id="imageQualityFilter">
                <option value="all">All images</option>
                <option value="untagged">Needs tags</option>
                <option value="missing-alt">Needs alt text</option>
              </select>
            </label>
            <div class="admin-chip-row" id="imageTagFilter" aria-label="Filter by tag"></div>
          </div>
          <div class="admin-list image-list" id="photoManager"></div>
        </div>
      </section>
    </main>
    <script>
      const photoForm = document.querySelector("#photoForm");
      const uploadTags = document.querySelector("#uploadTags");
      const uploadTagPicker = document.querySelector("#uploadTagPicker");
      const imageSearch = document.querySelector("#imageSearch");
      const imageQualityFilter = document.querySelector("#imageQualityFilter");
      const imageTagFilter = document.querySelector("#imageTagFilter");
      const photoManager = document.querySelector("#photoManager");
      const status = document.querySelector("#status");
      const logoutButton = document.querySelector("#logoutButton");
      const toolbarLogoutButton = document.querySelector("#toolbarLogoutButton");
      const refreshButton = document.querySelector("#refreshButton");
      let archive = { galleries: [], photos: [], poster: null };
      let selectedImageTag = "all";

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

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, (character) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[character]);
      }

      function tagList(value) {
        return [...new Set(String(value || "")
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean))]
          .slice(0, 12);
      }

      function allTags() {
        return [...new Set(archive.photos.flatMap((photo) => photo.tags || []))].sort();
      }

      function setInputTags(input, tags) {
        input.value = [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].join(", ");
      }

      function renderTagPicker(container, input) {
        const currentTags = tagList(input.value);
        const tags = allTags().filter((tag) => !currentTags.includes(tag));
        container.replaceChildren();

        if (!tags.length) {
          return;
        }

        tags.forEach((tag) => {
          const button = document.createElement("button");
          button.className = "tag-suggestion";
          button.type = "button";
          button.textContent = tag;
          button.addEventListener("click", () => {
            setInputTags(input, [...tagList(input.value), tag]);
            renderTagPicker(container, input);
          });
          container.append(button);
        });
      }

      function renderImageFilters() {
        const tags = allTags();
        imageTagFilter.replaceChildren();

        const allButton = document.createElement("button");
        allButton.type = "button";
        allButton.className = selectedImageTag === "all" ? "active" : "";
        allButton.textContent = "All tags";
        allButton.addEventListener("click", () => {
          selectedImageTag = "all";
          renderArchive();
        });
        imageTagFilter.append(allButton);

        tags.forEach((tag) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = selectedImageTag === tag ? "active" : "";
          button.textContent = tag;
          button.addEventListener("click", () => {
            selectedImageTag = tag;
            renderArchive();
          });
          imageTagFilter.append(button);
        });
      }

      function filteredPhotos() {
        const query = imageSearch.value.trim().toLowerCase();
        const quality = imageQualityFilter.value;

        return archive.photos.filter((photo) => {
          const tags = photo.tags || [];
          const searchable = [
            photo.title,
            photo.caption,
            photo.altText,
            photo.source,
            tags.join(" ")
          ].join(" ").toLowerCase();

          if (selectedImageTag !== "all" && !tags.includes(selectedImageTag)) {
            return false;
          }

          if (quality === "untagged" && tags.length) {
            return false;
          }

          if (quality === "missing-alt" && String(photo.altText || "").trim()) {
            return false;
          }

          return !query || searchable.includes(query);
        });
      }

      function renderArchive() {
        photoManager.replaceChildren();
        renderTagPicker(uploadTagPicker, uploadTags);
        renderImageFilters();

        if (!archive.photos.length) {
          photoManager.textContent = "No images yet.";
          return;
        }

        const photos = filteredPhotos();

        if (!photos.length) {
          photoManager.textContent = "No images match those filters.";
          return;
        }

        photos.forEach((photo) => {
          const item = document.createElement("article");
          item.className = "photo-manage-item";
          const isPoster = archive.poster?.id === photo.id;
          const sourceLabel = photo.source ? "<small class=\\"source-label\\">Source: " + escapeHtml(photo.source) + "</small>" : "";
          const posterLabel = isPoster ? "<small class=\\"source-label poster-label\\">Current hero poster</small>" : "";
          const posterButtonText = isPoster ? "Hero Poster" : "Set as Hero";
          item.innerHTML = "<div><img class=\\"admin-thumb\\" src=\\"" + photo.url + "\\" alt=\\"\\" loading=\\"lazy\\" />" + posterLabel + sourceLabel + "</div>" +
            "<form class=\\"manage-form photo-manage-form\\" data-photo-id=\\"" + photo.id + "\\">" +
            "<label class=\\"admin-field\\"><span>Title</span><input name=\\"title\\" maxlength=\\"100\\" required /></label>" +
            "<label class=\\"admin-field\\"><span>Caption</span><textarea name=\\"caption\\" maxlength=\\"280\\"></textarea></label>" +
            "<label class=\\"admin-field\\"><span>Alt text</span><textarea name=\\"altText\\" maxlength=\\"220\\"></textarea></label>" +
            "<label class=\\"admin-field\\"><span>Tags</span><input name=\\"tags\\" maxlength=\\"180\\" /></label>" +
            "<div class=\\"admin-tag-picker\\" data-tag-picker aria-label=\\"Existing tags\\"></div>" +
            "<div class=\\"admin-actions\\"><button class=\\"admin-button\\" type=\\"submit\\">Save Image</button>" +
            "<button class=\\"admin-button secondary poster\\" data-set-poster=\\"" + photo.id + "\\" type=\\"button\\">" + posterButtonText + "</button>" +
            "<button class=\\"admin-button secondary danger\\" data-delete-photo=\\"" + photo.id + "\\" type=\\"button\\">Delete Image</button></div>" +
            "</form>";
          item.querySelector(".admin-thumb").alt = photo.altText || photo.title || "Archive image";
          item.querySelector("[name=title]").value = photo.title || "";
          item.querySelector("[name=caption]").value = photo.caption || "";
          item.querySelector("[name=altText]").value = photo.altText || "";
          item.querySelector("[name=tags]").value = (photo.tags || []).join(", ");
          renderTagPicker(item.querySelector("[data-tag-picker]"), item.querySelector("[name=tags]"));
          photoManager.append(item);
        });
      }

      async function loadArchive() {
        archive = await requestJson("/api/admin");
        renderArchive();
      }

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
            title: data.get("title"),
            caption: data.get("caption"),
            altText: data.get("altText"),
            tags: data.get("tags")
          })
        });
        setStatus("Image saved.");
        await loadArchive();
      });

      photoManager.addEventListener("input", (event) => {
        const input = event.target.closest("[name=tags]");

        if (!input) {
          return;
        }

        const picker = input.closest("form")?.querySelector("[data-tag-picker]");

        if (picker) {
          renderTagPicker(picker, input);
        }
      });

      photoManager.addEventListener("click", async (event) => {
        const posterButton = event.target.closest("[data-set-poster]");

        if (posterButton) {
          const photo = archive.photos.find((item) => item.id === posterButton.dataset.setPoster);
          const currentTitle = archive.poster?.title || "the current hero poster image";
          const nextTitle = photo?.title || "this image";
          const message = archive.poster?.id === posterButton.dataset.setPoster
            ? nextTitle + " is already the hero poster image. Set it again?"
            : "This will overwrite " + currentTitle + " as the current hero poster image. Continue?";

          if (!confirm(message)) {
            return;
          }

          setStatus("Setting hero poster...");
          await requestJson("/api/poster", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ photoId: posterButton.dataset.setPoster })
          });
          setStatus("Hero poster updated.");
          await loadArchive();
          return;
        }

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

      uploadTags.addEventListener("input", () => {
        renderTagPicker(uploadTagPicker, uploadTags);
      });

      imageSearch.addEventListener("input", renderArchive);
      imageQualityFilter.addEventListener("change", renderArchive);

      loadArchive().catch((error) => {
        status.textContent = error.message;
      });
    </script>
  </body>
</html>`;
}
