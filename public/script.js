const cards = document.querySelectorAll(".photo-card");
const lightbox = document.querySelector("#photoLightbox");
const closeButton = document.querySelector(".close-button");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxImage = document.querySelector(".lightbox-image");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const frame = card.querySelector(".photo-frame");
    const title = card.dataset.title || "Family Photo";
    const caption = card.dataset.caption || "Add photo details here.";

    lightboxTitle.textContent = title;
    lightboxCaption.textContent = caption;
    lightboxImage.style.backgroundPosition = getComputedStyle(frame).backgroundPosition;

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    }
  });
});

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
