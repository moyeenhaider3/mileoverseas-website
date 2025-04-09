document.addEventListener("DOMContentLoaded", function () {
  // Initialize language from localStorage or default to English
  const savedLang = localStorage.getItem("language") || "en";
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
