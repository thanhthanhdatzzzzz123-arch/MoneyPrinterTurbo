/* ==========================================================================
   Riverside Danang — page chrome
   Masthead date · rotating top banner · sticky navigation shadow
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- 1. Today's date (Vietnam time) ---------- */
  var dateEl = document.getElementById("today-date");
  if (dateEl) {
    try {
      var formatted = new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh"
      }).format(new Date());
      dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch (error) {
      /* keep the static fallback already in the markup */
    }
  }

  /* ---------- 2. Three-banner carousel (top of the page) ---------- */
  var adStage = document.querySelector("[data-top-ad]");
  var adWrap = adStage ? adStage.closest(".top-ad") : null;

  if (adStage && adWrap) {
    var adSlides = Array.prototype.slice.call(adStage.querySelectorAll(".top-ad-slide"));
    var adDots = Array.prototype.slice.call(adWrap.querySelectorAll("[data-ad-dot]"));
    var adPrev = adWrap.querySelector("[data-ad-prev]");
    var adNext = adWrap.querySelector("[data-ad-next]");
    var adIndex = 0;
    var adPaused = false;
    var adTimer = null;
    var AD_INTERVAL = 5500;

    var showAd = function (next) {
      adIndex = (next + adSlides.length) % adSlides.length;
      adSlides.forEach(function (slide, i) {
        var active = i === adIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        slide.tabIndex = active ? 0 : -1;
      });
      adDots.forEach(function (dot, i) {
        var active = i === adIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    };

    var scheduleAd = function () {
      window.clearTimeout(adTimer);
      adTimer = window.setTimeout(function () {
        if (!adPaused && !document.hidden && !reduceMotion.matches) showAd(adIndex + 1);
        scheduleAd();
      }, AD_INTERVAL);
    };

    if (adSlides.length > 1) {
      if (adNext) adNext.addEventListener("click", function () { showAd(adIndex + 1); scheduleAd(); });
      if (adPrev) adPrev.addEventListener("click", function () { showAd(adIndex - 1); scheduleAd(); });

      adDots.forEach(function (dot, i) {
        dot.addEventListener("click", function () { showAd(i); scheduleAd(); });
      });

      adWrap.addEventListener("pointerenter", function (event) {
        if (event.pointerType === "mouse") adPaused = true;
      });
      adWrap.addEventListener("pointerleave", function () { adPaused = false; scheduleAd(); });
      adWrap.addEventListener("focusin", function () { adPaused = true; });
      adWrap.addEventListener("focusout", function (event) {
        if (!adWrap.contains(event.relatedTarget)) { adPaused = false; scheduleAd(); }
      });

      /* swipe on touch screens */
      var adTouchX = 0;
      var adTouchY = 0;
      var adTouching = false;

      adStage.addEventListener("touchstart", function (event) {
        if (event.touches.length !== 1) return;
        adTouchX = event.touches[0].clientX;
        adTouchY = event.touches[0].clientY;
        adTouching = true;
      }, { passive: true });

      adStage.addEventListener("touchend", function (event) {
        if (!adTouching) return;
        adTouching = false;
        var touch = event.changedTouches[0];
        if (!touch) return;
        var dx = touch.clientX - adTouchX;
        var dy = touch.clientY - adTouchY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          showAd(adIndex + (dx < 0 ? 1 : -1));
          scheduleAd();
        }
      }, { passive: true });

      scheduleAd();
    }
  }

  /* ---------- 3. Sticky navigation shadow ---------- */
  var nav = document.getElementById("main-nav");
  if (nav) {
    var updateNav = function () {
      nav.classList.toggle("is-stuck", nav.getBoundingClientRect().top <= 0);
    };
    window.addEventListener("scroll", updateNav, { passive: true });
    updateNav();
  }
})();
