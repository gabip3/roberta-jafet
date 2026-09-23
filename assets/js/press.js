/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — THE PRESS
   ---------------------------------------------------------------------------
   One row, and a button for the rest.

   Twelve pieces is the honest number and all twelve are in the markup, but
   three rows of them is the whole screen before anything else gets a chance.
   Her own site does exactly this: four, then "Mais Notícias".

   Everything is in the DOM either way, so the count in the button is read from
   the list rather than written down somewhere that could drift, and a visitor
   without JavaScript gets all twelve rather than four and a dead button.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var list = document.querySelector(".press__list");
  var btn  = document.getElementById("press-more");
  if (!list || !btn) return;

  /* The CSS hides the overflow only once this class is on, so no-JS shows
     everything instead of hiding it behind a button that cannot work. */
  list.classList.add("is-clipped");
  btn.hidden = false;

  var hidden = list.querySelectorAll(".press__item:nth-child(n+5)").length;
  var count  = btn.querySelectorAll("[data-count]");
  for (var i = 0; i < count.length; i++) count[i].textContent = hidden;

  btn.addEventListener("click", function () {
    var open = list.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");

    if (!open) {
      /* collapsing from far down the list would leave the reader stranded
         below content that no longer exists */
      list.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
