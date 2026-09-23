/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — CHAPTER 04, THE PLATE
   ---------------------------------------------------------------------------
   The parallax on the full-bleed Elphaba plate, and nothing else.

   It works in PIXELS, not percentages, and that is the whole point of it. The
   picture is laid out at width 100% and height auto, so its height is whatever
   its own ratio makes of the screen width — which changes with every viewport
   and cannot be written into a stylesheet. The travel is the difference between
   that height and the frame height, measured, so the picture drifts exactly as
   far as it can and never one pixel further. No edge is ever exposed, at any
   size, without a magic number anywhere.

   Percentages were the earlier version and they were guesswork: translateY(%)
   resolves against the element own height, so every change to the frame or the
   crop meant re-deriving the numbers by hand and getting them slightly wrong.

   The drift runs across the cover range — from the moment the plate edge
   appears at the bottom of the viewport to the moment it clears the top.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var frame = document.querySelector(".story__plate--b");
  if (!frame) return;
  var img = frame.querySelector("img");
  if (!img) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* The scrollbar is not part of the screen. Plain 100vw counts it, which puts
     the right edge of a full-bleed plate underneath it. */
  function bleed() {
    document.documentElement.style.setProperty(
      "--vw", document.documentElement.clientWidth + "px");
  }

  /* How far the picture travels, and where it starts.

     Everything the frame hides is available, but taking all of it makes the
     picture race — on a wide short screen the hidden strip can run past 900px,
     which reads as the photograph sliding rather than drifting.

     So the drift is capped at 46% of the frame height. At an ordinary desktop
     that cap is above the slack and does nothing, which is the intent: the
     picture uses everything it has, because a cap that bites on normal screens
     is how the first three attempts ended up invisible. It only engages on the
     shapes where the slack is genuinely absurd. Whatever it does leave over is
     split evenly above and below, so the picture stays centred on its subject. */
  var travel = 0;
  var base = 0;
  function measure() {
    var slack = Math.max(0, img.offsetHeight - frame.clientHeight);
    travel = Math.min(slack, frame.clientHeight * 0.46);
    base = -(slack - travel) / 2;
  }

  /* Keyed off the pending frame id rather than a boolean. A boolean stays true
     if the tab is hidden between the request and the callback, and the loop
     then parks forever. */
  var frameId = 0;
  var onScreen = false;
  var written = null;

  function put(y) {
    if (written !== null && Math.abs(y - written) < 0.5) return;
    written = y;
    img.style.transform = "translateY(" + y.toFixed(1) + "px)";
  }

  function tick() {
    frameId = 0;
    if (!travel) return;

    var r = frame.getBoundingClientRect();
    var vh = window.innerHeight;

    var p = (vh - r.top) / (vh + r.height);
    if (p < 0) p = 0;
    if (p > 1) p = 1;

    put(base - travel * p);
  }

  function start() {
    if (frameId || !onScreen) return;
    frameId = window.requestAnimationFrame(tick);
  }

  /* Reduced motion still needs the picture centred rather than top-aligned,
     so it settles on the middle of the travel and stops there. */
  function settle() {
    measure();
    put(base - travel / 2);
  }

  function refresh() {
    bleed();
    if (reduced.matches) return settle();
    measure();
    written = null;
    start();
  }

  /* height auto means there is nothing to measure until the file has decoded */
  bleed();
  if (img.complete && img.naturalHeight) refresh();
  else img.addEventListener("load", refresh, { once: true });

  if (reduced.addEventListener) reduced.addEventListener("change", refresh);

  /* nothing computes unless the plate is near the screen */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      start();
    }, { rootMargin: "25% 0px 25% 0px" }).observe(frame);
  } else {
    onScreen = true;
  }

  window.addEventListener("scroll", start, { passive: true });
  window.addEventListener("resize", refresh, { passive: true });

  onScreen = true;
  refresh();
})();
