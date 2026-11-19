# Agent notes — Riverside Danang branch

## What runs here

The repository's Python application (MoneyPrinterTurbo: FastAPI in `app/`, Streamlit
in `webui/`) is **not** what this branch serves. This branch builds a standalone
static marketing/news site in `riverside-danang/`, and `docker-compose.base44.yml`
serves exactly that folder with nginx on host port 3000.

```bash
docker compose -f docker-compose.base44.yml up -d      # serve on :3000
docker compose -f docker-compose.base44.yml logs -f web
```

## Things that are easy to get wrong

- **No build step.** nginx serves `riverside-danang/` read-only from the working
  tree, so a page refresh picks up edits. If the preview looks stale, call
  `reload_preview`; there is no watcher to wait for.
- **Everything is local on purpose.** Photos and fonts live in
  `riverside-danang/assets/`. Do not swap them for CDN URLs — the page must render
  with no outbound requests.
- **Fonts are subsetted for Vietnamese.** `css/fonts.css` pairs a `latin` and a
  `vietnamese` `@font-face` per weight; dropping the vietnamese file breaks
  diacritics (ế, ộ, ữ).
- **The motion banner is dependency-free.** `js/motion-banner.js` is plain JS with a
  single `requestAnimationFrame` clock that drives both auto-play and the progress
  bar. Adding GSAP/Swiper would require a build step or vendored files — avoid
  unless asked.
- **Slides are data in the markup.** `index.html` owns banner copy and images; the
  component only reads `.mb-slide` / `[data-mb-dot]`. New slide = one `<article>`
  plus one dot.
- **The supplied banner artwork is 12:1.** It is shown intact in the rotating top
  ad slot; the hero slides use the photographic region cropped from those same
  files (`slide-1…4.jpg`), because a 12:1 strip cannot fill a hero frame without
  heavy cropping.

## Verifying

1. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → `200`.
2. In the preview: the motion banner advances on its own within ~6s, the gold
   progress bar tracks it, hover pauses it, arrows/dots change slides.
3. Responsive: at ≤1279px the two vertical pillars disappear; check
   `document.documentElement.scrollWidth` stays equal to `clientWidth`.
4. `prefers-reduced-motion: reduce` must stop auto-play and Ken Burns.
