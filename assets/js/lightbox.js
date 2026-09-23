/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — THE LIGHTBOX
   ---------------------------------------------------------------------------
   A still opens to the size of the screen.

   The strip shows these at 420px tall, which is enough to know what a
   photograph is and not enough to look at it. These are production stills from
   houses that seat two thousand people — the whole point of them is the scale
   of what she was standing in.

   It is built from the DOM that is already there: clicking any .shot reads the
   list of stills in that strip and steps through them. Nothing is duplicated
   into a second data structure that could fall out of sync with the markup.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var section = document.getElementById("chapter-05");
  if (!section) return;

  var shots = [];      /* the current strip, in order */
  var index = 0;
  var box, img, prev, next, closeBtn;

  function build() {
    box = document.createElement("div");
    box.className = "lb";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML =
      '<button class="lb__close" type="button" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5 L19 19 M19 5 L5 19"/></svg>' +
      '</button>' +
      '<button class="lb__nav lb__nav--prev" type="button" aria-label="Previous">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 L7 12 L15 20"/></svg>' +
      '</button>' +
      '<figure class="lb__frame"><img alt=""></figure>' +
      '<button class="lb__nav lb__nav--next" type="button" aria-label="Next">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4 L17 12 L9 20"/></svg>' +
      '</button>';
    document.body.appendChild(box);

    img      = box.querySelector("img");
    prev     = box.querySelector(".lb__nav--prev");
    next     = box.querySelector(".lb__nav--next");
    closeBtn = box.querySelector(".lb__close");

    prev.addEventListener("click", function (e) { e.stopPropagation(); go(-1); });
    next.addEventListener("click", function (e) { e.stopPropagation(); go(1); });
    closeBtn.addEventListener("click", close);
    /* the backdrop closes; the photograph itself does not */
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.classList.contains("lb__frame")) close();
    });
  }

  function show() {
    var src = shots[index].getAttribute("src");
    img.setAttribute("src", src);
    prev.hidden = shots.length < 2;
    next.hidden = shots.length < 2;
  }

  function go(d) {
    index = (index + d + shots.length) % shots.length;   /* wraps both ways */
    show();
  }

  function open(strip, el) {
    if (!box) build();
    shots = [].slice.call(strip.querySelectorAll(".shot img"));
    index = shots.indexOf(el);
    if (index < 0) index = 0;
    show();
    document.documentElement.classList.add("lb-open");
    box.removeAttribute("aria-hidden");
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!box) return;
    document.documentElement.classList.remove("lb-open");
    box.setAttribute("aria-hidden", "true");
  }

  /* one listener for the whole index, so galleries added later need no wiring */
  section.addEventListener("click", function (e) {
    var hit = e.target.closest ? e.target.closest(".shot img") : null;
    if (!hit) return;
    var strip = hit.closest(".strip");
    if (!strip) return;
    open(strip, hit);
  });

  document.addEventListener("keydown", function (e) {
    if (!document.documentElement.classList.contains("lb-open")) return;
    if (e.key === "Escape")     { close(); return; }
    if (e.key === "ArrowRight") { go(1);  return; }
    if (e.key === "ArrowLeft")  { go(-1); }
  });
})();
