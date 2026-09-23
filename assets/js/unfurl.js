/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — CHAPTER 02, MANY FORMS
   ---------------------------------------------------------------------------
   One artist. Many forms.

   Adapted from the 21st.dev "3D parallax unfurling gallery". Two things were
   deliberately changed from the original:

     1. NO NESTED SCROLL. The original wraps itself in `h-screen overflow-y-auto`
        and passes that element to useScroll as `container`. That puts a second
        scroller inside the page and the wheel visibly changes hands. Here the
        scene is measured against the DOCUMENT scroll — the same way hero.js
        measures itself — so the wheel never leaves the page.

     2. React/Framer → the site's own vanilla conventions. Framer's useSpring is
        replaced by a lerp toward the raw scroll position, which gives the same
        eased, slightly-trailing feel without a runtime.

   This file writes numbers. Everything visual lives in unfurl.css.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── THE PICTURES ───────────────────────────────────────────────────────
     Her own photographs, pulled from the Wix originals behind robertajafet.com
     and resized for the web. This array is the whole content model: add, remove
     or reorder here and the wall redistributes itself.

       src   where the file lives
       ar    the picture's real width / height. The frame takes this shape, so
             nothing is forced into a crop it was not shot for.
       kind  what the picture is of. It sets how far the frame floats in front
             of or behind its neighbours, which is what keeps the wall from
             reading as a flat grid.

     kind: portrait · performance · stage · backstage · production · creative
           · personal
  */
  var ROBERTA_IMAGES = [
    { src: "assets/img/performance-wicked.jpg", ar: 1.502, kind: "performance" },
    { src: "assets/img/performance-concert.jpg", ar: 1.5, kind: "performance" },
    { src: "assets/img/performance-red.jpg", ar: 1.8, kind: "performance" },
    { src: "assets/img/backstage-mirror.jpg", ar: 1.778, kind: "backstage" },
    { src: "assets/img/portrait-arms.jpg", ar: 0.667, kind: "portrait" },
    { src: "assets/img/portrait-blazer.jpg", ar: 0.667, kind: "production" },
    { src: "assets/img/portrait-close.jpg", ar: 1.333, kind: "personal" },
    { src: "assets/img/portrait-dark.jpg", ar: 0.773, kind: "portrait" },
    { src: "assets/img/portrait-floor.jpg", ar: 1, kind: "creative" },
    { src: "assets/img/portrait-grid.jpg", ar: 0.667, kind: "personal" },
    { src: "assets/img/portrait-jeans.jpg", ar: 0.667, kind: "production" },
    { src: "assets/img/portrait-knit.jpg", ar: 0.666, kind: "portrait" },
    { src: "assets/img/portrait-laugh.jpg", ar: 1, kind: "portrait" },
    { src: "assets/img/portrait-lean.jpg", ar: 1.25, kind: "creative" },
    { src: "assets/img/portrait-light.jpg", ar: 0.667, kind: "portrait" },
    { src: "assets/img/portrait-quiet.jpg", ar: 1, kind: "portrait" },
    { src: "assets/img/portrait-seated.jpg", ar: 0.667, kind: "portrait" },
    { src: "assets/img/portrait-shorts.jpg", ar: 0.666, kind: "personal" },
    { src: "assets/img/portrait-standing.jpg", ar: 0.667, kind: "portrait" },
    { src: "assets/img/stage-ensemble.jpg", ar: 1.398, kind: "stage" },
    { src: "assets/img/studio-wide.jpg", ar: 1.5, kind: "creative" }
  ];

  /* Depth per kind, in px. Performance and stage sit furthest back so the wall
     has somewhere to recede to; the quieter studio frames come forward. */
  var DEPTH = {
    portrait:    -30,
    performance: -110,
    stage:       -140,
    backstage:     40,
    production:    70,
    creative:      95,
    personal:     -70
  };

  var COLUMNS = 4;

  var root  = document.documentElement;
  var scene = document.getElementById("chapter-02");
  if (!scene) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine    = window.matchMedia("(hover: hover) and (pointer: fine)");


  /* ── BUILD ──────────────────────────────────────────────────────────────
     The columns are doubled so the opposing parallax never runs out of
     pictures at either end of its travel.
  */
  function build() {
    var matrix = scene.querySelector(".unfurl__matrix");
    if (!matrix) return;

    var cols = [];
    for (var c = 0; c < COLUMNS; c++) {
      var col = document.createElement("div");
      col.className = "unfurl__col unfurl__col--" + (c + 1);
      cols.push(col);
    }

    ROBERTA_IMAGES.concat(ROBERTA_IMAGES).forEach(function (item, i) {
      var fig = document.createElement("figure");
      fig.className = "frame frame--" + item.kind;
      fig.style.setProperty("--ar", item.ar);
      fig.style.setProperty("--z", (DEPTH[item.kind] || 0) + "px");

      var img = document.createElement("img");
      img.src = item.src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      fig.appendChild(img);

      cols[i % COLUMNS].appendChild(fig);
    });

    /* Pictures go behind the typography that is already in the markup, so the
       deep line stays occluded by them. */
    var firstLabel = matrix.firstElementChild;
    cols.forEach(function (col) { matrix.insertBefore(col, firstLabel); });
  }


  /* ── SCROLL ─────────────────────────────────────────────────────────────
     Measured against the document, never a nested scroller.
  */
  var raw = 0, smooth = 0, written = -1;
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  var onScreen = false, frameId = 0;

  function progress() {
    var travel = scene.offsetHeight - window.innerHeight;
    if (travel <= 0) return 0;
    var p = -scene.getBoundingClientRect().top / travel;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function tick() {
    frameId = 0;
    raw = progress();

    /* Stands in for Framer's useSpring: eases toward the scroll position so the
       world settles a beat after the wheel does. */
    smooth += (raw - smooth) * 0.12;
    if (Math.abs(raw - smooth) < 0.0004) smooth = raw;

    if (Math.abs(smooth - written) > 0.0003) {
      written = smooth;
      root.style.setProperty("--u", smooth.toFixed(4));
    }

    if (fine.matches && !reduced.matches) {
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      root.style.setProperty("--ux", mx.toFixed(4));
      root.style.setProperty("--uy", my.toFixed(4));
    }

    if (onScreen) start();
  }

  function start() {
    if (frameId || !onScreen) return;
    frameId = window.requestAnimationFrame(tick);
  }

  build();

  if (reduced.matches) {
    /* Simplified experience: the pictures are simply there, no depth, no
       parallax. The section still reads as a wall of her work. */
    root.style.setProperty("--u", "1");
    scene.classList.add("is-still");
    return;
  }

  window.addEventListener("scroll", start, { passive: true });
  window.addEventListener("resize", function () { written = -1; start(); }, { passive: true });
  document.addEventListener("visibilitychange", function () { written = -1; start(); });

  if (fine.matches) {
    window.addEventListener("pointermove", function (e) {
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = (e.clientY / window.innerHeight) * 2 - 1;
      start();
    }, { passive: true });
  }

  /* Off screen there is nothing to compute. Same contract as hero.js. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      start();
    }).observe(scene);
  } else {
    onScreen = true;
  }

  onScreen = true;
  smooth = raw = progress();
  start();
})();
