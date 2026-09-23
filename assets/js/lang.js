/* ═══════════════════════════════════════════════════════════════════════════
   ROBERTA JAFET — LANGUAGE
   ---------------------------------------------------------------------------
   She lives in the United States and works in Brazil, so the site opens in
   both and lets the visitor choose.

   The choice itself is already made before first paint, by the inline script in
   <head> — it reads a remembered choice, or falls back to the browser's own
   language. This file only wires the buttons, so the page never flashes the
   wrong language on load.

   Swapping is done in CSS, not here: each translated element carries data-l
   and the stylesheet hides the other one. That keeps inline markup — the
   italic show titles, the company name in her colour — intact in both
   languages, which a textContent dictionary would flatten.
   ═════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var root = document.documentElement;

  /* Document-wide, not inside one box: there are two pairs now, the one on the
     opening screen and the one in the menu, and both have to light up
     together. */
  var buttons = document.querySelectorAll("[data-set-lang]");
  if (!buttons.length) return;

  /* No em dashes anywhere the visitor can see them, including the tab. */
  var TITLES = {
    en: "Roberta Jafet · Performer, Producer, Creative Leader",
    pt: "Roberta Jafet · Performer, Produtora, Líder Criativa"
  };

  function apply(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    document.title = TITLES[lang] || TITLES.en;

    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute("data-set-lang") === lang;
      buttons[i].setAttribute("aria-pressed", on ? "true" : "false");
    }

    /* Line lengths change with the language, and both scenes measure the
       layout they are choreographing. Let them re-measure. */
    window.dispatchEvent(new Event("resize"));
  }

  function choose(lang) {
    try { localStorage.setItem("rj-lang", lang); } catch (e) {}
    apply(lang);
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      choose(this.getAttribute("data-set-lang"));
    });
  }

  /* Reflect whatever the inline script already settled on. */
  apply(root.getAttribute("data-lang") === "pt" ? "pt" : "en");
})();
