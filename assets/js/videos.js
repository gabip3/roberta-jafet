/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — CHAPTER 07, THE VIDEOS
   ---------------------------------------------------------------------------
   Two jobs, and both are about not loading things nobody asked for.

   THE PLAYER. Every card is a local thumbnail and a button until it is
   clicked; only then is an iframe built, and only for that card. Eight embeds
   on a page already carrying 132 photographs would mean eight players, eight
   sets of third-party cookies and several megabytes fetched before anybody
   pressed anything, on a site whose whole argument is that it loads and moves
   well. No video ids live here: they are on the buttons, in the markup, next
   to the thumbnails they belong to.

   THE RAIL. Three at a time, stepped by the arrows beside the heading, with a
   button that turns the rail into the grid of all eight. The classes that make
   any of that happen are added HERE, never in the stylesheet, so a visitor
   without JavaScript gets a plain grid of eight rather than three cards behind
   a control that cannot work.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var section = document.getElementById("chapter-07");
  if (!section) return;

  /* ── THE PLAYER ─────────────────────────────────────────────────────── */

  section.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".video__btn") : null;
    if (!btn) return;

    var card = btn.closest(".video");
    if (!card || card.classList.contains("is-playing")) return;

    var id = btn.getAttribute("data-video");
    if (!id) return;

    var frame = card.querySelector(".video__frame");
    if (!frame) return;
    var img = frame.querySelector("img");

    var player = document.createElement("iframe");

    /* autoplay, because the click WAS the instruction to play; nocookie,
       because there is no reason to hand YouTube a tracking cookie for
       somebody who only wanted to watch one clip */
    player.src = "https://www.youtube-nocookie.com/embed/" + id +
                 "?autoplay=1&rel=0&modestbranding=1";

    var titleEl = card.querySelector(".video__title");
    player.title = titleEl ? titleEl.textContent.trim() : "Video";
    player.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
    player.setAttribute("allowfullscreen", "");

    if (img) img.remove();
    frame.appendChild(player);
    card.classList.add("is-playing");
  });


  /* ── THE RAIL ───────────────────────────────────────────────────────── */

  var list = section.querySelector(".videos__list");
  var prev = section.querySelector(".videos__arrow--prev");
  var next = section.querySelector(".videos__arrow--next");
  var more = document.getElementById("videos-more");
  if (!list || !prev || !next || !more) return;

  var cards = list.querySelectorAll(".video");
  var count = more.querySelectorAll("[data-count]");
  for (var i = 0; i < count.length; i++) count[i].textContent = cards.length;
  more.hidden = false;

  function step() {
    /* a card and its gap, so the rail lands on a card edge every time rather
       than halfway through one */
    var card = list.querySelector(".video");
    if (!card) return list.clientWidth;
    var gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function sync() {
    /* in grid mode there is nothing to scroll, so the arrows leave */
    if (list.classList.contains("is-grid")) {
      prev.hidden = true;
      next.hidden = true;
      return;
    }
    var max = list.scrollWidth - list.clientWidth;
    prev.hidden = list.scrollLeft <= 4;
    next.hidden = list.scrollLeft >= max - 4;
  }

  prev.addEventListener("click", function () { list.scrollBy({ left: -step(), behavior: "smooth" }); });
  next.addEventListener("click", function () { list.scrollBy({ left:  step(), behavior: "smooth" }); });
  list.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync, { passive: true });

  more.addEventListener("click", function () {
    var open = list.classList.toggle("is-grid");
    more.classList.toggle("is-open", open);
    more.setAttribute("aria-expanded", open ? "true" : "false");

    if (open) {
      /* the rail may be scrolled halfway along; the grid starts at the left */
      list.scrollLeft = 0;
    } else {
      list.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    sync();
  });

  sync();
})();
