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

  /* ---------- 2. Rotating horizontal banner ---------- */
  var adRoot = document.querySelector("[data-top-ad]");
  if (adRoot) {
    var adSlides = Array.prototype.slice.call(adRoot.querySelectorAll(".top-ad-slide"));
    if (adSlides.length > 1) {
      var adIndex = 0;
      var adPaused = false;
      var AD_INTERVAL = 5500;

      var rotateAd = function () {
        if (adPaused || document.hidden || reduceMotion.matches) return;
        adSlides[adIndex].classList.remove("is-active");
        adIndex = (adIndex + 1) % adSlides.length;
        adSlides[adIndex].classList.add("is-active");
      };

      window.setInterval(rotateAd, AD_INTERVAL);
      adRoot.addEventListener("pointerenter", function () { adPaused = true; });
      adRoot.addEventListener("pointerleave", function () { adPaused = false; });
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
