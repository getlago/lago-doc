// Reveal content once fonts and DOM are ready, or after a short ceiling.
// The ceiling matters: style.css hides <html> until .ready lands, so a slow font
// download would otherwise hold the whole page on a blank screen.
(function() {
  var REVEAL_CEILING_MS = 300;
  var revealed = false;

  function revealContent() {
    if (revealed) return;
    revealed = true;
    document.documentElement.classList.add('ready');
  }

  function domReady() {
    return new Promise(function(resolve) {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', resolve);
      }
    });
  }

  // Hard ceiling. Whatever else happens, the page paints by now.
  setTimeout(revealContent, REVEAL_CEILING_MS);

  // Preferred path: reveal as soon as DOM and fonts are both settled.
  if (document.fonts && document.fonts.ready) {
    Promise.all([domReady(), document.fonts.ready]).then(function() {
      setTimeout(revealContent, 50);
    });
  } else {
    domReady().then(function() {
      setTimeout(revealContent, 50);
    });
  }
})();
