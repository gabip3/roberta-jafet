/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — THE LIGHT CHAPTERS (03 · THE PAUSE, 04 · THE STORY)
   ---------------------------------------------------------------------------
   Deliberately the smallest file on the site.

   Chapters 01 and 02 each run a per-frame loop, because both are choreographies
   scrubbed by the wheel. The two light chapters are neither. They sit in normal
   flow and their only motion is a one-time arrival, so there is nothing to
   compute per frame and no rAF loop here at all — an observer marks each
   element as it is reached, once, and disconnects when the last one lands.

   That is what makes the pause a pause: the page stops being driven, and it
   stays that way through the story.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* Both light chapters arrive the same way, so this watches the whole
     document rather than one section. */
  var items = document.querySelectorAll(".lift");
  if (!items.length) return;

  /* No JS, or no observer: everything is simply present. The CSS default is
     the arrived state; .js is what pulls it back. */
  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add("is-in");
    return;
  }

  var left = items.length;

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
        if (--left === 0) io.disconnect();
      });
    },
    /* A little before the element reaches the middle of the screen, so things
       are already settled by the time they are being read. */
    { rootMargin: "0px 0px -18% 0px", threshold: 0.01 }
  );

  for (var j = 0; j < items.length; j++) io.observe(items[j]);
})();
