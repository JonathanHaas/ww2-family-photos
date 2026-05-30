const gallery = document.querySelector("#gallery");
const tabs = document.querySelector("#galleryTabs");
const tagTabs = document.querySelector("#tagTabs");
const lightbox = document.querySelector("#photoLightbox");
const closeButton = document.querySelector(".close-button");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxImage = document.querySelector(".lightbox-image");

function wireCards() {
  const cards = document.querySelectorAll(".photo-card");

  cards.forEach((card) => {
    if (card.dataset.wired === "true") {
      return;
    }

    card.dataset.wired = "true";
    card.addEventListener("click", () => {
      const frame = card.querySelector(".photo-frame");
      const title = card.dataset.title || "Family Photo";
      const altText = card.dataset.alt || title;
      const caption = card.dataset.caption || "Add photo details here.";
      const tags = card.dataset.tags ? card.dataset.tags.split(",").filter(Boolean) : [];

      lightboxTitle.textContent = title;
      lightboxCaption.replaceChildren(document.createTextNode(caption));

      if (tags.length) {
        const tagList = document.createElement("span");
        tagList.className = "tag-list lightbox-tags";
        tags.forEach((tag) => {
          const span = document.createElement("span");
          span.textContent = tag;
          tagList.append(span);
        });
        lightboxCaption.append(document.createElement("br"), tagList);
      }

      if (card.dataset.image) {
        lightboxImage.replaceChildren();
        const image = document.createElement("img");
        image.src = card.dataset.image;
        image.alt = altText;
        lightboxImage.append(image);
        lightboxImage.style.backgroundImage = "";
      } else {
        lightboxImage.replaceChildren();
        lightboxImage.style.backgroundImage = "";
        lightboxImage.style.backgroundPosition = getComputedStyle(frame).backgroundPosition;
      }

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      }
    });
  });
}

function renderButtonList(container, items, activeId, onSelect) {
  container.replaceChildren();

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label;
    button.className = activeId === item.id ? "active" : "";
    button.addEventListener("click", () => onSelect(item.id));
    container.append(button);
  });
}

function tagsForPhotos(photos) {
  return [...new Set(photos.flatMap((photo) => photo.tags || []))].sort();
}

function photoDisplayKey(photo) {
  const title = (photo.title || "").trim().toLowerCase();
  const caption = (photo.caption || "").trim().toLowerCase();
  const tags = [...(photo.tags || [])].sort().join("|");
  const source = (photo.source || "").trim().toLowerCase();
  const metadataKey = [photo.galleryId, title, caption, tags, source].join("::");

  if (title || caption || tags || source) {
    return metadataKey;
  }

  return photo.url || photo.id;
}

function uniquePhotos(photos) {
  const seen = new Set();
  return photos.filter((photo) => {
    const key = photoDisplayKey(photo);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function renderGalleryTabs(galleries, activeGalleryId, activeTag, availableTags) {
  if (!galleries.length) {
    tabs.hidden = true;
  } else {
    tabs.hidden = false;
    renderButtonList(
      tabs,
      [{ id: "all", label: "All" }, ...galleries.map((item) => ({ id: item.id, label: item.title }))],
      activeGalleryId,
      (id) => renderArchive(id, activeTag)
    );
  }

  if (!availableTags.length) {
    tagTabs.hidden = true;
  } else {
    tagTabs.hidden = false;
    renderButtonList(
      tagTabs,
      [{ id: "all", label: "All tags" }, ...availableTags.map((tag) => ({ id: tag, label: tag }))],
      activeTag,
      (tag) => renderArchive(activeGalleryId, tag)
    );
  }
}

let archiveState = null;

function cssUrl(value) {
  return `url("${String(value).replace(/"/g, '\\"')}")`;
}

function applyPosterImage(poster) {
  if (!poster?.url) {
    return;
  }

  const posterUrl = cssUrl(poster.url);
  document.documentElement.style.setProperty("--archive-bg", posterUrl);
  document.documentElement.style.setProperty("--collage-photo-one", posterUrl);
}

function renderArchive(activeGalleryId = "all", activeTag = "all") {
  if (!archiveState?.photos?.length) {
    wireCards();
    return;
  }

  const galleries = archiveState.galleries || [];
  const galleryLookup = new Map(galleries.map((item) => [item.id, item]));
  const galleryPhotos = archiveState.photos.filter((photo) => activeGalleryId === "all" || photo.galleryId === activeGalleryId);
  const availableTags = tagsForPhotos(galleryPhotos);
  const selectedTag = activeTag === "all" || availableTags.includes(activeTag) ? activeTag : "all";
  const photos = uniquePhotos(galleryPhotos.filter((photo) => {
    const tagMatches = selectedTag === "all" || (photo.tags || []).includes(selectedTag);
    return tagMatches;
  }));

  renderGalleryTabs(galleries, activeGalleryId, selectedTag, availableTags);
  gallery.replaceChildren();

  if (!photos.length) {
    const empty = document.createElement("p");
    empty.className = "empty-gallery";
    empty.textContent = "No photos match those filters yet.";
    gallery.append(empty);
    return;
  }

  photos.forEach((photo) => {
    const card = document.createElement("button");
    const frame = document.createElement("span");
    const meta = document.createElement("span");
    const title = document.createElement("strong");
    const detail = document.createElement("small");
    const galleryTitle = galleryLookup.get(photo.galleryId)?.title || "Family Archive";

    card.className = "photo-card photo-card-uploaded";
    card.type = "button";
    card.dataset.title = photo.title || "Family Photo";
    card.dataset.caption = photo.caption || galleryTitle;
    card.dataset.image = photo.url;
    card.dataset.alt = photo.altText || photo.title || galleryTitle;
    card.dataset.tags = (photo.tags || []).join(",");
    card.setAttribute("aria-label", `Open photo: ${card.dataset.alt}`);

    frame.className = "photo-frame uploaded-frame";
    frame.setAttribute("role", "img");
    frame.setAttribute("aria-label", card.dataset.alt);
    frame.style.backgroundImage = `url("${photo.url}")`;

    meta.className = "photo-meta";
    title.textContent = photo.title || "Family Photo";
    detail.textContent = galleryTitle;
    meta.append(title, detail);

    if (photo.tags?.length) {
      const tagList = document.createElement("span");
      tagList.className = "tag-list";
      photo.tags.forEach((tag) => {
        const span = document.createElement("span");
        span.textContent = tag;
        tagList.append(span);
      });
      meta.append(tagList);
    }

    card.append(frame, meta);
    gallery.append(card);
  });

  wireCards();
}

async function loadArchive() {
  try {
    const response = await fetch("/api/galleries");
    if (!response.ok) {
      throw new Error("Gallery request failed");
    }

    archiveState = await response.json();
    applyPosterImage(archiveState.poster);
    renderArchive("all");
  } catch (error) {
    console.warn("Using placeholder gallery", error);
    wireCards();
  }
}

wireCards();
void loadArchive();

closeButton.addEventListener("click", () => {
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.open) {
    lightbox.close();
  }
});
