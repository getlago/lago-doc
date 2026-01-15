// Reveal content once fonts and DOM are ready
(function() {
  function revealContent() {
    document.documentElement.classList.add('ready');
  }

  // Wait for both DOM and fonts to be ready
  if (document.fonts && document.fonts.ready) {
    Promise.all([
      new Promise(function(resolve) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          resolve();
        } else {
          document.addEventListener('DOMContentLoaded', resolve);
        }
      }),
      document.fonts.ready
    ]).then(function() {
      // Small delay to ensure everything is painted
      setTimeout(revealContent, 50);
    });
  } else {
    // Fallback for browsers without Font Loading API
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(revealContent, 50);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(revealContent, 50);
      });
    }
  }
})();
