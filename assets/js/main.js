function initRulesCarousel() {
  const carousel = document.querySelector("[data-rules-carousel]");
  const track = document.querySelector("[data-rules-track]");
  const modal = document.querySelector("[data-rule-modal]");

  if (!track || !modal) {
    return;
  }

  const cards = Array.from(track.querySelectorAll(".rule-card"));
  const modalTitle = document.getElementById("rule-modal-title");
  const modalFlipCard = document.getElementById("rule-flip-card");
  const modalFrontImage = document.getElementById("rule-modal-front-image");
  const modalBackImage = document.getElementById("rule-modal-back-image");
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

    if (modalFlipCard && modalFrontImage && modalBackImage) {
      modalFlipCard.classList.remove("is-flipped");
      modalFrontImage.src = cardImage ? cardImage.src : "";
      modalFrontImage.alt = `Mat truoc the luat choi ${gameName}`;

      if (backImagePath) {
        modalBackImage.alt = `Mat sau the luat choi ${gameName}`;
        modalBackImage.src = backImagePath;
        modalFlipCard.hidden = false;
        modalContent.hidden = true;

        const startFlip = () => {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              modalFlipCard.classList.add("is-flipped");
            });
          });
        };

        if (modalBackImage.complete) {
          startFlip();
        } else {
          modalBackImage.onload = startFlip;
          modalBackImage.onerror = () => {
            modalFlipCard.classList.remove("is-flipped");
          };
        }

        preloadImage(backImagePath);
      } else {
        modalBackImage.removeAttribute("src");
        modalFlipCard.hidden = true;
        modalContent.textContent = card.dataset.detail || "Chua co anh mat sau cho the nay.";
        modalContent.hidden = false;
      }
    }
  };

  const closeModal = () => {
    if (modalFlipCard) {
      modalFlipCard.classList.remove("is-flipped");
    }

    if (modalBackImage) {
      modalBackImage.onload = null;
      modalBackImage.onerror = null;
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
}

function initOanTuTiGame() {
  const game = document.querySelector("[data-rps-game]");

  if (!game) {
    return;
  }

  const playerScoreEl = document.getElementById("player-score");
  const cpuScoreEl = document.getElementById("cpu-score");
  const drawScoreEl = document.getElementById("draw-score");
  const roundResultEl = document.getElementById("round-result");
  const roundNoteEl = document.getElementById("round-note");

  const duelUserCardEl = document.getElementById("duel-user-card");
  const duelCpuCardEl = document.getElementById("duel-cpu-card");
  const duelUserWrap = document.getElementById("duel-user-wrap");
  const duelCpuWrap = document.getElementById("duel-cpu-wrap");

  const restartBtn = document.getElementById("restart-round");
  const overlay = document.getElementById("game-overlay");
  const playAgainBtn = document.getElementById("play-again");
  const gameOverTitle = document.getElementById("game-over-title");
  const gameOverMessage = document.getElementById("game-over-message");

  const playerCards = Array.from(game.querySelectorAll(".choice-card"));
  const cardBack = "../oan tu xi/cardback.png";
  const cardByChoice = {
    keo: "../oan tu xi/keo.png",
    bua: "../oan tu xi/bua.png",
    bao: "../oan tu xi/bao.png",
  };

  const choiceLabel = {
    keo: "Kéo",
    bua: "Búa",
    bao: "Bao",
  };

  const winAgainst = {
    keo: "bao",
    bua: "keo",
    bao: "bua",
  };

  const CPU_REVEAL_DELAY_MS = 600;
  const ROUND_RESET_DELAY_MS = 900;
  const CARD_FLIP_DURATION_MS = 420;
  const MAX_ROUNDS = 3;

  let playerScore = 0;
  let cpuScore = 0;
  let drawScore = 0;
  let roundCount = 0;
  let isRoundLocked = false;
  let isGameOver = false;

  function randomChoice() {
    const choices = Object.keys(cardByChoice);
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function setAllCardsBack() {
    playerCards.forEach((btn) => {
      const choice = btn.dataset.choice;
      const img = btn.querySelector("img");
      img.src = cardByChoice[choice];
      btn.classList.remove("is-selected");
    });
    duelUserWrap.classList.remove("is-flipping");
    duelCpuWrap.classList.remove("is-flipping");
    duelUserCardEl.src = cardBack;
    duelCpuCardEl.src = cardBack;
  }

  function updateScoreUI() {
    playerScoreEl.textContent = String(playerScore);
    cpuScoreEl.textContent = String(cpuScore);
    drawScoreEl.textContent = String(drawScore);
  }

  function setCardsDisabled(disabled) {
    playerCards.forEach((btn) => {
      btn.disabled = disabled;
    });
  }

  function revealPlayerCards(selectedChoice) {
    playerCards.forEach((btn) => {
      const choice = btn.dataset.choice;
      const img = btn.querySelector("img");
      img.src = cardByChoice[choice];
      btn.classList.toggle("is-selected", choice === selectedChoice);
    });
  }

  function runDuelAnimation() {
    duelUserWrap.classList.remove("is-fighting");
    duelCpuWrap.classList.remove("is-fighting");
    duelCpuWrap.classList.remove("is-thrown");

    void duelUserWrap.offsetWidth;
    void duelCpuWrap.offsetWidth;

    duelCpuWrap.classList.add("is-thrown");
    duelUserWrap.classList.add("is-fighting");
    duelCpuWrap.classList.add("is-fighting");
  }

  function flipRevealDuelCard(cardEl, wrapEl, nextSrc) {
    wrapEl.classList.remove("is-flipping");
    cardEl.src = cardBack;
    void wrapEl.offsetWidth;

    wrapEl.classList.add("is-flipping");

    window.setTimeout(() => {
      cardEl.src = nextSrc;
    }, Math.floor(CARD_FLIP_DURATION_MS / 2));

    window.setTimeout(() => {
      wrapEl.classList.remove("is-flipping");
    }, CARD_FLIP_DURATION_MS + 30);
  }

  function getRoundOutcome(playerChoice, cpuChoice) {
    if (playerChoice === cpuChoice) {
      return "draw";
    }

    return winAgainst[playerChoice] === cpuChoice ? "player" : "cpu";
  }

  function showGameOver() {
    isGameOver = true;
    setCardsDisabled(true);
    const completedRounds = roundCount;

    if (playerScore > cpuScore) {
      gameOverTitle.textContent = "Người chơi chiến thắng!";
      gameOverMessage.textContent = `Sau ${completedRounds} vòng, Người chơi thắng ${playerScore}-${cpuScore}.`;
    } else if (cpuScore > playerScore) {
      gameOverTitle.textContent = "Cao thủ dân gian chiến thắng!";
      gameOverMessage.textContent = `Sau ${completedRounds} vòng, Cao thủ dân gian thắng ${cpuScore}-${playerScore}.`;
    } else {
      gameOverTitle.textContent = "Hòa chung cuộc!";
      gameOverMessage.textContent = `Sau ${completedRounds} vòng, hai bên bất phân thắng bại (${playerScore}-${cpuScore}).`;
    }

    overlay.hidden = false;
  }

  function resetGame() {
    playerScore = 0;
    cpuScore = 0;
    drawScore = 0;
    roundCount = 0;
    isRoundLocked = false;
    isGameOver = false;
    overlay.hidden = true;

    updateScoreUI();
    setAllCardsBack();
    setCardsDisabled(false);

    roundResultEl.textContent = "Hãy chọn thẻ để bắt đầu trận đấu.";
    roundNoteEl.textContent = `Thi đấu ${MAX_ROUNDS} vòng: ai nhiều hiệp thắng hơn sẽ thắng.`;
  }

  function playRound(playerChoice, selectedButton) {
    if (isRoundLocked || isGameOver) {
      return;
    }

    isRoundLocked = true;
    setCardsDisabled(true);

    revealPlayerCards(playerChoice);
    roundNoteEl.textContent = `Người chơi đã chọn: ${choiceLabel[playerChoice]}. Đang chờ Cao thủ dân gian ra thẻ...`;

    const cpuChoice = randomChoice();
    flipRevealDuelCard(duelUserCardEl, duelUserWrap, cardByChoice[playerChoice]);
    flipRevealDuelCard(duelCpuCardEl, duelCpuWrap, cardByChoice[cpuChoice]);
    selectedButton.classList.add("is-selected");

    runDuelAnimation();

    window.setTimeout(() => {
      const outcome = getRoundOutcome(playerChoice, cpuChoice);
      roundCount += 1;

      if (outcome === "player") {
        playerScore += 1;
        roundResultEl.textContent = `Người chơi thắng vòng này! ${choiceLabel[playerChoice]} thắng ${choiceLabel[cpuChoice]}.`;
      } else if (outcome === "cpu") {
        cpuScore += 1;
        roundResultEl.textContent = `Cao thủ dân gian thắng vòng này! ${choiceLabel[cpuChoice]} thắng ${choiceLabel[playerChoice]}.`;
      } else {
        drawScore += 1;
        roundResultEl.textContent = `Hòa vòng! Cả hai cùng ra ${choiceLabel[playerChoice]}.`;
      }

      updateScoreUI();
      roundNoteEl.textContent = `Vòng ${roundCount}/${MAX_ROUNDS} • Tỉ số: Người chơi ${playerScore} - ${cpuScore} Cao thủ dân gian.`;

      const remainingRounds = MAX_ROUNDS - roundCount;
      const scoreGap = Math.abs(playerScore - cpuScore);
      const hasDecisiveWinner = scoreGap > remainingRounds;

      if (roundCount >= MAX_ROUNDS || hasDecisiveWinner) {
        showGameOver();
        isRoundLocked = false;
        return;
      }

      window.setTimeout(() => {
        setAllCardsBack();
        setCardsDisabled(false);
        isRoundLocked = false;
      }, ROUND_RESET_DELAY_MS);
    }, CPU_REVEAL_DELAY_MS);
  }

  playerCards.forEach((button) => {
    button.addEventListener("click", () => {
      const playerChoice = button.dataset.choice;
      playRound(playerChoice, button);
    });
  });

  restartBtn.addEventListener("click", resetGame);
  playAgainBtn.addEventListener("click", resetGame);

  resetGame();
}

function initOriginTimelineHalfFlow() {
  const timeline = document.querySelector(".folk-timeline");

  if (!timeline) {
    return;
  }

  const stage1 = timeline.querySelector(".timeline-card--left:not(.timeline-card--final)");
  const stage2 = timeline.querySelector(".timeline-card--right");
  const stage3 = timeline.querySelector(".timeline-card--final");
  const center = timeline.querySelector(".folk-timeline__center");

  if (!stage1 || !stage2 || !stage3) {
    return;
  }

  const DESKTOP_BREAKPOINT = 640;
  const FLOW_GAP_FACTOR = 0.48;

  const resetLayout = () => {
    timeline.classList.remove("is-half-flow");
    stage2.style.marginTop = "";
    stage3.style.marginTop = "";
    timeline.style.minHeight = "";
  };

  const applyHalfFlow = () => {
    if (window.innerWidth <= DESKTOP_BREAKPOINT) {
      resetLayout();
      return;
    }

    timeline.classList.add("is-half-flow");

    const stage2Top = Math.max(18, Math.round(stage1.offsetHeight * FLOW_GAP_FACTOR));
    const stage3Top = Math.max(18, Math.round(stage2Top + stage2.offsetHeight * FLOW_GAP_FACTOR));

    stage2.style.marginTop = `${stage2Top}px`;
    stage3.style.marginTop = `${stage3Top}px`;

    const leftBottom = stage3Top + stage3.offsetHeight;
    const rightBottom = stage2Top + stage2.offsetHeight;
    const centerBottom = center ? center.offsetHeight : 0;
    timeline.style.minHeight = `${Math.ceil(Math.max(leftBottom, rightBottom, centerBottom) + 8)}px`;
  };

  applyHalfFlow();

  let resizeRaf = 0;
  window.addEventListener("resize", () => {
    if (resizeRaf) {
      window.cancelAnimationFrame(resizeRaf);
    }

    resizeRaf = window.requestAnimationFrame(() => {
      applyHalfFlow();
    });
  });
}

function initSupportModal() {
  const modal = document.querySelector("[data-support-modal]");

  if (!modal) {
    return;
  }

  const openButtons = Array.from(document.querySelectorAll("[data-support-open]"));
  const closeButtons = Array.from(modal.querySelectorAll("[data-support-close]"));
  const form = modal.querySelector("[data-support-form]");
  const successMessage = modal.querySelector("[data-support-success]");

  const openModal = () => {
    modal.hidden = false;
    if (successMessage) {
      successMessage.hidden = true;
    }
  };

  const closeModal = () => {
    modal.hidden = true;
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", openModal);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-support-close]");

    if (closeButton) {
      closeModal();
      return;
    }

    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (successMessage) {
        successMessage.hidden = false;
      }
      form.reset();
    });
  }
}

function initCollectionPage() {
  const page = document.querySelector("[data-collection-page]");

  if (!page) {
    return;
  }

  const range = (start, end) => {
    const values = [];

    for (let value = start; value <= end; value += 1) {
      values.push(String(value));
    }

    return values;
  };

  const folderButtons = Array.from(page.querySelectorAll("[data-folder-id]"));
  const popup = document.querySelector("[data-collection-popup]");
  const titleEl = popup ? popup.querySelector("#collection-popup-title") : null;
  const descriptionEl = popup ? popup.querySelector("#collection-popup-description") : null;
  const swiperRoot = popup ? popup.querySelector("[data-collection-popup-swiper]") : null;
  const track = popup ? popup.querySelector("[data-collection-popup-track]") : null;
  const closeButtons = popup ? Array.from(popup.querySelectorAll("[data-collection-popup-close]")) : [];
  const prevButton = popup ? popup.querySelector("[data-collection-popup-prev]") : null;
  const nextButton = popup ? popup.querySelector("[data-collection-popup-next]") : null;
  let swiper = null;

  const folders = [
    {
      id: "giai-dieu",
      title: "Giai điệu",
      description: "Toàn bộ hình trong thư mục Giai điệu.",
      images: [
        "GD1.png",
        "GD1 (2).png",
        "GD1 (3).png",
        "GD1 (4).png",
        "GD1 (5).png",
        "GD1 (6).png",
        "GD1 (7).png",
        "GD1 (8).png",
        "GD1 (9).png",
        "GD1 (10).png",
        "GD1 (11).png",
        "GD2.png",
        "GD3.png",
        "GD4.png",
        "GD5.png",
        "GD6.png",
        "GD7.png",
        "GD8.png",
        "GD9.png",
        "GD9 (2).png",
      ],
    },
    {
      id: "tin-nguong",
      title: "Tín ngưỡng",
      description: "Toàn bộ hình trong thư mục Tín ngưỡng.",
      images: range(61, 80).map((name) => `../THẺ PHÂN LOẠI/TÍN NGƯỠNG/${name}.png`),
    },
    {
      id: "tri-tue",
      title: "Trí tuệ",
      description: "Toàn bộ hình trong thư mục Trí tuệ.",
      images: range(41, 60).map((name) => `../THẺ PHÂN LOẠI/TRÍ TUỆ/${name}.png`),
    },
    {
      id: "van-dong",
      title: "Vận động",
      description: "Toàn bộ hình trong thư mục Vận động.",
      images: [
        "../THẺ PHÂN LOẠI/VẬN ĐỘNG/GD10.png",
        ...range(2, 20).map((idx) => `../THẺ PHÂN LOẠI/VẬN ĐỘNG/GD10 (${idx}).png`),
      ],
    },
  ];

  const folderById = new Map(folders.map((folder) => [folder.id, folder]));

  const destroySwiper = () => {
    if (swiper) {
      swiper.destroy(true, true);
      swiper = null;
    }
  };

  const closePopup = () => {
    if (popup) {
      popup.hidden = true;
    }

    destroySwiper();
  };

  const openPopup = (folder) => {
    if (!popup || !titleEl || !descriptionEl || !track || !swiperRoot) {
      return;
    }

    titleEl.textContent = folder.title;
    descriptionEl.textContent = folder.description;
    track.innerHTML = folder.images
      .map((src, index) => {
        const safeSrc = encodeURI(src);
        return `
          <div class="swiper-slide">
            <article class="collection-popup__card">
              <img src="${safeSrc}" alt="${folder.title} - Ảnh ${index + 1}" loading="lazy" />
            </article>
          </div>
        `;
      })
      .join("");

    popup.hidden = false;
    destroySwiper();
    if (window.Swiper) {
      swiper = new Swiper(swiperRoot, {
        centeredSlides: false,
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 500,
        navigation: {
          prevEl: prevButton,
          nextEl: nextButton,
        },
        breakpoints: {
          0: {
            slidesPerView: 1,
            centeredSlides: false,
          },
          768: {
            slidesPerView: 1,
            centeredSlides: false,
          },
        },
      });

      window.requestAnimationFrame(() => {
        swiper.update();
        swiper.slideTo(0, 0);
      });
    }
  };

  folderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const folderId = button.getAttribute("data-folder-id") || "";
      const folder = folderById.get(folderId);

      if (folder) {
        openPopup(folder);
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closePopup);
  });

  if (popup) {
    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        closePopup();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popup && !popup.hidden) {
      closePopup();
    }
  });

  if (popup) {
    popup.hidden = true;
  }
}

function initGroupGalleryPage() {
  const section = document.querySelector("[data-group-gallery]");

  if (!section) {
    return;
  }

  const groupId = section.getAttribute("data-group-gallery") || "";
  const swiperRoot = section.querySelector("[data-group-swiper]");
  const track = section.querySelector("[data-group-track]");

  if (!swiperRoot || !track) {
    return;
  }

  const range = (start, end) => {
    const values = [];
    for (let value = start; value <= end; value += 1) {
      values.push(String(value));
    }
    return values;
  };

  const groupImages = {
    "giai-dieu": [
      "GD1.png",
      "GD1 (2).png",
      "GD1 (3).png",
      "GD1 (4).png",
      "GD1 (5).png",
      "GD1 (6).png",
      "GD1 (7).png",
      "GD1 (8).png",
      "GD1 (9).png",
      "GD1 (10).png",
      "GD1 (11).png",
      "GD2.png",
      "GD3.png",
      "GD4.png",
      "GD5.png",
      "GD6.png",
      "GD7.png",
      "GD8.png",
      "GD9.png",
      "GD9 (2).png",
    ].map((name) => `../THẺ PHÂN LOẠI/GIAI ĐIỆU/${name}`),
    "tin-nguong": range(61, 80).map((name) => `../THẺ PHÂN LOẠI/TÍN NGƯỠNG/${name}.png`),
    "tri-tue": range(41, 60).map((name) => `../THẺ PHÂN LOẠI/TRÍ TUỆ/${name}.png`),
    "van-dong": [
      "../THẺ PHÂN LOẠI/VẬN ĐỘNG/GD10.png",
      ...range(2, 20).map((idx) => `../THẺ PHÂN LOẠI/VẬN ĐỘNG/GD10 (${idx}).png`),
    ],
  };

  const images = [...(groupImages[groupId] || [])].sort((a, b) => {
    const aHasImage = Boolean(a && a.trim());
    const bHasImage = Boolean(b && b.trim());

    if (aHasImage === bHasImage) {
      return 0;
    }

    return aHasImage ? -1 : 1;
  });

  track.innerHTML = images
    .map((src, index) => {
      const safeSrc = encodeURI(src);
      const label = `Thẻ ${index + 1}`;
      return `
        <div class="swiper-slide">
          <article class="group-gallery__card">
            <img src="${safeSrc}" alt="${label}" loading="lazy" />
          </article>
        </div>
      `;
    })
    .join("");

  if (window.Swiper) {
    const swiper = new Swiper(swiperRoot, {
      centeredSlides: false,
      slidesPerView: 4,
      spaceBetween: 14,
      speed: 500,
      breakpoints: {
        0: {
          slidesPerView: 1,
          centeredSlides: false,
        },
        640: {
          slidesPerView: 2,
          centeredSlides: false,
        },
        768: {
          slidesPerView: 3,
          centeredSlides: false,
        },
        1024: {
          slidesPerView: 4,
          centeredSlides: false,
        },
      },
    });

    window.requestAnimationFrame(() => {
      swiper.update();
      swiper.slideTo(0, 0);
    });
  }
}

function initMelodyFlashcardPage() {
  const page = document.querySelector("[data-melody-flashcard-page]");

  if (!page) {
    return;
  }

  const card = page.querySelector("[data-melody-card]");
  const cardImage = page.querySelector("[data-melody-card-image]");
  const cardBackImage = page.querySelector("[data-melody-card-back-image]");
  const prevButton = page.querySelector("[data-melody-prev]");
  const nextButton = page.querySelector("[data-melody-next]");

  if (!card || !cardImage || !cardBackImage || !prevButton || !nextButton) {
    return;
  }

  const melodies = [
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD1.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (2).png",
      title: "Giai điệu 1",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD2.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (3).png",
      title: "Giai điệu 2",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD3.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (4).png",
      title: "Giai điệu 3",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD4.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (5).png",
      title: "Giai điệu 4",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD5.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (6).png",
      title: "Giai điệu 5",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD6.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (7).png",
      title: "Giai điệu 6",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD7.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (8).png",
      title: "Giai điệu 7",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD8.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (9).png",
      title: "Giai điệu 8",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD9.png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (10).png",
      title: "Giai điệu 9",
    },
    {
      image: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/HÌNH/GD9 (2).png",
      backImage: "../THẺ PHÂN LOẠI/GIAI ĐIỆU/CHỮ/GD1 (11).png",
      title: "Giai điệu 10",
    },
  ];

  let currentIndex = 0;
  let isFlipped = false;
  let isAnimating = false;

  function renderCard(index) {
    const melody = melodies[index];

    cardImage.src = melody.image;
    cardImage.alt = melody.title;
    cardBackImage.src = melody.backImage;
    cardBackImage.alt = `${melody.title} - mặt sau`;
    card.classList.remove("is-flipped");
    isFlipped = false;
  }

  function swapCard(nextIndex, direction) {
    if (isAnimating) {
      return;
    }

    isAnimating = true;
    card.classList.add("is-hidden");

    window.setTimeout(() => {
      currentIndex = (nextIndex + melodies.length) % melodies.length;
      renderCard(currentIndex);

      if (direction === "next") {
        card.style.transform = "translateX(18px)";
      } else if (direction === "prev") {
        card.style.transform = "translateX(-18px)";
      } else {
        card.style.transform = "translateX(0)";
      }

      window.requestAnimationFrame(() => {
        card.classList.remove("is-hidden");
        card.style.transform = "";

        window.setTimeout(() => {
          isAnimating = false;
        }, 240);
      });
    }, 180);
  }

  function toggleFlip() {
    if (isAnimating) {
      return;
    }

    isFlipped = !isFlipped;
    card.classList.toggle("is-flipped", isFlipped);
  }

  card.addEventListener("click", toggleFlip);

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFlip();
    }
  });

  prevButton.addEventListener("click", () => {
    swapCard(currentIndex - 1, "prev");
  });

  nextButton.addEventListener("click", () => {
    swapCard(currentIndex + 1, "next");
  });

  renderCard(currentIndex);
}

function initClassificationFlashcardPages() {
  const pages = document.querySelectorAll("[data-flashcard-page]");

  if (!pages.length) {
    return;
  }

  const flashcardGroups = {
    "tin-nguong": {
      title: "Tín ngưỡng Trò chơi dân gian",
      intro: "Chạm vào thẻ để lật xem hình minh họa và ảnh chữ tương ứng.",
      frontImages: [61, 63, 65, 67, 69, 71, 73, 75, 77, 79].map((number) => `../THẺ PHÂN LOẠI/TÍN NGƯỠNG/HÌNH/${number}.png`),
      backImages: [62, 64, 66, 68, 70, 72, 74, 76, 78, 80].map((number) => `../THẺ PHÂN LOẠI/TÍN NGƯỠNG/CHỮ/${number}.png`),
    },
    "tri-tue": {
      title: "Trí tuệ Trò chơi dân gian",
      intro: "Chạm vào thẻ để lật xem hình minh họa và ảnh chữ tương ứng.",
      frontImages: [41, 43, 45, 47, 49, 51, 53, 55, 57, 59].map((number) => `../THẺ PHÂN LOẠI/TRÍ TUỆ/HÌNH/${number}.png`),
      backImages: [42, 44, 46, 48, 50, 52, 54, 56, 58, 60].map((number) => `../THẺ PHÂN LOẠI/TRÍ TUỆ/CHỮ/${number}.png`),
    },
    "van-dong": {
      title: "Vận động Trò chơi dân gian",
      intro: "Chạm vào thẻ để lật xem hình minh họa và ảnh chữ tương ứng.",
      frontImages: [
        "GD10.png",
        "GD10 (3).png",
        "GD10 (5).png",
        "GD10 (7).png",
        "GD10 (9).png",
        "GD10 (11).png",
        "GD10 (13).png",
        "GD10 (15).png",
        "GD10 (17).png",
        "GD10 (19).png",
      ].map((name) => `../THẺ PHÂN LOẠI/VẬN ĐỘNG/HÌNH/${name}`),
      backImages: [
        "GD10 (2).png",
        "GD10 (4).png",
        "GD10 (6).png",
        "GD10 (8).png",
        "GD10 (10).png",
        "GD10 (12).png",
        "GD10 (14).png",
        "GD10 (16).png",
        "GD10 (18).png",
        "GD10 (20).png",
      ].map((name) => `../THẺ PHÂN LOẠI/VẬN ĐỘNG/CHỮ/${name}`),
    },
  };

  pages.forEach((page) => {
    const groupId = page.getAttribute("data-flashcard-group") || "";
    const config = flashcardGroups[groupId];

    if (!config) {
      return;
    }

    const card = page.querySelector("[data-flashcard-card]");
    const cardImage = page.querySelector("[data-flashcard-image]");
    const cardBackImage = page.querySelector("[data-flashcard-back-image]");
    const title = page.querySelector("[data-flashcard-title]");
    const intro = page.querySelector("[data-flashcard-intro]");
    const prevButton = page.querySelector("[data-flashcard-prev]");
    const nextButton = page.querySelector("[data-flashcard-next]");

    if (!card || !cardImage || !cardBackImage || !prevButton || !nextButton) {
      return;
    }

    if (title) {
      title.textContent = config.title;
    }

    if (intro) {
      intro.textContent = config.intro;
    }

    const flashcards = config.frontImages.map((image, index) => ({
      image,
      backImage: config.backImages[index] || config.backImages[0],
      title: `${config.title} ${index + 1}`,
    }));

    let currentIndex = 0;
    let isFlipped = false;
    let isAnimating = false;

    function renderCard(index) {
      const flashcard = flashcards[index];

      cardImage.src = flashcard.image;
      cardImage.alt = flashcard.title;
      cardBackImage.src = flashcard.backImage;
      cardBackImage.alt = `${flashcard.title} - mặt sau`;
      card.classList.remove("is-flipped");
      isFlipped = false;
    }

    function swapCard(nextIndex, direction) {
      if (isAnimating) {
        return;
      }

      isAnimating = true;
      card.classList.add("is-hidden");

      window.setTimeout(() => {
        currentIndex = (nextIndex + flashcards.length) % flashcards.length;
        renderCard(currentIndex);

        if (direction === "next") {
          card.style.transform = "translateX(18px)";
        } else if (direction === "prev") {
          card.style.transform = "translateX(-18px)";
        } else {
          card.style.transform = "translateX(0)";
        }

        window.requestAnimationFrame(() => {
          card.classList.remove("is-hidden");
          card.style.transform = "";

          window.setTimeout(() => {
            isAnimating = false;
          }, 240);
        });
      }, 180);
    }

    function toggleFlip() {
      if (isAnimating) {
        return;
      }

      isFlipped = !isFlipped;
      card.classList.toggle("is-flipped", isFlipped);
    }

    card.addEventListener("click", toggleFlip);

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleFlip();
      }
    });

    prevButton.addEventListener("click", () => {
      swapCard(currentIndex - 1, "prev");
    });

    nextButton.addEventListener("click", () => {
      swapCard(currentIndex + 1, "next");
    });

    renderCard(currentIndex);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initRulesCarousel();
  initOanTuTiGame();
  initOriginTimelineHalfFlow();
  initSupportModal();
  initCollectionPage();
  initGroupGalleryPage();
  initMelodyFlashcardPage();
  initClassificationFlashcardPages();
});
