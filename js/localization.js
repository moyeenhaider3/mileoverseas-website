function changeLanguage(lang) {
  // Set the language preference
  localStorage.setItem("preferredLanguage", lang);

  // Update HTML dir attribute for RTL support
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Load and apply translations
  loadTranslations(lang);

  // Update the language selector dropdowns
  document.getElementById("languageSelect").value = lang;
  const mobileSelect = document.getElementById("mobileLanguageSelect");
  if (mobileSelect) {
    mobileSelect.value = lang;
  }
}

// Add this to your initialization code
document.addEventListener("DOMContentLoaded", function () {
  // Get saved language preference or default to English
  const savedLang = localStorage.getItem("preferredLanguage") || "en";

  // Initialize language
  changeLanguage(savedLang);
});
