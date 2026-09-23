/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — CHAPTER 01, THE OPENING
   ---------------------------------------------------------------------------
   This file drives one thing: a follow spot.

   It writes four live values to :root, and the CSS does everything else.
     --sx --sy   where the light is, in px
     --sr        how open it is, in px
     --lum       how bright it is, 0 → 1
     --tilt      the beam angle, so the cone always leans towards the spot
     --p         scroll progress through the hero, 0 → 1

   The opening is a path through the room rather than a set of states, which is
   why it lives here in code and not in keyframes: the light has to search, slow
   down, change its mind, settle, and then hand over to the visitor's cursor.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var hero = document.getElementById("chapter-01");
  if (!hero) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine    = window.matchMedia("(hover: hover) and (pointer: fine)");


  /* ── THE PATH ─────────────────────────────────────────────────────────────
     Milliseconds from first frame. The search is the long beat on purpose:
     a follow spot hunting in the dark is the most theatrical thing the page
     does, and it is the only moment the visitor is not yet reading a name.
  */
  var T = {
    wake:   380,    /* the light exists                       */
    sweep: 2500,    /* it crosses the room, looking           */
    gather:3250,    /* slows, turns back towards centre       */
    open:  4900     /* opens on her                           */
  };

  /* CSS-driven beats, keyed off the same clock. */
  var CUES = [
    { at:  380, cls: "s1" },   /* light                       */
    { at: 1150, cls: "s2" },   /* haze in the air             */
    { at: 4350, cls: "s4" },   /* the roles                   */
    { at: 5600, cls: "is-ready" }
  ];


  /* ── ROOM METRICS ─────────────────────────────────────────────────────── */

  var vw, vh, restX, restY, rSearch, rOpen;

  function measure() {
    vw = window.innerWidth;
    vh = window.innerHeight;

    /* Rest position is the centre of the name itself, measured rather than
       assumed, so it stays correct when the name stacks in portrait. */
    var words = document.querySelectorAll(".name__layer--ghost .word");
    if (words.length) {
      var a = words[0].getBoundingClientRect();
      var b = words[words.length - 1].getBoundingClientRect();
      restX = (Math.min(a.left, b.left) + Math.max(a.right, b.right)) / 2;
      restY = (Math.min(a.top, b.top) + Math.max(a.bottom, b.bottom)) / 2;
    } else {
      restX = vw / 2;
      restY = vh * 0.47;
    }

    rSearch = Math.min(vw, vh) * 0.14;
    rOpen   = Math.max(vw * 0.40, vh * 0.30);
  }


  /* ── EASING ───────────────────────────────────────────────────────────── */

  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  function easeOutCubic(t)  { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t)    { return a + (b - a) * t; }
  function clamp01(t)       { return t < 0 ? 0 : t > 1 ? 1 : t; }


  /* ── THE OPENING, AS A FUNCTION OF TIME ───────────────────────────────── */

  /* Where the sweep leaves the light, so the gather can pick it up from there
     without a jump. */
  var sweepEndX, sweepEndY;

  function opening(t, out) {
    var startX = vw * 0.17;
    var endX   = vw * 0.83;
    var lineY  = vh * 0.605;

    if (t < T.wake) {
      out.x = startX; out.y = lineY; out.r = rSearch; out.lum = 0;
      return;
    }

    if (t < T.sweep) {
      var u = easeInOutSine(clamp01((t - T.wake) / (T.sweep - T.wake)));
      out.x = lerp(startX, endX, u);
      /* it rides up over the middle of the room, the way a hunting spot does */
      out.y = lineY - vh * 0.115 * Math.sin(Math.PI * u);
      out.r = rSearch * (1 + 0.2 * Math.sin(Math.PI * u));
      out.lum = clamp01((t - T.wake) / 620) * 0.72;
      sweepEndX = out.x; sweepEndY = out.y;
      return;
    }

    if (t < T.gather) {
      var g = easeOutCubic(clamp01((t - T.sweep) / (T.gather - T.sweep)));
      out.x = lerp(sweepEndX, restX, g);
      out.y = lerp(sweepEndY, restY, g);
      out.r = rSearch;
      out.lum = lerp(0.72, 0.82, g);
      return;
    }

    var o = easeOutCubic(clamp01((t - T.gather) / (T.open - T.gather)));
    out.x = restX;
    out.y = restY;
    out.r = lerp(rSearch, rOpen, o);
    out.lum = lerp(0.82, 1, o);
  }


  /* ── STATE ────────────────────────────────────────────────────────────── */

  var frame = { x: 0, y: 0, r: 0, lum: 0 };
  var cur   = { x: 0, y: 0, r: 0, lum: 0 };   /* what is actually on screen */
  var pointer = null;                          /* last cursor position, px  */
  var t0 = 0;
  var done = false;
  var progress = -1;
  var onScreen = true;
  var frameId = 0;
  var fired = 0;

  function cue(now) {
    while (fired < CUES.length && now >= CUES[fired].at) {
      body.classList.add(CUES[fired].cls);
      fired++;
    }
  }

  /* If the visitor moves before the opening finishes, stop performing and give
     them the lit stage. Waiting out an animation is never the deal. */
  function settle() {
    if (done) return;
    done = true;
    t0 = performance.now() - (T.open + 1);
    for (; fired < CUES.length; fired++) body.classList.add(CUES[fired].cls);
    start();
  }


  /* ── THE LOOP ─────────────────────────────────────────────────────────────
     Keyed off the pending frame id rather than a boolean, so the request and
     the flag cannot drift apart. Deliberately not gated on document.hidden:
     rAF already stops in a background tab, and some embedded webviews report
     hidden while perfectly visible — which would park the hero forever.
  */

  function scrollProgress() {
    var travel = hero.offsetHeight - vh;
    if (travel <= 0) return 0;
    return clamp01(-hero.getBoundingClientRect().top / travel);
  }

  function tick(now) {
    frameId = 0;
    if (!t0) t0 = now;
    var t = now - t0;

    cue(t);
    if (t >= T.open) done = true;

    opening(t, frame);

    /* Once the light has settled it belongs to the visitor: it leans towards
       the cursor without ever leaving the name, and breathes when nobody is
       there. The lean is a fraction of the distance, not the whole of it —
       an operator nudges a follow spot, they do not throw it. */
    if (done) {
      if (pointer) {
        frame.x = restX + (pointer.x - restX) * 0.26;
        frame.y = restY + (pointer.y - restY) * 0.18;
      }
      frame.r = rOpen * (1 + 0.022 * Math.sin(t / 2600));
      frame.lum = 1;
    }

    /* Ease towards the target so the light drifts rather than snaps. */
    var k = done ? 0.055 : 1;
    cur.x   = done ? lerp(cur.x, frame.x, k)     : frame.x;
    cur.y   = done ? lerp(cur.y, frame.y, k)     : frame.y;
    cur.r   = done ? lerp(cur.r, frame.r, 0.08)  : frame.r;
    cur.lum = frame.lum;

    root.style.setProperty("--sx", cur.x.toFixed(1) + "px");
    root.style.setProperty("--sy", cur.y.toFixed(1) + "px");
    root.style.setProperty("--sr", cur.r.toFixed(1) + "px");
    root.style.setProperty("--lum", cur.lum.toFixed(3));

    /* Aim the cone: the beam hangs above the frame, so the angle to the spot
       is measured from that apex. */
    /* Positive CSS rotation swings a downward beam to the left, so the sign
       is inverted relative to the spot offset. */
    var tilt = Math.atan2(vw / 2 - cur.x, cur.y + vh * 0.22) * 180 / Math.PI;
    root.style.setProperty("--tilt", tilt.toFixed(2));

    var p = scrollProgress();
    if (Math.abs(p - progress) > 0.0004) {
      progress = p;
      root.style.setProperty("--p", p.toFixed(4));
    }

    if (onScreen) start();
  }

  function start() {
    if (frameId || !onScreen) return;
    frameId = window.requestAnimationFrame(tick);
  }


  /* ── WIRING ───────────────────────────────────────────────────────────── */

  measure();

  if (reduced.matches) {
    settle();
  } else {
    window.addEventListener("wheel",      settle, { once: true, passive: true });
    window.addEventListener("touchstart", settle, { once: true, passive: true });
    window.addEventListener("keydown",    settle, { once: true });
  }

  if (fine.matches && !reduced.matches) {
    window.addEventListener("pointermove", function (e) {
      pointer = { x: e.clientX, y: e.clientY };
      start();
    }, { passive: true });
    document.addEventListener("pointerleave", function () { pointer = null; });
  }

  window.addEventListener("scroll", start, { passive: true });
  window.addEventListener("resize", function () {
    measure();
    progress = -1;
    start();
  }, { passive: true });
  document.addEventListener("visibilitychange", function () { progress = -1; start(); });

  /* Off screen there is nothing to compute. Chapter 02 will scroll past this. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      start();
    }).observe(hero);
  }

  /* Fonts change the measured centre of the name, so re-measure when they land. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { measure(); start(); });
  }

  start();
})();
