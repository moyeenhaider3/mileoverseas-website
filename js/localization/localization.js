// Localization Manager
class LocalizationManager {
  constructor() {
    this.currentLanguage = "en"; // Default language
    this.translations = {
      en: enTranslations,
      ar: arTranslations,
      zh: zhTranslations,
      ms: msTranslations,
      th: thTranslations,
      de: deTranslations,
      es: esTranslations,
      bn: bnTranslations,
      ko: koTranslations,
      ja: jaTranslations,
      tr: trTranslations,
      uz: uzTranslations,
    };
    this.isRTL = false;
    this.init();
  }

  // Initialize localization
  init() {
    // Get language from localStorage if available
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }

    // Apply saved language
    this.applyLanguage(this.currentLanguage);

    // Setup event listeners for language switch
    document.addEventListener("DOMContentLoaded", () => {
      this.setupLanguageSwitcher();
    });
  }

  // Setup language switcher in navigation
  setupLanguageSwitcher() {
    const languageDropdown = document.getElementById("language-dropdown");
    if (languageDropdown) {
      // Add event listeners for language selection
      const languageOptions = languageDropdown.querySelectorAll("a");
      languageOptions.forEach((option) => {
        option.addEventListener("click", (e) => {
          e.preventDefault();
          const lang = option.getAttribute("data-lang");
          this.switchLanguage(lang);
        });
      });
    }
  }

  // Get translation for a key
  translate(key) {
    return this.translations[this.currentLanguage][key] || key;
  }

  // Switch language
  switchLanguage(lang) {
    if (this.currentLanguage === lang) return;

    this.currentLanguage = lang;
    localStorage.setItem("language", lang);
    this.applyLanguage(lang);
  }

  // Apply selected language
  applyLanguage(lang) {
    this.isRTL = lang === "ar";

    // Set document direction
    document.documentElement.setAttribute("dir", this.isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
    document.body.classList.toggle("rtl", this.isRTL);

    // Translate all elements with data-i18n attribute
    const elementsToTranslate = document.querySelectorAll("[data-i18n]");
    elementsToTranslate.forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (key) {
        // Use innerHTML for HTML-rich content, textContent for others
        if (key === "privacy_policy_content") {
          element.innerHTML = this.translate(key);
        } else {
          element.textContent = this.translate(key);
        }
      }
    });

    // Translate all input placeholders with data-i18n-placeholder attribute
    const placeholdersToTranslate = document.querySelectorAll("[data-i18n-placeholder]");
    placeholdersToTranslate.forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      if (key) {
        element.placeholder = this.translate(key);
      }
    });

    // Update active language in dropdown
    const languageOptions = document.querySelectorAll(".language-option");
    languageOptions.forEach((option) => {
      const optionLang = option.getAttribute("data-lang");
      if (optionLang === lang) {
        option.classList.add("active");
      } else {
        option.classList.remove("active");
      }
    });
  }
}

// Initialize localization manager
const localizationManager = new LocalizationManager();

// Make it globally accessible
window.localizationManager = localizationManager;
