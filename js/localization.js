function changeLanguage(lang) {
  // Set the language preference (use only 'language' for consistency)
  localStorage.setItem("language", lang);

  // Update HTML dir attribute for RTL support
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Load and apply translations
  if (typeof LocalizationManager !== 'undefined' && window.localizationManager) {
    window.localizationManager.switchLanguage(lang);
  } else {
    // Do not reload, just warn (prevents infinite reload loop)
    console.warn('LocalizationManager is not available. Language switch skipped.');
  }

  // Update the language selector dropdowns
  const select = document.getElementById("languageSelect");
  if (select) select.value = lang;
  const mobileSelect = document.getElementById("mobileLanguageSelect");
  if (mobileSelect) mobileSelect.value = lang;

  // Update .active class on dropdown links (for custom dropdowns)
  document.querySelectorAll('.language-dropdown-content a[data-lang]').forEach(link => {
    if(link.getAttribute('data-lang') === lang) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Fire custom event for listeners (e.g., products page custom spice section)
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

// Add this to your initialization code
document.addEventListener("DOMContentLoaded", function () {
  // Get saved language preference or default to English
  const savedLang = localStorage.getItem("language") || "en";

  // Initialize language
  changeLanguage(savedLang);
});
