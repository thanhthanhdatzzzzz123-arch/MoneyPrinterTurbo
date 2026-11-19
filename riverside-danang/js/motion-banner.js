/* ==========================================================================
   Riverside Danang — Motion Banner component
   --------------------------------------------------------------------------
   Self-contained slider with: auto-play + progress bar, prev/next, dots,
   hover/focus pause, touch swipe, keyboard arrows, pointer parallax and
   prefers-reduced-motion support.

   Markup contract:
     <div data-motion-banner data-autoplay="6000">
       <span data-mb-progress></span>
       <div data-mb-stage>
         <article class="mb-slide">…</article>   (one per banner)
       </div>
       <button data-mb-prev> <button data-mb-next>
       <button data-mb-dot> (one per banner)
     </div>

   To add a banner: duplicate an <article class="mb-slide">, add a dot.
   Nothing else needs to change.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.querySelector("[data-motion-banner]");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(".mb-slide"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-mb-dot]"));
  var stage = root.querySelector("[data-mb-stage]");
  var bar = root.querySelector("[data-mb-progress]");
  var prevBtn = root.querySelector("[data-mb-prev]");
  var nextBtn = root.querySelector("[data-mb-next]");
  if (slides.length < 2) return;

  var DURATION = parseInt(root.getAttribute("data-autoplay"), 10) || 6000;
  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");

  var index = 0;
  var elapsed = 0;
  var lastTime = 0;
  var rafId = null;
  var paused = false;
  var inView = true;
  var destroyed = false;

  function setProgress(ratio) {
    if (bar) bar.style.width = (Math.max(0, Math.min(1, ratio)) * 100).toFixed(3) + "%";
  }

  function show(next, direction) {
    var target = (next + slides.length) % slides.length;
    if (target === index && slides[target].classList.contains("is-active")) {
      elapsed = 0;
      setProgress(0);
      return;
    }

    root.classList.toggle("is-reverse", direction === "prev");

    slides.forEach(function (slide, i) {
      var active = i === target;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });

    dots.forEach(function (dot, i) {
      var active = i === target;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });

    index = target;
    elapsed = 0;
    setProgress(0);
  }

  function next() { show(index + 1, "next"); }
  function prev() { show(index - 1, "prev"); }

  /* ---------- auto-play driven by one clock (bar stays in sync) ---------- */
  function shouldRun() {
    return !destroyed && !paused && inView && !document.hidden && !reduceQuery.matches;
  }

  function tick(time) {
    if (destroyed) return;
    if (!lastTime) lastTime = time;
    var delta = time - lastTime;
    lastTime = time;

    if (shouldRun()) {
      elapsed += delta;
      if (elapsed >= DURATION) {
        next();
      } else {
        setProgress(elapsed / DURATION);
      }
    }
    rafId = window.requestAnimationFrame(tick);
  }

  function startClock() {
    if (rafId !== null) return;
    lastTime = 0;
    rafId = window.requestAnimationFrame(tick);
  }

  function stopClock() {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /* ---------- controls ---------- */
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i, i < index ? "prev" : "next");
    });
  });

  root.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") { event.preventDefault(); next(); }
    if (event.key === "ArrowLeft") { event.preventDefault(); prev(); }
  });

  /* pause while the pointer or keyboard focus is inside the banner */
  root.addEventListener("pointerenter", function (event) {
    if (event.pointerType === "mouse") paused = true;
  });
  root.addEventListener("pointerleave", function () {
    paused = false;
  });
  root.addEventListener("focusin", function () { paused = true; });
  root.addEventListener("focusout", function (event) {
    if (!root.contains(event.relatedTarget)) paused = false;
  });

  /* ---------- touch swipe ---------- */
  var touchStartX = 0;
  var touchStartY = 0;
  var touchActive = false;

  if (stage) {
    stage.addEventListener("touchstart", function (event) {
      if (event.touches.length !== 1) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchActive = true;
    }, { passive: true });

    stage.addEventListener("touchend", function (event) {
      if (!touchActive) return;
      touchActive = false;
      var touch = event.changedTouches[0];
      if (!touch) return;
      var dx = touch.clientX - touchStartX;
      var dy = touch.clientY - touchStartY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) next(); else prev();
      }
    }, { passive: true });
  }

  /* ---------- pointer parallax on the media layer ---------- */
  function resetParallax() {
    slides.forEach(function (slide) {
      var media = slide.querySelector(".mb-media");
      if (!media) return;
      media.style.setProperty("--px", "0px");
      media.style.setProperty("--py", "0px");
    });
  }

  if (stage && finePointer.matches && !reduceQuery.matches) {
    stage.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse") return;
      var rect = stage.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      var media = slides[index].querySelector(".mb-media");
      if (!media) return;
      media.style.setProperty("--px", (x * -10).toFixed(2) + "px");
      media.style.setProperty("--py", (y * -6).toFixed(2) + "px");
    });
    stage.addEventListener("pointerleave", resetParallax);
  }

  /* ---------- viewport + visibility ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
    }, { threshold: 0.15 });
    io.observe(root);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      setProgress(elapsed / DURATION);
    } else {
      lastTime = 0;
    }
  });

  reduceQuery.addEventListener("change", function () {
    if (reduceQuery.matches) {
      setProgress(0);
    } else {
      lastTime = 0;
    }
  });

  /* ---------- boot ---------- */
  show(0, "next");
  setProgress(0);
  startClock();

  window.addEventListener("pagehide", function () {
    destroyed = true;
    stopClock();
  });
})();
