// Lago's product is free and self-hosted, so a docs reader leaving for the repo
// is a real signal, not a bounce. GA4 stops watching at the domain boundary,
// which made that path invisible.
//
// The event records where on the page the link sat. The Docker guide alone
// carries five in-content GitHub links plus the ones in the nav and footer, all
// on the same page path, and they mean completely different things: a click in
// install instructions is deploy intent, a click in the nav is navigation.
// link_location is derived from DOM landmarks rather than matching on the URL,
// so it stays correct when pages are restructured.
//
// Mirrors the outbound_click event the marketing site sends, distinguished by
// surface, so both can be read together or apart.
(function () {
  var TRACKED_HOSTS = ["github.com"];

  function hostOf(href) {
    try {
      return new URL(href, window.location.origin).hostname;
    } catch (error) {
      return null;
    }
  }

  function trackedDomain(host) {
    if (!host) return null;
    for (var i = 0; i < TRACKED_HOSTS.length; i++) {
      var h = TRACKED_HOSTS[i];
      if (host === h || host.slice(-(h.length + 1)) === "." + h) return h;
    }
    return null;
  }

  function linkLocation(anchor) {
    if (anchor.closest("footer")) return "footer";
    if (anchor.closest("nav")) return "nav";
    if (anchor.closest("main")) return "content";
    return "chrome";
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
      if (!href) return;

      var domain = trackedDomain(hostOf(href));
      if (!domain) return;

      if (typeof window.gtag !== "function") return;

      window.gtag("event", "outbound_click", {
        link_domain: domain,
        link_location: linkLocation(anchor),
        surface: "docs",
        page_path: window.location.pathname,
        link_url: href,
        link_text: (anchor.textContent || "").trim().slice(0, 100),
      });
    },
    true
  );
})();
