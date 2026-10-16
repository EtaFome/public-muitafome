// Links do painel: em desenvolvimento apontam para o Next local; em produção, para o subdomínio "painel".
(function () {
  var local = location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  var base = local ? "http://localhost:3000" : location.protocol + "//painel." + location.hostname.replace(/^www\./, "");
  document.querySelectorAll("[data-painel]").forEach(function (a) {
    a.href = base + a.getAttribute("data-painel");
  });
  // Cliente web: localhost:3001 em desenvolvimento, subdomínio "app" em produção.
  var app = local ? "http://localhost:3001" : location.protocol + "//app." + location.hostname.replace(/^www\./, "");
  document.querySelectorAll("[data-app]").forEach(function (a) {
    a.href = app + a.getAttribute("data-app");
  });
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
