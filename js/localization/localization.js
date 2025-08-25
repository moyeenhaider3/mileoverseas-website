// Localization Manager
class LocalizationManager {
  constructor() {
    this.currentLanguage = "en"; // Default language
    this.supportedLanguages = [
      "ar",
      "bn",
      "de",
      "en",
      "es",
      "ja",
      "ko",
      "ms",
      "th",
      "tr",
      "uz",
      "zh",
    ];
    this.translations = {};
    this.fallbackTranslations = {};
    // Country -> language mapping for geo detection
    this.countryLanguageMap = {
      AE: "ar",
      SA: "ar",
      QA: "ar",
      KW: "ar",
      BH: "ar",
      OM: "ar", // GCC Arabic
      IN: "en", // India default to English for business audience
      CN: "zh",
      MY: "ms",
      TH: "th",
      DE: "de",
      ES: "es",
      BD: "bn",
      KR: "ko",
      JP: "ja",
      TR: "tr",
      UZ: "uz",
    };
  }

  // Detect system/browser locale and return supported language or 'en'
  detectSystemLocale() {
    const browserLang =
      navigator.languages && navigator.languages.length
        ? navigator.languages[0]
        : navigator.language || navigator.userLanguage || "en";
    const normalized = browserLang.split("-")[0].toLowerCase();
    return this.supportedLanguages.includes(normalized) ? normalized : "en";
  }

  // Load translations dynamically
  async loadTranslations(lang) {
    try {
      const mod = await import(`./${lang}.js`);
      this.translations = mod.default || {};
    } catch (e) {
      console.error("Failed to load translations for", lang, e);
      this.translations = {};
    }
  }

  // Load default English fallback translations
  async loadFallbackTranslations() {
    try {
      const mod = await import(`./en.js`);
      this.fallbackTranslations = mod.default || {};
    } catch (e) {
      console.error("Failed to load fallback translations for en", e);
      this.fallbackTranslations = {};
    }
  }

  // Initialize localization
  async init() {
    // Preload English fallback to cover missing keys
    await this.loadFallbackTranslations();
    // Determine initial language preference
    let savedLanguage = localStorage.getItem("language");
    if (!savedLanguage) {
      // Attempt geo-based detection first
      const geoLang = await this.detectGeoLanguage();
      if (geoLang) {
        savedLanguage = geoLang;
      } else {
        // Fallback to browser locale detection
        savedLanguage = this.detectSystemLocale();
      }
      localStorage.setItem("language", savedLanguage);
    }
    this.currentLanguage = savedLanguage || "en";

    // Load and apply saved/detected language
    await this.loadTranslations(this.currentLanguage);
    this.applyLanguage(this.currentLanguage);
    // Trigger initial languageChanged event to render custom sections after translations are loaded
    window.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: { lang: this.currentLanguage },
      })
    );

    // Setup event listeners for language switch
    document.addEventListener("DOMContentLoaded", () => {
      this.setupLanguageSwitcher();
      this.changeLanguage(this.currentLanguage);
    });
  }

  // Detect language via IP geolocation (best-effort, privacy-friendly basic fields)
  async detectGeoLanguage() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500); // 1.5s timeout to avoid delaying rendering
    try {
      // Using ipapi.co (no API key needed for basic usage); alternative fallback could be ipwho.is
      const res = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) return null;
      const data = await res.json();
      const countryCode =
        data && data.country_code ? data.country_code.toUpperCase() : null;
      if (!countryCode) return null;
      const mapped = this.countryLanguageMap[countryCode];
      if (mapped && this.supportedLanguages.includes(mapped)) return mapped;
      return null; // Unsupported country -> let caller fallback
    } catch (e) {
      clearTimeout(timeout);
      // Swallow errors silently (network/privacy blockers) and fallback
      return null;
    }
  }

  // Setup language switcher in navigation
  setupLanguageSwitcher() {
    const languageDropdown = document.getElementById("language-dropdown");
    if (languageDropdown) {
      // Add event listeners for language selection
      const languageOptions = languageDropdown.querySelectorAll("a");
      languageOptions.forEach((option) => {
        option.addEventListener("click", async (e) => {
          e.preventDefault();
          const lang = option.getAttribute("data-lang");
          if (lang) await this.changeLanguage(lang);
        });
      });
    }
  }

  // Get translation for a key with fallback to English
  translate(key) {
    if (this.translations.hasOwnProperty(key)) return this.translations[key];
    if (this.fallbackTranslations.hasOwnProperty(key))
      return this.fallbackTranslations[key];
    return key;
  }

  // Switch language
  async switchLanguage(lang) {
    if (this.currentLanguage === lang) return;
    // Update currentLanguage state
    this.currentLanguage = lang;
    localStorage.setItem("language", lang);
    await this.loadTranslations(lang);
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
    const placeholdersToTranslate = document.querySelectorAll(
      "[data-i18n-placeholder]"
    );
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

  async changeLanguage(lang) {
    // Set the language preference (use only 'language' for consistency)
    localStorage.setItem("language", lang);

    // Update HTML dir attribute for RTL support
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Load and apply translations
    await this.switchLanguage(lang);

    // Update the language selector dropdowns
    const select = document.getElementById("languageSelect");
    if (select) select.value = lang;
    const mobileSelect = document.getElementById("mobileLanguageSelect");
    if (mobileSelect) mobileSelect.value = lang;

    // Update .active class on dropdown links (for custom dropdowns)
    document
      .querySelectorAll(".language-dropdown-content a[data-lang]")
      .forEach((link) => {
        if (link.getAttribute("data-lang") === lang) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });

    // Fire custom event for listeners (e.g., products page custom spice section)
    window.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { lang } })
    );
  }
}

// Initialize localization manager
const localizationManager = new LocalizationManager();

// Make it globally accessible
window.localizationManager = localizationManager;

// Initialize after module load
localizationManager.init();
