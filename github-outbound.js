// Lago's product is free and self-hosted, so a reader leaving the docs for the
// repo is a conversion, not a bounce. GA4 stops watching at the domain
// boundary, which made that path invisible: the reader who goes on to deploy
// looked identical to the one who gave up.
//
// Five GitHub links sit on the Docker install page alone, which is exactly
// where a self-hosted evaluator leaves.
//
// Mirrors the github_outbound_click event the marketing site sends, so both
// surfaces report the same event name into GA4.
(function () {
  var TRACKED_HOSTS = ["github.com"];

  function hostOf(href) {
    try {
      return new URL(href, window.location.origin).hostname;
    } catch (error) {
      return null;
    }
  }

  function isTracked(host) {
    if (!host) return false;
    for (var i = 0; i < TRACKED_HOSTS.length; i++) {
      var h = TRACKED_HOSTS[i];
      if (host === h || host.slice(-(h.length + 1)) === "." + h) return true;
    }
    return false;
  }

  // Capture phase: the docs are a SPA and some handlers stop propagation.
  document.addEventListener(
    "click",
    function (event) {
      var anchor = event.target && event.target.closest
        ? event.target.closest("a")
        : null;
      if (!anchor) return;

      var href = anchor.getAttribute("href");
      if (!href || !isTracked(hostOf(href))) return;

      if (typeof window.gtag !== "function") return;

      window.gtag("event", "github_outbound_click", {
        page_path: window.location.pathname,
        link_url: href,
        link_text: (anchor.textContent || "").trim().slice(0, 100),
        source_surface: "docs",
      });
    },
    true
  );
})();
