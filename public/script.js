const gallery = document.querySelector("#gallery");
const tabs = document.querySelector("#galleryTabs");
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
      const caption = card.dataset.caption || "Add photo details here.";

      lightboxTitle.textContent = title;
      lightboxCaption.textContent = caption;

      if (card.dataset.image) {
        lightboxImage.style.backgroundImage = `url("${card.dataset.image}")`;
        lightboxImage.style.backgroundPosition = "center";
      } else {
        lightboxImage.style.backgroundImage = "";
        lightboxImage.style.backgroundPosition = getComputedStyle(frame).backgroundPosition;
      }

      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      }
    });
  });
}

function renderGalleryTabs(galleries, activeId) {
  if (!galleries.length) {
    tabs.hidden = true;
    return;
  }

  tabs.hidden = false;
  tabs.replaceChildren();

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.textContent = "All";
  allButton.className = activeId === "all" ? "active" : "";
  allButton.addEventListener("click", () => renderArchive("all"));
  tabs.append(allButton);

  galleries.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.title;
    button.className = activeId === item.id ? "active" : "";
    button.addEventListener("click", () => renderArchive(item.id));
    tabs.append(button);
  });
}

let archiveState = null;

function renderArchive(activeId = "all") {
  if (!archiveState?.photos?.length) {
    wireCards();
    return;
  }

  const galleries = archiveState.galleries || [];
  const galleryLookup = new Map(galleries.map((item) => [item.id, item]));
  const photos = activeId === "all"
    ? archiveState.photos
    : archiveState.photos.filter((photo) => photo.galleryId === activeId);

  renderGalleryTabs(galleries, activeId);
  gallery.replaceChildren();

  photos.forEach((photo) => {
    const card = document.createElement("button");
    const frame = document.createElement("span");
    const meta = document.createElement("span");
    const title = document.createElement("strong");
    const detail = document.createElement("small");
    const galleryTitle = galleryLookup.get(photo.galleryId)?.title || "Family Archive";

    card.className = "photo-card";
    card.type = "button";
    card.dataset.title = photo.title || "Family Photo";
    card.dataset.caption = photo.caption || galleryTitle;
    card.dataset.image = photo.url;

    frame.className = "photo-frame uploaded-frame";
    frame.style.backgroundImage = `url("${photo.url}")`;

    meta.className = "photo-meta";
    title.textContent = photo.title || "Family Photo";
    detail.textContent = galleryTitle;

    meta.append(title, detail);
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
