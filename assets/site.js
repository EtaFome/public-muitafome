// Links do painel: em desenvolvimento apontam para o Next local; em produção, para o subdomínio "painel".
(function () {
  var local = location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  var base = local ? "http://localhost:3000" : location.protocol + "//painel." + location.hostname.replace(/^www\./, "");
  document.querySelectorAll("[data-painel]").forEach(function (a) {
    a.href = base + a.getAttribute("data-painel");
  });
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
