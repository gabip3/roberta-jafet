/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — THE MENU
   ---------------------------------------------------------------------------
   Opens and closes the room, and keeps the keyboard honest while it is open.

   Everything visual is CSS reacting to one class on <html>. This file decides
   when that class is there, restores the scroll position the overlay would
   otherwise lose, holds focus inside the room, and flips the button to dark
   ink on the two light chapters so it does not disappear into paper.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var root  = document.documentElement;
  var btn   = document.getElementById("menu-btn");
  var panel = document.getElementById("menu-panel");
  if (!btn || !panel) return;

  var open = false;
  var scrollY = 0;

  /* Set while a chapter link is being followed. Closing normally puts the
     reader back where they were; closing on the way somewhere must not. */
  var goingSomewhere = false;

  function focusables() {
    return panel.querySelectorAll("a[href], button:not([disabled])");
  }

  function setOpen(next) {
    if (next === open) return;
    open = next;

    if (open) {
      /* overflow:hidden on <html> drops the page to the top, so the position is
         kept and put back by hand rather than left to the browser */
      scrollY = window.scrollY;
      root.classList.add("menu-open");
      btn.setAttribute("aria-expanded", "true");
      panel.removeAttribute("aria-hidden");
      var first = focusables()[0];
      if (first) first.focus({ preventScroll: true });
    } else {
      root.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
      panel.setAttribute("aria-hidden", "true");
      if (!goingSomewhere) window.scrollTo(0, scrollY);
      btn.focus({ preventScroll: true });
    }
  }

  btn.addEventListener("click", function () { setOpen(!open); });

  /* any chapter link closes the room on the way through */
  panel.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href^='#']") : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    var target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    /* THE MENU WENT NOWHERE, and for two separate reasons.

       First, closing restored the position the reader came from, which on a
       first visit is 0 — so the jump was immediately undone. Hence
       goingSomewhere: a close that is on its way somewhere restores nothing.

       Second, and this is the one that actually bit: the jump used
       behavior:"smooth", and smooth scrollIntoView does not complete on this
       page. Measured side by side from the same starting point, "instant"
       lands on chapter 04 at 7219px and "smooth" stays at 0. A long smooth
       scroll is fragile here — the document keeps growing as lazy images
       arrive, and a growing document cancels an in-flight smooth scroll.

       Instant is also the better behaviour. Chapter 04 is seven thousand
       pixels down, past a follow spot and a 3D wall that are both scrubbed by
       the wheel; gliding through all of it at speed is a worse experience than
       a cut, and a menu is supposed to cut. */
    goingSomewhere = true;
    setOpen(false);
    goingSomewhere = false;

    /* NO requestAnimationFrame. Deferring the jump by two frames was the third
       thing wrong with this handler: it needs the document to have grown back
       from the overflow:hidden the open menu puts on <html>, and a rAF is the
       obvious way to wait for that — but a rAF that never fires never jumps,
       and rAF is exactly what stops firing when a tab is not being painted.
       The menu closed and the page stayed put, which is indistinguishable from
       the two earlier bugs and is why this took three passes.

       Reading offsetHeight forces the layout flush synchronously, so the jump
       happens in this same task and depends on nothing. */
    void document.body.offsetHeight;
    target.scrollIntoView({ block: "start" });
  });

  document.addEventListener("keydown", function (e) {
    if (!open) return;

    if (e.key === "Escape") { setOpen(false); return; }

    if (e.key !== "Tab") return;

    /* a full-screen overlay that lets Tab wander onto the page behind it is a
       trap of a different kind — the focus ring disappears somewhere nobody
       can see */
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last  = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ── THE BUTTON ON PAPER ────────────────────────────────────────────────
     Chapters 03 and 04 are the light ones. A chalk-white button vanishes into
     them, so the mark goes dark while either is under the button.
  */
  var light = [document.getElementById("chapter-03"), document.getElementById("chapter-04")]
    .filter(Boolean);

  if (light.length && "IntersectionObserver" in window) {
    var onPaper = 0;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          onPaper += en.isIntersecting ? 1 : -1;
        });
        if (onPaper < 0) onPaper = 0;
        root.classList.toggle("on-paper", onPaper > 0);
      },
      /* a thin band across the top of the screen: the button only cares what
         is directly behind it */
      { rootMargin: "0px 0px -92% 0px", threshold: 0 }
    );
    light.forEach(function (s) { io.observe(s); });
  }
})();
