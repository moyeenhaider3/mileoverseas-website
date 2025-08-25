// Basic Chat Widget (static, no backend)
// Enhanced for better UX: intent responses, history persistence, quick suggestions, lead capture, typing indicator, simple analytics.
// NOTE: This widget is custom; any additional blue chat icon likely comes from another script or a browser extension.
(function () {
  if (window.__chatbotInitialized) return; // prevent duplicates
  window.__chatbotInitialized = true;

  const style = document.createElement("style");
  style.textContent = `
  #chat-toggle{position:fixed;bottom:20px;right:20px;background:#c75000;color:#fff;padding:12px 18px;border-radius:28px;cursor:pointer;font:600 14px/1 'Nunito Sans',sans-serif;z-index:9998;box-shadow:0 4px 12px rgba(0,0,0,.25);transition:background .25s;}\n
  #chat-toggle:hover{background:#a64400;}\n
  #chat-box{position:fixed;bottom:76px;right:20px;width:320px;height:420px;background:#fff;border:1px solid #ddd;border-radius:14px;display:flex;flex-direction:column;font:14px/1.4 'Nunito Sans',sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.18);z-index:9998;overflow:hidden;}\n
  #chat-box[hidden]{display:none;}\n
  .chat-header{background:#c75000;color:#fff;padding:10px 14px;font-weight:600;display:flex;align-items:center;justify-content:space-between;}\n
  .chat-header button{background:transparent;border:0;color:#fff;cursor:pointer;font-size:16px;line-height:1;}\n
  #chat-messages{flex:1;padding:10px;overflow:auto;background:#fafafa;}\n
  #chat-messages .msg{margin:6px 0;max-width:84%;padding:8px 10px;border-radius:10px;font-size:13px;word-wrap:break-word;white-space:pre-wrap;}\n
  #chat-messages .user{background:#c75000;color:#fff;margin-left:auto;border-bottom-right-radius:2px;}\n
  #chat-messages .bot{background:#fff;border:1px solid #e2e2e2;color:#333;border-bottom-left-radius:2px;}\n
  #chat-form{display:flex;border-top:1px solid #eee;}\n
  #chat-form input{flex:1;border:0;padding:10px 12px;font:14px/1 'Nunito Sans',sans-serif;outline:none;}\n
  #chat-form button{border:0;background:#c75000;color:#fff;padding:0 16px;font:600 14px/1 'Nunito Sans',sans-serif;cursor:pointer;transition:background .25s;}\n
  #chat-form button:hover{background:#a64400;}\n
  .chat-loading{display:flex;align-items:center;gap:6px;font-size:12px;color:#444;margin-top:6px;}\n
  .chat-spinner{width:14px;height:14px;border:2px solid #ccc;border-top-color:#c75000;border-radius:50%;animation:chatspin 0.7s linear infinite;}\n
  @keyframes chatspin{to{transform:rotate(360deg);}}\n
  @media (max-width:600px){#chat-box{right:10px;left:10px;width:auto;}}`;
  document.head.appendChild(style);

  // Create toggle button
  const toggle = document.createElement("div");
  toggle.id = "chat-toggle";
  toggle.textContent =
    (window.localizationManager &&
      window.localizationManager.translate("chat_toggle")) ||
    "Chat"; // Localized if available
  document.body.appendChild(toggle);

  // Create chat container
  const box = document.createElement("div");
  box.id = "chat-box";
  box.hidden = true;
  box.innerHTML = `
    <div class="chat-header">
      <span data-i18n-chat-title>Live Chat</span>
      <div style="display:flex;gap:6px;align-items:center;">
        <button type="button" id="chat-minimize" aria-label="Minimize" style="background:transparent;border:0;color:#fff;font-size:14px;cursor:pointer;">_</button>
        <button type="button" aria-label="Close" id="chat-close" style="background:transparent;border:0;color:#fff;font-size:16px;cursor:pointer;">×</button>
      </div>
    </div>
    <div id="chat-messages" aria-live="polite"></div>
    <div id="chat-suggestions" class="chat-suggestions" aria-label="Quick suggestions"></div>
    <form id="chat-form" autocomplete="off">
      <input id="chat-input" type="text" placeholder="${
        (window.localizationManager &&
          window.localizationManager.translate("chat_placeholder")) ||
        "Type your question..."
      }" aria-label="Chat input" />
      <button type="submit">${
        (window.localizationManager &&
          window.localizationManager.translate("chat_send")) ||
        "Send"
      }</button>
    </form>
    <div id="chat-lead" style="display:none;padding:10px;border-top:1px solid #eee;background:#fff;">
      <form id="chat-lead-form" style="display:flex;flex-direction:column;gap:6px;">
        <div class="chat-lead-prompt" style="font-weight:600;font-size:13px;">Share your email & product to get a detailed quote:</div>
        <input type="email" id="chat-lead-email" placeholder="Your email" required style="padding:8px;border:1px solid #ccc;border-radius:6px;font-size:13px;" />
        <input type="text" id="chat-lead-product" placeholder="Product / Volume (optional)" style="padding:8px;border:1px solid #ccc;border-radius:6px;font-size:13px;" />
        <button type="submit" class="chat-lead-submit" style="background:#c75000;color:#fff;border:0;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:13px;">Submit</button>
        <button type="button" id="chat-lead-cancel" class="chat-lead-cancel" style="background:transparent;color:#666;border:0;padding:4px 8px;cursor:pointer;font-size:12px;text-decoration:underline;">Cancel</button>
      </form>
    </div>`;
  document.body.appendChild(box);

  const messagesEl = box.querySelector("#chat-messages");
  const form = box.querySelector("#chat-form");
  const input = box.querySelector("#chat-input");
  const closeBtn = box.querySelector("#chat-close");
  const minimizeBtn = box.querySelector("#chat-minimize");
  const suggestionsEl = box.querySelector("#chat-suggestions");
  const leadPanel = box.querySelector("#chat-lead");
  const leadForm = box.querySelector("#chat-lead-form");
  const leadEmail = box.querySelector("#chat-lead-email");
  const leadProduct = box.querySelector("#chat-lead-product");
  const leadCancel = box.querySelector("#chat-lead-cancel");

  // Reuse Google Apps Script endpoint from contact form for consistent sheet logging
  const GOOGLE_SCRIPT_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbyQ6Ued_kg4BykLo6GZOjAC6enMD-_r3Azoy_-wD9mlae-BKOcOxCtf72l2I0hukSxW/exec";

  // Persistent history (session-based)
  const HISTORY_KEY = "chat_history_v1";
  function loadHistory() {
    try {
      return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveHistory() {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
  const history = loadHistory();

  // Replay history
  if (history.length) {
    history.forEach((msg) => addMessage(msg.role, msg.text));
    messagesEl.dataset.welcomeShown = "1";
    // Ensure suggestions visible even when history exists
    if (suggestionsEl) {
      setTimeout(() => renderSuggestions(), 0);
    }
  }

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = "msg " + (role === "user" ? "user" : "bot");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    history.push({ role, text, ts: Date.now() });
    if (history.length > 200) history.shift();
    saveHistory();
    // Analytics event
    if (window.gtag) {
      window.gtag("event", "chat_message", { role, length: text.length });
    }
  }

  // Typing indicator
  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement("div");
    typingEl.className = "msg bot";
    typingEl.textContent = "...";
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  // Simple intent configuration
  const intents = [
    {
      name: "greeting",
      patterns: [
        /\bhi\b|\bhello\b|\bhey\b|\bgood (morning|evening|afternoon)\b/i,
      ],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_greeting")) ||
        "Hello! Ask me about shipping, MOQ, samples, certifications, pricing, products or documents.",
    },
    {
      name: "shipping",
      patterns: [/shipping|ship|delivery|lead time|transit|port/i],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_shipping")) ||
        "Typical sea freight transit: UAE (Dubai/Abu Dhabi) 15-20 days, Saudi (Riyadh/Jeddah) 18-22 days, Qatar (Doha) 16-20 days. Air freight: 2-5 days depending on route.",
    },
    {
      name: "moq",
      patterns: [/moq|minimum|order size|minimum order|quantity/i],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_moq")) ||
        "MOQ: Usually one 20ft container (≈14 MT cumin seeds / 16 MT turmeric powder). 40ft options available for larger consolidated loads.",
    },
    {
      name: "samples",
      patterns: [/sample|samples|trial/i],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_samples")) ||
        "We provide free quality-approval samples up to 500g via DHL to GCC (arrive in ~3-5 business days). Let us know the product & spec.",
    },
    {
      name: "certifications",
      patterns: [
        /certificat|iso|halal|organic|compliance|documents|documentation|sfda|esma/i,
      ],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_certifications")) ||
        "Available: ISO, Organic (on request), Halal (when required), GCC compliant docs (ESMA, SFDA), phytosanitary, fumigation & full COA.",
    },
    {
      name: "pricing",
      patterns: [/price|pricing|cost|rate|quote|offer|cnf|cif|fob/i],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_pricing")) ||
        "Pricing depends on spice, grade, packaging & incoterm (FOB/CIF/CNF). Share product + volume + destination port for a detailed quote.",
    },
    {
      name: "products",
      patterns: [
        /cumin|turmeric|chilli|chili|pepper|fennel|fenugreek|coriander|ginger|spice/i,
      ],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_products")) ||
        "Main exports: Cumin, Turmeric (high curcumin), Chilli varieties, Coriander, Fennel, Fenugreek, Pepper, Ginger. Ask about any for specifics.",
    },
    {
      name: "payment",
      patterns: [/payment|lc|letter of credit|advance|tt|remittance/i],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_payment")) ||
        "Common terms: LC at sight, 30% advance + 70% against docs, or LC usance for established partners.",
    },
    {
      name: "fact",
      patterns: [/tell me something|fact|interesting|info/i],
      dynamic: () => {
        const facts = [
          "Turmeric’s curcumin content is a key quality marker and we source high-curcumin lots.",
          "Steam sterilization can reduce microbial load for premium spice applications.",
          "Proper container lining reduces moisture ingress, preserving volatile oil content in spices.",
          "Chilli heat is measured in Scoville units – different export markets prefer different ranges.",
        ];
        return facts[Math.floor(Math.random() * facts.length)];
      },
    },
    {
      name: "escalate",
      patterns: [/agent|human|contact|quote|sales|email/i],
      answer:
        (window.localizationManager &&
          window.localizationManager.translate("chat_intent_escalate")) ||
        'I can collect your email & product interest so our export team can respond quickly. Click "Get a Quote" below.',
    },
  ];

  function botReply(userText) {
    const lower = userText.toLowerCase();
    let chosen = null;
    // Score intents by first matching pattern (stop at first match of ordered list for simplicity)
    for (const intent of intents) {
      if (intent.patterns.some((rx) => rx.test(lower))) {
        chosen = intent;
        break;
      }
    }
    let answer;
    if (chosen) {
      // Attempt fresh translation each time for current language
      const lm = window.localizationManager;
      if (lm) {
        const key = "chat_intent_" + chosen.name;
        const translated = lm.translate(key);
        if (translated && translated !== key) {
          answer = translated;
        }
      }
      if (!answer) {
        answer =
          typeof chosen.dynamic === "function"
            ? chosen.dynamic()
            : chosen.answer;
      }
      if (chosen.name === "escalate") showLeadCapture();
    } else {
      // Attempt simple keyword extraction for a hint
      const keywords = lower.match(/\b[a-z]{4,}\b/g) || [];
      answer =
        (window.localizationManager &&
          window.localizationManager.translate("chat_fallback")) ||
        "I didn't fully catch that. You can ask about shipping, MOQ, samples, pricing, products, certifications or payment terms.";
      if (keywords.length) {
        const prefix =
          (window.localizationManager &&
            window.localizationManager.translate(
              "chat_fallback_keywords_prefix"
            )) ||
          " (Keywords detected: ";
        answer += prefix + keywords.slice(0, 3).join(", ") + ")";
      }
    }
    // Simulate slight delay
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage("bot", answer);
    }, 400 + Math.random() * 400);
  }

  toggle.addEventListener("click", () => {
    box.hidden = !box.hidden;
    if (!box.hidden) {
      input.focus();
      // initial welcome only once
      if (!messagesEl.dataset.welcomeShown) {
        addMessage(
          "bot",
          (window.localizationManager &&
            window.localizationManager.translate("chat_welcome")) ||
            "Hi! Ask about shipping, MOQ, samples, certifications, pricing, products or payment terms."
        );
        messagesEl.dataset.welcomeShown = "1";
        renderSuggestions();
      }
      // Re-render suggestions if they were cleared or not present
      if (suggestionsEl && !suggestionsEl.childElementCount) {
        renderSuggestions();
      }
      if (window.gtag) {
        window.gtag("event", "chat_open");
      }
    }
  });

  closeBtn.addEventListener("click", () => {
    box.hidden = true;
  });
  minimizeBtn.addEventListener("click", () => {
    box.hidden = true;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    addMessage("user", val);
    input.value = "";
    botReply(val);
    if (window.gtag) {
      window.gtag("event", "chat_user_message");
    }
  });

  // Quick suggestions
  const suggestionSets = [
    {
      key: "chat_suggestion_shipping",
      label: "Shipping times", // fallback label
      questionKey: "chat_question_shipping",
      fallbackQuestion: "What are your shipping times?",
      intentName: "shipping",
    },
    {
      key: "chat_suggestion_moq",
      label: "MOQ",
      questionKey: "chat_question_moq",
      fallbackQuestion: "What is your MOQ?",
      intentName: "moq",
    },
    {
      key: "chat_suggestion_samples",
      label: "Samples",
      questionKey: "chat_question_samples",
      fallbackQuestion: "Do you provide samples?",
      intentName: "samples",
    },
    {
      key: "chat_suggestion_certifications",
      label: "Certifications",
      questionKey: "chat_question_certifications",
      fallbackQuestion: "What certifications do you have?",
      intentName: "certifications",
    },
    {
      key: "chat_suggestion_pricing",
      label: "Pricing",
      questionKey: "chat_question_pricing",
      fallbackQuestion: "How do I get pricing?",
      intentName: "pricing",
    },
    {
      key: "chat_suggestion_quote",
      label: "Get a Quote",
      questionKey: "chat_question_quote",
      fallbackQuestion: "I need a quote",
      intentName: "escalate",
    },
  ];

  function respondWithIntent(intentName) {
    // Find intent
    const intent = intents.find((i) => i.name === intentName);
    let answer;
    if (intent) {
      const lm = window.localizationManager;
      if (lm) {
        const key = "chat_intent_" + intent.name;
        const translated = lm.translate(key);
        if (translated && translated !== key) answer = translated;
      }
      if (!answer) {
        answer =
          typeof intent.dynamic === "function"
            ? intent.dynamic()
            : intent.answer;
      }
      if (intent.name === "escalate") showLeadCapture();
    }
    if (!answer) return;
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage("bot", answer);
    }, 250 + Math.random() * 250);
  }

  function renderSuggestions() {
    suggestionsEl.innerHTML = "";
    suggestionSets.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      const lm = window.localizationManager;
      const translatedLabel = s.key && lm ? lm.translate(s.key) : null;
      b.textContent = translatedLabel || s.label;
      b.style.cssText =
        "background:#f4f4f4;border:1px solid #ddd;margin:4px 4px 0 0;padding:4px 8px;border-radius:16px;font-size:11px;cursor:pointer;";
      b.addEventListener("click", () => {
        let question = s.fallbackQuestion;
        if (lm && s.questionKey) {
          const q = lm.translate(s.questionKey);
          // If translation missing (returns key as-is), fallback
          if (q && q !== s.questionKey) question = q;
        }
        addMessage("user", question);
        if (s.intentName) {
          respondWithIntent(s.intentName);
        } else {
          botReply(question);
        }
        if (s.key === "chat_suggestion_quote") showLeadCapture();
      });
      suggestionsEl.appendChild(b);
    });
  }

  // Lead capture panel
  function showLeadCapture() {
    leadPanel.style.display = "block";
  }
  leadCancel.addEventListener("click", () => {
    leadPanel.style.display = "none";
  });
  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = leadEmail.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      alert(
        (window.localizationManager &&
          window.localizationManager.translate("chat_lead_invalid_email")) ||
          "Enter valid email"
      );
      return;
    }
    const product = leadProduct.value.trim();
    // Prevent double submit
    const submitBtn = leadForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    addMessage(
      "user",
      (window.localizationManager &&
        window.localizationManager.translate("chat_user_submitted_quote")) ||
        "Submitted quote request."
    );
    showTyping();

    // Create/show loader inside lead panel
    let loader = leadPanel.querySelector(".chat-loading");
    if (!loader) {
      loader = document.createElement("div");
      loader.className = "chat-loading";
      const sendingText =
        (window.localizationManager &&
          window.localizationManager.translate("chat_sending")) ||
        "Sending...";
      loader.innerHTML =
        '<span class="chat-spinner"></span><span>' + sendingText + "</span>";
      leadPanel.appendChild(loader);
    }
    loader.style.display = "flex";

    // Build transcript (limit to last 30 messages to keep payload reasonable)
    const transcript = history
      .slice(-30)
      .map((m) => {
        const time = new Date(m.ts).toISOString();
        return `[${time}] ${m.role.toUpperCase()}: ${m.text}`;
      })
      .join("\n");

    // Prepare payload shaped similar to contact form fields for sheet uniformity
    const payload = {
      name: "", // Not captured in chat yet
      email: email,
      company: "", // Could extend later
      message: `CHAT_LEAD\nProduct: ${product || "-"}\nPage: ${
        location.href
      }\nLang: ${
        (window.localizationManager &&
          window.localizationManager.currentLanguage) ||
        "en"
      }\nTranscript:\n${transcript}`,
    };

    // Submit via hidden form (mirrors contact form approach -> avoids CORS fetch issues)
    const hiddenForm = document.createElement("form");
    hiddenForm.style.display = "none";
    hiddenForm.method = "POST";
    hiddenForm.action = GOOGLE_SCRIPT_ENDPOINT;
    const iframeId = "chatHiddenIframe";
    let iframe = document.getElementById(iframeId);
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.name = iframeId;
      iframe.id = iframeId;
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }
    hiddenForm.target = iframeId;
    const jsonField = document.createElement("input");
    jsonField.type = "hidden";
    jsonField.name = "json";
    jsonField.value = JSON.stringify(payload);
    hiddenForm.appendChild(jsonField);
    document.body.appendChild(hiddenForm);

    let completed = false;
    const finish = (ok) => {
      if (completed) return;
      completed = true;
      hideTyping();
      if (ok) {
        const base =
          (window.localizationManager &&
            window.localizationManager.translate("chat_lead_success")) ||
          "Thank you! Our export team will contact {email} shortly.{product}";
        const prodFragment = product ? " Product: " + product : "";
        addMessage(
          "bot",
          base.replace("{email}", email).replace("{product}", prodFragment)
        );
      } else {
        addMessage(
          "bot",
          (window.localizationManager &&
            window.localizationManager.translate("chat_lead_error")) ||
            "There was an issue sending your request. Please email info@mileoverseas.com"
        );
      }
      leadPanel.style.display = "none";
      submitBtn.disabled = false;
      setTimeout(() => {
        document.body.removeChild(hiddenForm);
      }, 2000);
      if (loader) loader.style.display = "none";
    };

    // Timeout guard
    const timeoutId = setTimeout(() => finish(false), 10000);
    iframe.onload = () => {
      clearTimeout(timeoutId);
      finish(true);
    };
    try {
      hiddenForm.submit();
    } catch (err) {
      clearTimeout(timeoutId);
      finish(false);
    }

    if (window.gtag) {
      window.gtag("event", "chat_lead_submit");
    }
  });

  // Optional: adjust labels with existing localization manager if available
  function applyLocalization(lang) {
    const lm = window.localizationManager;
    if (!lm) return;
    toggle.textContent = lm.translate("chat_toggle");
    const titleEl = box.querySelector("[data-i18n-chat-title]");
    if (titleEl) titleEl.textContent = lm.translate("chat_title");
    input.placeholder = lm.translate("chat_placeholder");
    form.querySelector('button[type="submit"]').textContent =
      lm.translate("chat_send");
    const promptEl = box.querySelector(".chat-lead-prompt");
    if (promptEl) promptEl.textContent = lm.translate("chat_lead_prompt");
    leadEmail.placeholder = lm.translate("chat_lead_email_placeholder");
    leadProduct.placeholder = lm.translate("chat_lead_product_placeholder");
    const submitBtn = box.querySelector(".chat-lead-submit");
    if (submitBtn) submitBtn.textContent = lm.translate("chat_lead_submit");
    const cancelBtn = box.querySelector(".chat-lead-cancel");
    if (cancelBtn) cancelBtn.textContent = lm.translate("chat_lead_cancel");
    renderSuggestions();
  }
  setTimeout(
    () =>
      applyLocalization(
        window.localizationManager && window.localizationManager.currentLanguage
      ),
    500
  );
  window.addEventListener("languageChanged", (e) =>
    applyLocalization(e.detail.lang)
  );
})();
