// Google tag (gtag.js)
(function(){
  var gtid = "G-THTJH5GMEL";
  var s = document.createElement("script");
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + gtid;
  s.async = true;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", gtid);
})();

document.addEventListener("DOMContentLoaded", function () {
  // Initialize language from localStorage or default to English
  let savedLang = localStorage.getItem("language");
  if (!savedLang && window.localizationManager) {
    // Detect system locale if no language saved
    savedLang = window.localizationManager.detectSystemLocale();
    localStorage.setItem("language", savedLang);
  }
  if (!savedLang) savedLang = "en";
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";

  // Update language dropdowns
  const languageDropdowns = document.querySelectorAll(".language-dropdown");
  languageDropdowns.forEach((dropdown) => {
    const options = dropdown.querySelectorAll(".language-option");
    options.forEach((option) => {
      option.classList.remove("active");
      if (option.getAttribute("data-lang") === savedLang) {
        option.classList.add("active");
      }
    });
  });

  // Add click handlers for language options
  const languageOptions = document.querySelectorAll(".language-option");
  languageOptions.forEach((option) => {
    option.addEventListener("click", function (e) {
      e.preventDefault();
      const lang = this.getAttribute("data-lang");

      // Use the localizationManager to switch languages
      if (window.localizationManager) {
        window.localizationManager.switchLanguage(lang);
      }
    });
  });
});
