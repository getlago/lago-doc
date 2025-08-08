const canonical = document.createElement("link");
canonical.rel = "canonical";

// Get the current pathname
let pathname = window.location.pathname;

// Ensure the canonical URL always points to getlago.com/docs/*
// Handle different domain patterns:
// - docs.getlago.com/* -> getlago.com/docs/*
// - doc.getlago.com/* -> getlago.com/docs/*
// - getlago.com/docs/* -> getlago.com/docs/* (already correct)

// If pathname doesn't start with /docs, prepend it
if (!pathname.startsWith('/docs')) {
  pathname = '/docs' + pathname;
}

canonical.href = "https://getlago.com" + pathname;
document.head.appendChild(canonical);