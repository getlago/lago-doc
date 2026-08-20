// Month navigation for the changelog right rail.
// Mintlify replaces the usual table of contents with its Filters panel on
// changelog pages, so there is no way to jump between months. This builds a
// month list from the <Update> anchors already on the page and puts it above
// the filters. Read-only: it never touches the filters themselves.
(function () {
  var NAV_ID = 'changelog-month-nav';
  var LABEL_PREFIX = 'Navigate to changelog:';

  function onChangelogPage() {
    return /\/changelog\/product(-\d{4})?\/?$/.test(window.location.pathname);
  }

  // Each <Update> renders as .update-container with the month anchor as its id.
  // The label text lives on the anchor's aria-label, e.g. "…: August 2026".
  function collectMonths() {
    var out = [];
    document.querySelectorAll('.update-container[id]').forEach(function (el) {
      var link = el.querySelector('a[aria-label^="' + LABEL_PREFIX + '"]');
      var label = link
        ? link.getAttribute('aria-label').slice(LABEL_PREFIX.length).trim()
        : '';
      if (label) out.push({ id: el.id, label: label });
    });
    return out;
  }

  function build(months) {
    var year = (months[0].label.match(/\d{4}/) || [''])[0];
    var nav = document.createElement('nav');
    nav.id = NAV_ID;
    nav.setAttribute('aria-label', 'Jump to a month');

    if (year) {
      var heading = document.createElement('p');
      heading.className = 'changelog-month-nav__year';
      heading.textContent = year;
      nav.appendChild(heading);
    }

    var list = document.createElement('ul');
    list.className = 'changelog-month-nav__list';
    months.forEach(function (m) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + m.id;
      a.dataset.month = m.id;
      // drop the year from the link text, the heading above already carries it
      a.textContent =
        m.label.replace(/\s*\b(?:19|20)\d{2}\b/, '').replace(/,\s*$/, '').trim() || m.label;
      li.appendChild(a);
      list.appendChild(li);
    });
    nav.appendChild(list);
    return nav;
  }

  // Highlight whichever month is currently in view.
  function trackActive(nav, months) {
    if (!('IntersectionObserver' in window)) return;
    var links = {};
    nav.querySelectorAll('a[data-month]').forEach(function (a) {
      links[a.dataset.month] = a;
    });
    var visible = new Set();
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });
        var first = months.filter(function (m) { return visible.has(m.id); })[0];
        Object.keys(links).forEach(function (id) {
          links[id].classList.toggle('is-active', !!first && id === first.id);
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );
    months.forEach(function (m) {
      var el = document.getElementById(m.id);
      if (el) observer.observe(el);
    });
  }

  function render() {
    if (!onChangelogPage()) return;
    var rail = document.getElementById('content-side-layout');
    if (!rail || document.getElementById(NAV_ID)) return;
    var months = collectMonths();
    if (!months.length) return;

    var nav = build(months);
    var filters = rail.querySelector('#changelog-filters');
    if (filters) rail.insertBefore(nav, filters);
    else rail.appendChild(nav);
    trackActive(nav, months);
  }

  function start() {
    render();
    // Mintlify is a SPA and re-renders the rail on navigation, so keep watching.
    if (!window.MutationObserver) return;
    var pending = null;
    new MutationObserver(function () {
      clearTimeout(pending);
      pending = setTimeout(render, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
