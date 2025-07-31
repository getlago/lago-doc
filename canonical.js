const canonical = document.createElement("link");
canonical.rel = "canonical";
canonical.href = "https://getlago.com" + window.location.pathname;
document.head.appendChild(canonical);