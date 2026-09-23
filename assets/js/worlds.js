/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — CHAPTER 05, THE WORLDS SHE STEPPED INTO
   ---------------------------------------------------------------------------
   Two separate states, and keeping them separate is the point.

   OPEN is hover or focus: the title comes to full strength, the rule grows,
   the credits arrive. It is a preview and it follows the cursor freely.

   EXPANDED is a click: the production unrolls underneath and stays there until
   it is dismissed. One at a time, so the list never becomes a wall — opening a
   second closes the first.

   Both are CSS reacting to a class. This file only decides which class.

   Desktop is pointed at with the cursor. Mobile has no cursor, so the centre of
   the screen does the pointing instead: whichever title is crossing the middle
   of the viewport is the one that is open. That is a translation of the idea,
   not a fallback — on a phone the section still opens one world at a time as
   you move through it.

   Keyboard gets the same treatment as hover, so tabbing the list is not a
   silent experience.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var section = document.getElementById("chapter-05");
  if (!section) return;

  var worlds = section.querySelectorAll(".world");
  if (!worlds.length) return;

  var fine = window.matchMedia("(hover: hover) and (pointer: fine)");

  var current = null;

  function open(name) {
    if (name === current) return;
    current = name;

    for (var i = 0; i < worlds.length; i++) {
      worlds[i].classList.toggle("is-open", worlds[i].dataset.world === name);
    }
  }

  function close(name) {
    if (current === name) open(null);
  }


  /* ── EXPAND ─────────────────────────────────────────────────────────────
     One production at a time. Opening a second closes the first, which keeps
     the list readable and means the page never grows without bound.
  */
  var expanded = null;

  function expand(el) {
    var next = el === expanded ? null : el;

    if (expanded) {
      expanded.classList.remove("is-expanded");
      var oldBtn = expanded.querySelector(".world__link");
      if (oldBtn) oldBtn.setAttribute("aria-expanded", "false");
    }

    expanded = next;

    if (expanded) {
      expanded.classList.add("is-expanded");
      var btn = expanded.querySelector(".world__link");
      if (btn) btn.setAttribute("aria-expanded", "true");

      /* clientWidth is 0 while the panel is collapsed, so the arrows cannot
         know what they are looking at until it has opened */
      var strip = expanded.querySelector(".strip");
      if (strip && strip.__sync) window.requestAnimationFrame(strip.__sync);
    }
  }

  for (var e = 0; e < worlds.length; e++) {
    (function (el) {
      var btn = el.querySelector(".world__link");
      if (!btn || !btn.hasAttribute("aria-controls")) return;
      btn.addEventListener("click", function () { expand(el); });
    })(worlds[e]);
  }

  /* Escape closes whatever is open, from anywhere in the list */
  section.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && expanded) {
      var btn = expanded.querySelector(".world__link");
      expand(null);
      if (btn) btn.focus();
    }
  });


  /* ── POINTER ────────────────────────────────────────────────────────── */

  if (fine.matches) {
    for (var i = 0; i < worlds.length; i++) {
      (function (el) {
        var name = el.dataset.world;
        el.addEventListener("pointerenter", function () { open(name); });
        el.addEventListener("pointerleave", function () { close(name); });
        /* keyboard is treated exactly like hover */
        el.addEventListener("focusin", function () { open(name); });
        el.addEventListener("focusout", function () { close(name); });
      })(worlds[i]);
    }
  }


  /* ── THE STRIP ARROWS ───────────────────────────────────────────────────
     A scrollbar reports state; an arrow invites. The bar under the stills was
     read as decoration, so it is gone and these do the work.

     Each arrow hides at the end it can no longer take you to, which is the
     part that makes it honest — an arrow that stays lit at the end of a row
     is a button that lies.
  */
  function wireStrip(strip) {
    var track = strip.querySelector(".strip__track");
    var prev  = strip.querySelector(".strip__arrow--prev");
    var next  = strip.querySelector(".strip__arrow--next");
    if (!track || !prev || !next) return;

    function step() {
      /* not a full page: leaving part of the last photograph visible is what
         tells you the row kept going */
      return Math.max(240, track.clientWidth * 0.8);
    }

    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      var x = track.scrollLeft;
      prev.hidden = x <= 4;
      next.hidden = x >= max - 4;
    }

    prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left:  step(), behavior: "smooth" }); });
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });

    /* the stills are lazy, so the scrollable width grows as they arrive */
    var imgs = track.querySelectorAll("img");
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].addEventListener("load", sync, { once: true });
    }

    sync();
    strip.__sync = sync;
  }

  var strips = section.querySelectorAll(".strip");
  for (var st = 0; st < strips.length; st++) wireStrip(strips[st]);


  /* ── SCROLL, WHERE THERE IS NO CURSOR ───────────────────────────────────
     A narrow band across the middle of the viewport. A title is open while it
     is crossing that band, which means one world at a time and a definite
     hand-over rather than two half-open states.
  */
  if (!fine.matches && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) open(entry.target.dataset.world);
          else close(entry.target.dataset.world);
        });
      },
      { rootMargin: "-46% 0px -46% 0px", threshold: 0 }
    );
    for (var k = 0; k < worlds.length; k++) io.observe(worlds[k]);
  }

  /* No pointer and no observer: open the first one, so the list arrives with
     one name already at full strength and reads as an index rather than five
     equally grey words. */
  if (!fine.matches && !("IntersectionObserver" in window)) {
    open(worlds[0].dataset.world);
  }
})();
