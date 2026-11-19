# Riverside Danang — Motion Banner news portal

A static, VnExpress-style news portal for the Riverside Danang development:
burgundy/gold editorial layout, sticky vertical ad pillars, and a fully
scripted motion banner in the centre column.

No build step, no dependencies. Plain HTML5 + CSS3 + vanilla JavaScript.

## Run

From the repository root:

```bash
docker compose -f docker-compose.base44.yml up -d
```

The site is served at <http://localhost:3000>. Edits to the files below show up
on refresh (nginx serves the working tree directly).

## Structure

```
riverside-danang/
├── index.html            page markup, all sections
├── css/
│   ├── fonts.css         self-hosted Playfair Display + Inter (latin + vietnamese)
│   └── styles.css        design tokens, layout, motion-banner styles
├── js/
│   ├── motion-banner.js  the carousel component (independent)
│   └── site.js           masthead date, top banner rotation, sticky nav
└── assets/               photography, banner artwork, fonts, wave pattern
```

## Motion banner

`js/motion-banner.js` is self-contained: it finds `[data-motion-banner]` and
takes over. `index.html` holds the slides and dots — that is the only place to
edit content.

**Edit a banner:** change the `<img src>`, `.mb-eyebrow`, `.mb-title`,
`.mb-desc` and `.mb-cta` inside the matching `<article class="mb-slide">`.

**Add a banner:** duplicate an `<article class="mb-slide">`, add one
`<button class="mb-dot" data-mb-dot>` to `.mb-dots`, and update the
`<b>0X</b> / 0N` counter text. Nothing in the JS needs to change.

**Timing:** `data-autoplay="6000"` on the component root (milliseconds).

Effects implemented in `styles.css` / `motion-banner.js`:

| Effect | Where |
| --- | --- |
| Slide + fade transition | `.mb-slide` opacity/visibility, `media-in` keyframes |
| Ken Burns zoom in/out | `kb-in` / `kb-out` keyframes, alternating per slide |
| Parallax | pointer-driven `--px` / `--py` on `.mb-media` |
| Staggered content entry | `.mb-panel > *` transition delays |
| Auto-play + progress bar | one `requestAnimationFrame` clock drives both |
| Pause on hover / focus | `pointerenter` / `focusin` |
| Swipe, arrows, dots, keys | touch handlers, `[data-mb-prev|next]`, dots, ArrowLeft/Right |

`prefers-reduced-motion: reduce` disables auto-play, Ken Burns, parallax and
the progress bar, and shortens transitions to instant.

## Assets

Photography is downloaded locally so the page never depends on a third-party
host at runtime:

- `slide-1…3.jpg` — cropped from the supplied Riverside banner artwork.
- `0e116e1cc.png`, `f875f9bed.png`, `a78b1a530.png` — the supplied wide banner
  artwork, shown in the rotating top ad slot.
- Danang / resort photography from Wikimedia Commons (free licences), resized
  for the web.
- `fonts/` — Playfair Display and Inter (SIL Open Font License), latin and
  vietnamese subsets.
