/**
 * Google Translate Integration for Mile Overseas
 * Robust themed language picker with custom UI
 *
 * ARCHITECTURE:
 *   - Language selection sets googtrans cookie + localStorage, then reloads
 *   - On load, `googtrans` cookie tells GT what language to use automatically
 *   - This guarantees state persistence across ALL pages without polling races
 *   - Fallback: also attempts DOM-based switching after GT initializes
 */
(function () {
  "use strict";

  var LANGUAGES = [
    { code: "en",    label: "English",       flag: "🇬🇧" },
    { code: "ar",    label: "العربية",        flag: "🇸🇦" },
    { code: "zh-CN", label: "中文",           flag: "🇨🇳" },
    { code: "ms",    label: "Bahasa Melayu", flag: "🇲🇾" },
    { code: "th",    label: "ไทย",            flag: "🇹🇭" },
    { code: "de",    label: "Deutsch",       flag: "🇩🇪" },
    { code: "es",    label: "Español",       flag: "🇪🇸" },
    { code: "bn",    label: "বাংলা",          flag: "🇧🇩" },
    { code: "ko",    label: "한국어",          flag: "🇰🇷" },
    { code: "ja",    label: "日本語",          flag: "🇯🇵" },
    { code: "tr",    label: "Türkçe",        flag: "🇹🇷" },
    { code: "uz",    label: "Oʻzbek",        flag: "🇺🇿" },
  ];

  /* ---- Cookie helpers ---- */
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + d.toUTCString();
    }
    // Set for both root path and current path, and without domain restriction
    document.cookie = name + "=" + value + expires + "; path=/";
    // Also set on hostname domain for cross-page persistence
    if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      document.cookie = name + "=" + value + expires + "; path=/; domain=." + location.hostname;
    }
  }

  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  function deleteCookie(name) {
    var past = "Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = name + "=; expires=" + past + "; path=/";
    document.cookie = name + "=; expires=" + past + "; path=/; domain=" + location.hostname;
    document.cookie = name + "=; expires=" + past + "; path=/; domain=." + location.hostname;
  }

  /* ---- Get saved language ---- */
  function getSavedLanguage() {
    // Check localStorage first (more reliable)
    var ls = localStorage.getItem("selectedLanguage");
    if (ls) return ls;

    // Fallback: parse googtrans cookie  
    var gt = getCookie("googtrans");
    if (gt && gt.indexOf("/en/") === 0) {
      return gt.replace("/en/", "");
    }
    return "en";
  }

  /* ---- Switch language: set cookie + reload (most reliable approach) ---- */
  function switchLanguage(langCode) {
    // Save to localStorage
    localStorage.setItem("selectedLanguage", langCode);

    if (langCode === "en") {
      // Clear the googtrans cookie and reload to restore English
      deleteCookie("googtrans");
      location.reload();
      return;
    }

    // Set googtrans cookie - Google Translate reads this on page load
    // Format: /source/target  e.g. /en/ar
    setCookie("googtrans", "/en/" + langCode, 365);

    // Reload so Google Translate picks up the cookie on init
    location.reload();
  }

  /* ---- Google Translate widget initialization callback ---- */
  window.googleTranslateElementInit = function () {
    try {
      new google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: LANGUAGES.filter(function (l) {
            return l.code !== "en";
          }).map(function (l) {
            return l.code;
          }).join(","),
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: false
        },
        "google_translate_element"
      );
    } catch (e) {
      console.warn("[GT] TranslateElement init error:", e);
    }

    // Apply banner hiding after GT loads
    hideBanner();

    // Try DOM-based switching as a secondary mechanism (works when reload approach isn't enough)
    var saved = getSavedLanguage();
    if (saved && saved !== "en") {
      tryDomSwitch(saved, 0);
    }
  };

  /* ---- DOM-based switching (secondary mechanism) ---- */
  function tryDomSwitch(langCode, attempt) {
    if (attempt > 30) return; // Give up after ~6 seconds
    var sel = document.querySelector(".goog-te-combo");
    if (sel) {
      // Use native value setter to bypass React-style event capturing
      var nativeSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
      if (nativeSetter && nativeSetter.set) {
        nativeSetter.set.call(sel, langCode);
      } else {
        sel.value = langCode;
      }
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      // Also try a second trigger after a short delay for reliability
      setTimeout(function () {
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }, 500);
    } else {
      setTimeout(function () {
        tryDomSwitch(langCode, attempt + 1);
      }, 200);
    }
  }

  /* ---- Load Google Translate script ---- */
  function loadGoogleTranslateScript() {
    if (document.getElementById("gt-script")) return;
    var s = document.createElement("script");
    s.id = "gt-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.onerror = function () {
      console.warn("[GT] Google Translate script failed to load. Language switching unavailable.");
    };
    document.head.appendChild(s);
  }

  /* ---- Hide Google's top banner ---- */
  function hideBanner() {
    // Inject CSS immediately
    if (!document.getElementById("gt-hide-style")) {
      var style = document.createElement("style");
      style.id = "gt-hide-style";
      style.textContent = [
        ".goog-te-banner-frame { display: none !important; }",
        ".goog-te-banner-frame.skiptranslate { display: none !important; }",
        "body { top: 0 !important; position: static !important; }",
        "#goog-gt-tt { display: none !important; }",
        ".goog-te-balloon-frame { display: none !important; }",
        ".goog-tooltip { display: none !important; }",
        ".goog-te-spinner-pos { display: none !important; }",
        "body > .skiptranslate { display: none !important; }",
        ".goog-te-gadget { font-size: 0 !important; color: transparent !important; }",
        ".goog-te-gadget img { display: none !important; }",
        ".goog-te-gadget > span > a { display: none !important; }",
        "#google_translate_element { position: fixed !important; left: -9999px !important; top: -9999px !important; opacity: 0 !important; pointer-events: none !important; z-index: -1 !important; width: 1px !important; height: 1px !important; overflow: hidden !important; }",
        "#google_translate_element .skiptranslate { display: block !important; }"
      ].join(" ");
      document.head.appendChild(style);
    }

    // Watch and keep banner hidden via MutationObserver
    var observer = new MutationObserver(function () {
      document.body.style.top = "0px";
      var frame = document.querySelector(".goog-te-banner-frame");
      if (frame) frame.style.display = "none";
      var banner = document.querySelector(".goog-te-banner");
      if (banner) banner.style.display = "none";
    });
    observer.observe(document.body, {
      childList: true,
      subtree: false,
      attributes: true,
      attributeFilter: ["style", "class"]
    });
  }

  /* ---- Update active state buttons ---- */
  function updateActiveButtons(langCode) {
    document.querySelectorAll(".gt-lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === langCode);
    });

    // Update trigger label text
    var trigger = document.querySelector(".gt-lang-trigger .gt-current-lang");
    if (trigger) {
      var lang = LANGUAGES.find(function (l) { return l.code === langCode; });
      if (lang) trigger.textContent = lang.flag + " " + lang.label;
    }

    // Update mobile toggle text
    var mobileToggle = document.querySelector(".gt-mobile-lang-toggle");
    if (mobileToggle) {
      var lang2 = LANGUAGES.find(function (l) { return l.code === langCode; });
      if (lang2) {
        mobileToggle.innerHTML =
          '<i class="fas fa-globe"></i> ' +
          lang2.flag + " " + lang2.label +
          ' <i class="fas fa-chevron-down" style="margin-left:auto;font-size:0.65rem;"></i>';
      }
    }
  }

  /* ---- Build desktop language picker HTML ---- */
  function buildDesktopHTML(saved) {
    var current = LANGUAGES.find(function (l) { return l.code === saved; }) || LANGUAGES[0];
    var html = '<div class="gt-lang-dropdown">';
    html += '<a href="#" class="gt-lang-trigger notranslate" aria-label="Select Language">';
    html += '<span class="gt-current-lang">' + current.flag + " " + current.label + "</span>";
    html += ' <i class="fas fa-chevron-down"></i></a>';
    html += '<div class="gt-lang-list" role="listbox" aria-label="Language options">';
    LANGUAGES.forEach(function (l) {
      html += '<a href="#" class="gt-lang-btn notranslate' + (l.code === saved ? " active" : "") + '"';
      html += ' data-lang="' + l.code + '" role="option">';
      html += l.flag + " " + l.label + "</a>";
    });
    html += "</div></div>";
    return html;
  }

  /* ---- Build mobile language picker HTML ---- */
  function buildMobileHTML(saved) {
    var current = LANGUAGES.find(function (l) { return l.code === saved; }) || LANGUAGES[0];
    var html = '<a href="#" class="gt-mobile-lang-toggle notranslate">';
    html += '<i class="fas fa-globe"></i> ' + current.flag + " " + current.label;
    html += ' <i class="fas fa-chevron-down" style="margin-left:auto;font-size:0.65rem;"></i></a>';
    html += '<div class="gt-mobile-lang-list">';
    LANGUAGES.forEach(function (l) {
      html += '<a href="#" class="gt-lang-btn notranslate' + (l.code === saved ? " active" : "") + '"';
      html += ' data-lang="' + l.code + '">';
      html += l.flag + " " + l.label + "</a>";
    });
    html += "</div>";
    return html;
  }

  /* ---- Build complete language picker UI ---- */
  function buildLanguagePicker() {
    var saved = getSavedLanguage();

    // Desktop
    var desktopContainer = document.getElementById("gt-lang-desktop");
    if (desktopContainer) {
      desktopContainer.innerHTML = buildDesktopHTML(saved);
    }

    // Mobile
    var mobileContainer = document.getElementById("gt-lang-mobile");
    if (mobileContainer) {
      mobileContainer.innerHTML = buildMobileHTML(saved);
    }

    // Bind all language button clicks
    document.querySelectorAll(".gt-lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var lang = btn.getAttribute("data-lang");
        if (!lang) return;

        // Close mobile drawer if open
        var drawer = document.getElementById("mobile-drawer");
        if (drawer && drawer.classList.contains("open")) {
          drawer.classList.remove("open");
          document.body.classList.remove("drawer-open");
        }

        // Switch language (sets cookie & reloads)
        switchLanguage(lang);
      });
    });

    // Desktop hover dropdown
    var desktopDropdown = document.querySelector(".gt-lang-dropdown");
    if (desktopDropdown) {
      var trigger = desktopDropdown.querySelector(".gt-lang-trigger");
      var content = desktopDropdown.querySelector(".gt-lang-list");
      if (trigger && content) {
        // Mouse hover
        desktopDropdown.addEventListener("mouseenter", function () {
          content.style.display = "block";
        });
        desktopDropdown.addEventListener("mouseleave", function () {
          content.style.display = "none";
        });
        // Click/tap toggle (for touch devices)
        trigger.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          content.style.display = content.style.display === "block" ? "none" : "block";
        });
        // Close on outside click
        document.addEventListener("click", function (e) {
          if (!desktopDropdown.contains(e.target)) {
            content.style.display = "none";
          }
        });
      }
    }

    // Mobile toggle
    var mobileLangToggle = document.querySelector(".gt-mobile-lang-toggle");
    var mobileLangList = document.querySelector(".gt-mobile-lang-list");
    if (mobileLangToggle && mobileLangList) {
      mobileLangToggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        mobileLangList.classList.toggle("open");
        // Rotate chevron
        var chevron = mobileLangToggle.querySelector(".fa-chevron-down");
        if (chevron) {
          chevron.style.transform = mobileLangList.classList.contains("open")
            ? "rotate(180deg)" : "rotate(0deg)";
        }
      });
    }
  }

  /* ---- Main init ---- */
  document.addEventListener("DOMContentLoaded", function () {
    // Inject banner-hide CSS immediately (before GT loads) to prevent flash
    hideBanner();

    // Build the custom language picker UI
    buildLanguagePicker();

    // Load Google Translate script
    loadGoogleTranslateScript();
  });
})();
