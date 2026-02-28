// Google tag (gtag.js)
(function () {
  var gtid = "G-THTJH5GMEL";
  var s = document.createElement("script");
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + gtid;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", gtid);
})();
