/**
 * Google Translate Integration for Mile Overseas
 * Themed language picker with custom UI
 */
(function () {
  "use strict";

  const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "zh-CN", label: "中文", flag: "🇨🇳" },
    { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
    { code: "th", label: "ไทย", flag: "🇹🇭" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "bn", label: "বাংলা", flag: "🇧🇩" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "uz", label: "Oʻzbek", flag: "🇺🇿" },
  ];

  /* ---- Load Google Translate element.js ---- */
  function loadGoogleTranslateScript() {
    if (document.getElementById("gt-script")) return;
    var s = document.createElement("script");
    s.id = "gt-script";
    s.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.onerror = function () {
      console.warn("[GT] Google Translate script failed to load. Retrying...");
      s.remove();
      setTimeout(function () {
        var s2 = document.createElement("script");
        s2.id = "gt-script";
        s2.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(s2);
      }, 2000);
    };
    document.body.appendChild(s);
  }

  /* Called by Google Translate when ready */
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: LANGUAGES.map(function (l) {
          return l.code;
        }).join(","),
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      "google_translate_element",
    );

    // Wait for the .goog-te-combo select to actually appear, then restore
    var waitAttempts = 0;
    var waitInterval = setInterval(function () {
      var combo = document.querySelector(".goog-te-combo");
      if (combo) {
        clearInterval(waitInterval);
        restoreSavedLanguage();
        hideBanner();
      }
      if (++waitAttempts > 50) {
        clearInterval(waitInterval);
        hideBanner();
      }
    }, 200);
  };

  /* ---- Programmatically switch language via hidden widget ---- */
  function switchLanguage(langCode) {
    // Save preference
    localStorage.setItem("selectedLanguage", langCode);

    if (langCode === "en") {
      // Restore original English
      restoreEnglish();
      updateActiveButtons(langCode);
      return;
    }

    // Wait for Google Translate select to be available
    var attempts = 0;
    var interval = setInterval(function () {
      var sel = document.querySelector(".goog-te-combo");
      if (sel) {
        clearInterval(interval);
        sel.value = langCode;
        // Trigger change using both methods for compatibility
        sel.dispatchEvent(new Event("change", { bubbles: true }));
        // Fallback: also try using the native setter
        var nativeSetter = Object.getOwnPropertyDescriptor(
          HTMLSelectElement.prototype, "value"
        );
        if (nativeSetter && nativeSetter.set) {
          nativeSetter.set.call(sel, langCode);
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
        updateActiveButtons(langCode);
      }
      if (++attempts > 50) clearInterval(interval);
    }, 200);
  }

  /* Restore to English (remove translation) */
  function restoreEnglish() {
    // Clear the googtrans cookie
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." +
      location.hostname;
    document.cookie =
      "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Also try via widget
    var sel = document.querySelector(".goog-te-combo");
    if (sel) {
      sel.value = "en";
      sel.dispatchEvent(new Event("change"));
    }

    // Fallback: reload if Google Translate doesn't revert cleanly
    var frame = document.querySelector(".goog-te-banner-frame");
    if (frame) {
      try {
        var btn = frame.contentDocument.querySelector(".goog-close-link");
        if (btn) btn.click();
      } catch (e) {
        // Cross-origin; reload instead
        location.reload();
      }
    }
  }

  /* Restore saved language on page load */
  function restoreSavedLanguage() {
    var saved = localStorage.getItem("selectedLanguage");
    if (saved && saved !== "en") {
      switchLanguage(saved);
    } else {
      updateActiveButtons("en");
    }
  }

  /* Update active state on all language buttons */
  function updateActiveButtons(langCode) {
    document.querySelectorAll(".gt-lang-btn").forEach(function (btn) {
      btn.classList.toggle(
        "active",
        btn.getAttribute("data-lang") === langCode,
      );
    });
    // Update the desktop trigger label
    var trigger = document.querySelector(".gt-lang-trigger .gt-current-lang");
    if (trigger) {
      var lang = LANGUAGES.find(function (l) {
        return l.code === langCode;
      });
      if (lang) trigger.textContent = lang.flag + " " + lang.label;
    }
  }

  /* Hide the Google Translate top bar / popup */
  function hideBanner() {
    var style = document.createElement("style");
    style.textContent =
      ".goog-te-banner-frame { display: none !important; }" +
      "body { top: 0 !important; }" +
      ".goog-te-gadget { font-size: 0 !important; }" +
      "#google_translate_element { position: fixed !important; left: -9999px !important; top: -9999px !important; opacity: 0 !important; pointer-events: none !important; z-index: -1 !important; width: 1px !important; height: 1px !important; overflow: hidden !important; }" +
      "#google_translate_element .skiptranslate { display: block !important; }" +
      "body > .skiptranslate { display: none !important; }" +
      ".goog-te-spinner-pos { display: none !important; }" +
      "body { top: 0 !important; position: static !important; }";
    document.head.appendChild(style);

    // Observe and remove banner insertion
    var observer = new MutationObserver(function () {
      document.body.style.top = "0px";
      var frame = document.querySelector(".goog-te-banner-frame");
      if (frame) frame.style.display = "none";
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  /* ---- Build the custom language picker UI ---- */
  function buildLanguagePicker() {
    // Desktop nav picker
    var desktopContainer = document.getElementById("gt-lang-desktop");
    if (desktopContainer) {
      desktopContainer.innerHTML = buildDesktopHTML();
    }

    // Mobile drawer picker
    var mobileContainer = document.getElementById("gt-lang-mobile");
    if (mobileContainer) {
      mobileContainer.innerHTML = buildMobileHTML();
    }

    // Bind click handlers
    document.querySelectorAll(".gt-lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var lang = btn.getAttribute("data-lang");
        switchLanguage(lang);

        // Close mobile drawer if in drawer
        var drawer = document.getElementById("mobile-drawer");
        if (
          drawer &&
          drawer.classList.contains("open") &&
          btn.closest(".mobile-nav-drawer")
        ) {
          drawer.classList.remove("open");
          document.body.classList.remove("drawer-open");
        }
      });
    });

    // Desktop hover
    var desktopDropdown = document.querySelector(".gt-lang-dropdown");
    if (desktopDropdown) {
      var trigger = desktopDropdown.querySelector(".gt-lang-trigger");
      var content = desktopDropdown.querySelector(".gt-lang-list");
      if (trigger && content) {
        desktopDropdown.addEventListener("mouseenter", function () {
          content.style.display = "block";
        });
        desktopDropdown.addEventListener("mouseleave", function () {
          content.style.display = "none";
        });
        // Also support click for touch devices
        trigger.addEventListener("click", function (e) {
          e.preventDefault();
          content.style.display =
            content.style.display === "block" ? "none" : "block";
        });
      }
    }

    // Mobile language toggle
    var mobileLangToggle = document.querySelector(".gt-mobile-lang-toggle");
    var mobileLangList = document.querySelector(".gt-mobile-lang-list");
    if (mobileLangToggle && mobileLangList) {
      mobileLangToggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        mobileLangList.classList.toggle("open");
      });
    }
  }

  function buildDesktopHTML() {
    var saved = localStorage.getItem("selectedLanguage") || "en";
    var current =
      LANGUAGES.find(function (l) {
        return l.code === saved;
      }) || LANGUAGES[0];
    var html = '<div class="gt-lang-dropdown">';
    html +=
      '<a href="#" class="gt-lang-trigger"><span class="gt-current-lang">' +
      current.flag +
      " " +
      current.label +
      '</span> <i class="fas fa-chevron-down"></i></a>';
    html += '<div class="gt-lang-list">';
    LANGUAGES.forEach(function (l) {
      html +=
        '<a href="#" class="gt-lang-btn' +
        (l.code === saved ? " active" : "") +
        '" data-lang="' +
        l.code +
        '">' +
        l.flag +
        " " +
        l.label +
        "</a>";
    });
    html += "</div></div>";
    return html;
  }

  function buildMobileHTML() {
    var saved = localStorage.getItem("selectedLanguage") || "en";
    var current =
      LANGUAGES.find(function (l) {
        return l.code === saved;
      }) || LANGUAGES[0];
    var html =
      '<a href="#" class="gt-mobile-lang-toggle">' +
      '<i class="fas fa-globe"></i> ' +
      current.flag +
      " " +
      current.label +
      ' <i class="fas fa-chevron-down"></i></a>';
    html += '<div class="gt-mobile-lang-list">';
    LANGUAGES.forEach(function (l) {
      html +=
        '<a href="#" class="gt-lang-btn' +
        (l.code === saved ? " active" : "") +
        '" data-lang="' +
        l.code +
        '">' +
        l.flag +
        " " +
        l.label +
        "</a>";
    });
    html += "</div>";
    return html;
  }

  /* ---- Init on DOM ready ---- */
  document.addEventListener("DOMContentLoaded", function () {
    buildLanguagePicker();
    loadGoogleTranslateScript();
  });
})();
