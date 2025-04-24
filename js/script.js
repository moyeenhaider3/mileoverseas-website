document.addEventListener("DOMContentLoaded", function () {
  // Preload important images
  const imagesToPreload = [
    "images/logo-modern.png",
    "images/spice-introduction.jpg",
    "images/chilli-product.jpg",
    "images/turmeric-product.jpg",
    "images/cumin-product.jpg",
  ];

  preloadImages(imagesToPreload);

  function preloadImages(sources) {
    sources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  // Initialize product module if available
  if (typeof initializeProductUI === 'function') {
    console.log("Initializing product module from script.js");
    initializeProductUI();
  }

  // Register ScrollTrigger plugin
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Ensure all content is visible after a short delay, regardless of animation state
  setTimeout(function () {
    document.querySelectorAll(".fade-in").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, 1000);

  // GSAP Animations - Hero Section and Introduction
  const heroHeadline = document.querySelector(".hero-headline");
  const heroSubheadline = document.querySelector(".hero-subheadline");
  const heroCTA = document.querySelector(".hero-cta");
  const introSection = document.querySelector(".modern-introduction");
  const introContentElements = introSection
    ? introSection.querySelectorAll(".fade-in")
    : [];

  // Mobile Navigation Drawer Toggle
  const hamburger = document.getElementById("hamburger-icon");
  const navMenu = document.getElementById("nav-menu"); // Desktop nav menu

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => navMenu.classList.toggle("open"));
  }

  // Close mobile drawer when clicking outside (optional - enhance UX)
  document.addEventListener("click", function (event) {
    if (
      navMenu.classList.contains("open") &&
      !navMenu.contains(event.target) &&
      !hamburger.contains(event.target)
    ) {
      navMenu.classList.remove("open");
    }
  });

  // Close mobile drawer when nav link is clicked (optional - enhance UX)
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-links a");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Skip closing drawer for language dropdown toggle and language options
      if (link.classList.contains("dropdown-title") || link.classList.contains("language-option")) {
        return;
      }
      navMenu.classList.remove("open");
    });
  });

  // Language option selection: close drawer after changing language
  const mobileLanguageOptions = document.querySelectorAll(".mobile-nav-links .language-option");
  mobileLanguageOptions.forEach((option) => {
    option.addEventListener("click", async (e) => {
      e.preventDefault();
      const lang = option.getAttribute("data-lang");
      if (lang && window.localizationManager) {
        await window.localizationManager.changeLanguage(lang);
      }
      navMenu.classList.remove("open");
    });
  });

  // Hide desktop nav menu on mobile (already handled in CSS - for JS if needed later)
  if (window.innerWidth <= 768 && navMenu) {
    navMenu.style.display = "none"; // Ensure desktop menu is hidden on mobile, redundant but safe
  } else if (navMenu) {
    navMenu.style.display = "flex"; // Ensure desktop menu is shown on desktop
  }

  // General animation handler for all fade-in elements across all pages
  const allFadeElements = document.querySelectorAll(".fade-in");
  allFadeElements.forEach((element) => {
    // Then apply GSAP animations if available
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 95%",
          once: true,
        },
      });
    }
  });

  function animateHeroSection() {
    if (!heroHeadline || !heroSubheadline || !heroCTA) return;

    const tl = gsap.timeline();
    tl.fromTo(
      heroHeadline,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
      .fromTo(
        heroSubheadline,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.5"
      )
      .fromTo(
        heroCTA,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.5"
      );
  }

  function animateIntroSection() {
    introContentElements.forEach((element) => {
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          once: true,
        },
      });
    });
  }

  animateHeroSection();
  animateIntroSection();

  // FAQ Expandable Tiles
  const faqTiles = document.querySelectorAll(".faq-tile.modern-faq-tile");
  if (faqTiles.length > 0) {
    console.log("Found FAQ tiles:", faqTiles.length);

    // Make sure the FAQ content is visible
    document.querySelectorAll(".faq-answer").forEach((answer) => {
      answer.style.display = "none"; // Initially hide answers
    });

    faqTiles.forEach((tile) => {
      const question = tile.querySelector(".faq-question");
      const answer = tile.querySelector(".faq-answer");

      if (question && answer) {
        // Ensure proper initial state
        answer.style.display = "none";

        question.addEventListener("click", () => {
          console.log("FAQ question clicked");
          tile.classList.toggle("expanded");

          // Manually toggle answer visibility for redundancy
          if (tile.classList.contains("expanded")) {
            answer.style.display = "block";
          } else {
            answer.style.display = "none";
          }
        });
      }
    });
  }

  // Contact Form Validation (Basic Example)
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      // Prevent default form submission
      event.preventDefault();

      // Initialize validation variables
      let isValid = true;
      const nameInput = document.getElementById("name");
      const emailInput = document.getElementById("email");
      const messageInput = document.getElementById("message");
      const companyInput = document.getElementById("company");
      const nameError = document.getElementById("nameError");
      const emailError = document.getElementById("emailError");
      const messageError = document.getElementById("messageError");
      const formSuccess = document.getElementById("formSuccess");
      const loadingIndicator = document.getElementById("loadingIndicator");

      // Reset validation state
      nameError.textContent = "";
      emailError.textContent = "";
      messageError.textContent = "";
      formSuccess.style.display = "none";

      // Validate name
      if (nameInput.value.trim() === "") {
        nameError.textContent = "Name is required";
        isValid = false;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value)) {
        emailError.textContent = "Invalid email format";
        isValid = false;
      }

      // Validate message
      if (messageInput.value.trim() === "") {
        messageError.textContent = "Message is required";
        isValid = false;
      }

      if (isValid) {
        // Show loading indicator
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        loadingIndicator.style.display = "flex";

        // CORS-Friendly Approach: Use the hidden iframe for submission
        // But prepare form data for the Apps Script
        const formDataForScript = {
          name: nameInput.value,
          email: emailInput.value,
          company: companyInput.value || "",
          message: messageInput.value,
        };

        // Create a new hidden form for submission
        const hiddenForm = document.createElement("form");
        hiddenForm.style.display = "none";
        hiddenForm.method = "POST";
        hiddenForm.action =
          "https://script.google.com/macros/s/AKfycbyQ6Ued_kg4BykLo6GZOjAC6enMD-_r3Azoy_-wD9mlae-BKOcOxCtf72l2I0hukSxW/exec";

        // Use iframe target if available, otherwise use _blank
        const hiddenIframe = document.getElementById("hiddenIframe");
        if (hiddenIframe) {
          hiddenForm.target = "hiddenIframe";
        } else {
          hiddenForm.target = "_blank"; // Opens in a new tab (but hidden)
        }

        // Create a JSON input field
        const jsonField = document.createElement("input");
        jsonField.type = "hidden";
        jsonField.name = "json";
        jsonField.value = JSON.stringify(formDataForScript);
        hiddenForm.appendChild(jsonField);

        // Add form to body
        document.body.appendChild(hiddenForm);

        // Set up submission timeout (in case submission hangs)
        const submissionTimeout = setTimeout(() => {
          loadingIndicator.style.display = "none";
          formSuccess.textContent =
            "Request timed out. Please try again later.";
          formSuccess.style.display = "block";
          submitButton.disabled = false;
        }, 10000); // 10 seconds timeout

        // Submit the form
        hiddenForm.submit();

        // Show success message after a short delay (simulating response)
        setTimeout(() => {
          clearTimeout(submissionTimeout);
          loadingIndicator.style.display = "none";
          formSuccess.textContent =
            "Thank you for your inquiry! We will get back to you soon.";
          formSuccess.style.display = "block";
          submitButton.disabled = false;
          contactForm.reset();

          // Clean up - remove the hidden form
          document.body.removeChild(hiddenForm);
        }, 2000);
      }
    });

    // Set up iframe load handler if the iframe exists
    const hiddenIframe = document.getElementById("hiddenIframe");
    if (hiddenIframe) {
      hiddenIframe.onload = function () {
        // This will trigger when the iframe loads, which happens on form submission
        // We're handling success feedback in the main submit handler already
        // This is just a safeguard in case we need it
      };
    }
  }

  // Animate Product Showcase Items on Scroll
  const spiceItems = document.querySelectorAll(
    ".product-showcase.modern-product-showcase .spice-item"
  );
  if (!spiceItems.length) {
    console.warn("No spice items found for animation.");
    return;
  }
  spiceItems.forEach((item, index) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3 * index, // Staggered animation
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
          once: true,
        },
      }
    );
  });

  // Animate Testimonials on Scroll
  const testimonials = document.querySelectorAll(
    ".testimonials.modern-testimonials .testimonial"
  );
  testimonials.forEach((testimonial, index) => {
    gsap.fromTo(
      testimonial,
      { opacity: 0, x: index % 2 === 0 ? -50 : 50 },
      {
        // Alternate slide direction
        opacity: 1,
        x: 0,
        duration: 1,
        delay: 0.4 * index,
        ease: "power3.out",
        scrollTrigger: {
          trigger: testimonial,
          start: "top 80%",
          once: true,
        },
      }
    );
  });

  // Animate Certifications on Scroll
  const certItems = document.querySelectorAll(
    ".certificate-section.modern-certificate-section .certificate-item"
  );
  certItems.forEach((item, index) => {
    gsap.fromTo(
      item,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: 0.2 * index,
        ease: "elastic.out(1, 0.75)",
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
          once: true,
        },
      }
    );
  });

  // Animate Why Choose Us Advantages on Scroll
  const advantageItems = document.querySelectorAll(
    ".why-choose-advantages.modern-why-choose-section .advantages-list li"
  );
  advantageItems.forEach((item, index) => {
    gsap.fromTo(
      item,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: 0.2 * index,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
          once: true,
        },
      }
    );
  });

  // Animate Why Choose Us Compliance items on Scroll
  const complianceItems = document.querySelectorAll(
    ".why-choose-certifications.modern-why-choose-section .compliance-list li"
  );
  complianceItems.forEach((item, index) => {
    gsap.fromTo(
      item,
      { opacity: 0, x: 30 },
      {
        // Slide in from right
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: 0.2 * index,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
          once: true,
        },
      }
    );
  });

  // Animate About Us Section Elements on Scroll
  const aboutSectionElements = document.querySelectorAll(
    ".modern-about-section .fade-in"
  );
  aboutSectionElements.forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        once: true,
      },
    });
  });

  // IntersectionObserver for fade-in animations
  const fadeInElements = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
  fadeInElements.forEach(el => fadeObserver.observe(el));

  // Mobile Language Dropdown
  document.addEventListener("DOMContentLoaded", function () {
    // Mobile language dropdown toggle
    const mobileLangDropdown = document.querySelector(
      ".mobile-nav-drawer .language-dropdown"
    );
    if (mobileLangDropdown) {
      const dropdownTitle = mobileLangDropdown.querySelector(".dropdown-title");
      if (dropdownTitle) {
        dropdownTitle.addEventListener("click", function (e) {
          e.preventDefault();
          mobileLangDropdown.classList.toggle("open");
        });
      }
    }

    // Close language dropdown when clicking elsewhere
    document.addEventListener("click", function (event) {
      const mobileDropdowns = document.querySelectorAll(
        ".mobile-nav-drawer .language-dropdown"
      );
      mobileDropdowns.forEach((dropdown) => {
        if (
          dropdown.classList.contains("open") &&
          !dropdown.contains(event.target)
        ) {
          dropdown.classList.remove("open");
        }
      });
    });
  });

  // Image optimization: lazy load thumbnails, hover-preload full images, and register SW
  // This block sets up lazy loading, smooth fade-in, hover preloading, and service worker registration
  document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.product-card');
    const lazyImages = document.querySelectorAll('img.lazy');

    lazyImages.forEach(img => {
      const onLoad = () => {
        img.classList.add('loaded');
        const pic = img.closest('picture');
        if (pic) pic.classList.add('loaded');
      };
      if ('loading' in HTMLImageElement.prototype) {
        img.src = img.dataset.src;
        img.addEventListener('load', onLoad);
      } else if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              img.src = img.dataset.src;
              img.addEventListener('load', onLoad);
              obs.unobserve(img);
            }
          });
        }, { rootMargin: '200px' });
        io.observe(img);
      } else {
        img.src = img.dataset.src;
        img.addEventListener('load', onLoad);
      }
    });

    cards.forEach(card => {
      let done = false;
      card.addEventListener('mouseenter', () => {
        if (done) return;
        const href = card.getAttribute('data-full-image');
        if (!href) return;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = href;
        document.head.appendChild(link);
        done = true;
      });
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(e => console.warn('Service Worker registration failed:', e));
    }
  });
});
