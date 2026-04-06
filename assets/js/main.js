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

  const backImageByGame = {
    "Ô Ăn Quan": "../MẶT SAU/MẶT SAU/Ô ĂN QUAN.png",
    "Đánh đu": "../MẶT SAU/MẶT SAU/ĐÁNH ĐU.png",
    "Đi cà kheo": "../MẶT SAU/MẶT SAU/ĐI CÀ KHEO.png",
    "Kéo cưa lừa xẻ": "../MẶT SAU/MẶT SAU/KÉO CƯA LỪA XẺ.png",
    "Rồng rắn lên mây": "../MẶT SAU/MẶT SAU/RỒNG RẮN LÊN MÂY.png",
    "Đập niêu đất": "../MẶT SAU/MẶT SAU/ĐẬP NIÊU ĐẤT.png",
    "Đẩy gậy": "../MẶT SAU/MẶT SAU/ĐẨY GẬY.png",
    "Ném còn": "../MẶT SAU/MẶT SAU/NÉM CÒN.png",
    "Nu na nu nống": "../MẶT SAU/MẶT SAU/NU NA NU NỐNG.png",
    "Nhảy sạp": "../MẶT SAU/MẶT SAU/NHẢY SẠP.png",
    "Nhảy bao bố": "../MẶT SAU/MẶT SAU/NHẢY BAO BỐ.png",
    "Mèo đuổi chuột": "../MẶT SAU/MẶT SAU/MÈO ĐUỔI CHUỘT.png",
    "Cướp cờ": "../MẶT SAU/MẶT SAU/CƯỚP CỜ.png",
    "Cá sấu lên bờ": "../MẶT SAU/MẶT SAU/CÁ SẤU LÊN BỜ.png",
    "Chơi chuyền": "../MẶT SAU/MẶT SAU/CHƠI CHUYỀN.png",
    "Chi chi chành chành": "../MẶT SAU/MẶT SAU/CHI CHI CHÀNH CHÀNH .png",
    "Bịt mắt bắt dê": "../MẶT SAU/MẶT SAU/BỊT MẮT BẮT DÊ.png",
    "Tàu hỏa": "../MẶT SAU/MẶT SAU/TÀU HOẢ.png",
    "Thả đỉa ba ba": "../MẶT SAU/MẶT SAU/THẢ ĐỈA BA BA.png",
  };

  const openModal = (card) => {
    const cardImage = card.querySelector(".rule-image");
    const gameName = (cardImage && cardImage.alt ? cardImage.alt.trim() : "") || card.dataset.title || "Chi tiet luat choi";
    const backImagePath = backImageByGame[gameName];

    modalTitle.textContent = gameName;

    if (modalImage) {
      modalImage.alt = `Mat sau the luat choi ${gameName}`;

      if (backImagePath) {
        modalImage.src = backImagePath;
        modalImage.hidden = false;
        modalContent.hidden = true;
      } else {
        modalImage.removeAttribute("src");
        modalImage.hidden = true;
        modalContent.textContent = card.dataset.detail || "Chua co anh mat sau cho the nay.";
        modalContent.hidden = false;
      }
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (modalImage) {
      modalImage.removeAttribute("src");
    }
    modal.hidden = true;
    document.body.style.overflow = "";
  };

  const bindCardActions = () => {
    cards.forEach((card, index) => {
      const slide = card.closest(".swiper-slide");

      if (slide) {
        slide.addEventListener("pointerenter", () => {
          if (swiper && window.innerWidth >= 768 && swiper.activeIndex !== index) {
            swiper.slideTo(index, 500);
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

    window.addEventListener("load", () => {
      swiper.update();
      swiper.slideTo(1, 0);
    });
  }
});
