document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector("[data-rules-carousel]");
  const track = document.querySelector("[data-rules-track]");
  const modal = document.querySelector("[data-rule-modal]");

  if (!track || !modal) {
    console.log("Dan Gian frontend scaffold loaded.");
    return;
  }

  const cards = Array.from(track.querySelectorAll(".rule-card"));
  const modalTitle = document.getElementById("rule-modal-title");
  const modalImage = document.getElementById("rule-modal-image");
  const modalContent = document.getElementById("rule-modal-content");
  const closeTargets = modal.querySelectorAll("[data-rule-modal-close]");
  let swiper = null;
  const imagePreloadCache = new Map();
  const HOVER_SLIDE_DELAY_MS = 180;

  const backImageByGame = {
    "Ô Ăn Quan": "../assets/images/mat-sau/o-an-quan.png",
    "Đánh đu": "../assets/images/mat-sau/danh-du.png",
    "Đi cà kheo": "../assets/images/mat-sau/di-ca-kheo.png",
    "Kéo cưa lừa xẻ": "../assets/images/mat-sau/keo-cua-lua-xe.png",
    "Rồng rắn lên mây": "../assets/images/mat-sau/rong-ran-len-may.png",
    "Đập niêu đất": "../assets/images/mat-sau/dap-nieu-dat.png",
    "Đẩy gậy": "../assets/images/mat-sau/day-gay.png",
    "Ném còn": "../assets/images/mat-sau/nem-con.png",
    "Nu na nu nống": "../assets/images/mat-sau/nu-na-nu-nong.png",
    "Nhảy sạp": "../assets/images/mat-sau/nhay-sap.png",
    "Nhảy bao bố": "../assets/images/mat-sau/nhay-bao-bo.png",
    "Mèo đuổi chuột": "../assets/images/mat-sau/meo-duoi-chuot.png",
    "Cướp cờ": "../assets/images/mat-sau/cuop-co.png",
    "Cá sấu lên bờ": "../assets/images/mat-sau/ca-sau-len-bo.png",
    "Chơi chuyền": "../assets/images/mat-sau/choi-chuyen.png",
    "Chi chi chành chành": "../assets/images/mat-sau/chi-chi-chanh-chanh.png",
    "Bịt mắt bắt dê": "../assets/images/mat-sau/bit-mat-bat-de.png",
    "Tàu hỏa": "../assets/images/mat-sau/tau-hoa.png",
    "Thả đỉa ba ba": "../assets/images/mat-sau/tha-dia-ba-ba.png",
  };

  const preloadImage = (src) => {
    if (!src) {
      return Promise.resolve();
    }

    if (imagePreloadCache.has(src)) {
      return imagePreloadCache.get(src);
    }

    const preloadTask = new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });

    imagePreloadCache.set(src, preloadTask);
    return preloadTask;
  };

  const primeBackImages = () => {
    const sources = Object.values(backImageByGame);
    sources.forEach((src) => {
      preloadImage(src);
    });
  };

  const openModal = (card) => {
    const cardImage = card.querySelector(".rule-image");
    const gameName = (cardImage && cardImage.alt ? cardImage.alt.trim() : "") || card.dataset.title || "Chi tiet luat choi";
    const backImagePath = backImageByGame[gameName];

    modalTitle.textContent = gameName;
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    if (modalImage) {
      modalImage.alt = `Mat sau the luat choi ${gameName}`;

      if (backImagePath) {
        modalImage.classList.remove("is-ready");
        modalImage.onload = () => {
          modalImage.classList.add("is-ready");
        };
        modalImage.onerror = () => {
          modalImage.classList.remove("is-ready");
        };
        modalImage.src = backImagePath;
        modalImage.hidden = false;
        modalContent.hidden = true;

        preloadImage(backImagePath);
      } else {
        modalImage.removeAttribute("src");
        modalImage.classList.remove("is-ready");
        modalImage.hidden = true;
        modalContent.textContent = card.dataset.detail || "Chua co anh mat sau cho the nay.";
        modalContent.hidden = false;
      }
    }
  };

  const closeModal = () => {
    if (modalImage) {
      modalImage.classList.remove("is-ready");
    }
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  const bindCardActions = () => {
    cards.forEach((card, index) => {
      const slide = card.closest(".swiper-slide");
      let hoverTimer = null;

      if (slide) {
        slide.addEventListener("pointerenter", () => {
          if (!swiper || window.innerWidth < 768 || swiper.activeIndex === index) {
            return;
          }

          hoverTimer = window.setTimeout(() => {
            if (swiper && swiper.activeIndex !== index) {
              swiper.slideTo(index, 500);
            }
          }, HOVER_SLIDE_DELAY_MS);
        });

        slide.addEventListener("pointerleave", () => {
          if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
          }
        });
      }

      card.addEventListener("click", () => {
        const isActive = Boolean(slide && slide.classList.contains("swiper-slide-active"));

        if (isActive) {
          openModal(card);
        }
      });
    });
  };

  closeTargets.forEach((target) => target.addEventListener("click", closeModal));

  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.hasAttribute("data-rule-modal-close")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  if (window.Swiper && carousel) {
    swiper = new Swiper(carousel, {
      loop: false,
      centeredSlides: true,
      slidesPerView: 3,
      speed: 500,
      spaceBetween: 0,
      threshold: 14,
      touchRatio: 0.72,
      longSwipesRatio: 0.38,
      longSwipesMs: 300,
      watchSlidesProgress: true,
      slideToClickedSlide: false,
      grabCursor: true,
      allowTouchMove: true,
      breakpoints: {
        0: {
          slidesPerView: 1,
          centeredSlides: true,
          spaceBetween: 0,
        },
        768: {
          slidesPerView: 3,
          centeredSlides: true,
          spaceBetween: 0,
        },
      },
    });

    bindCardActions();

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        primeBackImages();
      });
    } else {
      setTimeout(() => {
        primeBackImages();
      }, 700);
    }

    window.addEventListener("load", () => {
      swiper.update();
      swiper.slideTo(1, 0);
    });
  }
});
