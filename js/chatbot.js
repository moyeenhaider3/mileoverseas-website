// ============================================================
//  Mile Overseas — Rule-Based Chatbot
//  Architecture: Knowledge Base + Decision-Tree State Machine
//  No AI / No backend polling — pure scripted flows
// ============================================================
(function () {
  "use strict";
  if (window.__chatbotInitialized) return;
  window.__chatbotInitialized = true;

  // ============================================================
  //  KNOWLEDGE BASE
  // ============================================================
  var KB = {
    company: {
      name: "Mile Overseas",
      email: "info@mileoverseas.com",
      whatsapp: "+919876543210",
      phone: "+91-8178070378",
      location: "India (Gujarat / Maharashtra / Madhya Pradesh sourcing regions)",
      founded: "Established Indian spice exporter with 4,000+ years of cultivation heritage",
      usp: [
        "Direct farm-to-port sourcing — no middlemen",
        "ISO 22000, FSSAI, Organic, Halal certified",
        "Custom packaging & private label available",
        "Lab-tested every batch — COA provided",
        "20ft & 40ft FCL + LCL options",
      ],
    },

    products: [
      { name: "Cumin Seeds",       slug: "cumin-seeds",       ft20: "14 MT", ft40: "27 MT", harvest: "Oct – Feb", note: "2–4% essential oil; Singapore, European & Bold grades" },
      { name: "Coriander Seeds",   slug: "coriander-seeds",   ft20: "9.5 MT",ft40: "19 MT", harvest: "Oct – Feb", note: "Varieties: Dhana, Scooter, Parrot, Double Parrot, Eagle" },
      { name: "Turmeric Finger",   slug: "turmeric-finger",   ft20: "18 MT", ft40: "36 MT", harvest: "Jun – Sep", note: "3–5% curcumin; Nizamabad, Salem, Rajapuri, Ladkong" },
      { name: "Red Chilli",        slug: "red-chilli",        ft20: "6.5 MT",ft40: "13 MT", harvest: "Mar – Jun", note: "30,000–50,000 SHU; Sannam, Byadgi, Kashmiri, Warangal" },
      { name: "Fennel Seeds",      slug: "fennel-seeds",      ft20: "14 MT", ft40: "27 MT", harvest: "Oct – Feb", note: "99–99.5% purity; sweet anise-like aroma" },
      { name: "Mustard Seeds",     slug: "mustard-seeds",     ft20: "20 MT", ft40: "—",      harvest: "Oct – Mar", note: "42% oil content; yellow & brown varieties" },
      { name: "Sesame Seeds",      slug: "sesame-seeds",      ft20: "19 MT", ft40: "38 MT", harvest: "Jun – Sep", note: "50–60% oil; white/hulled, black, natural" },
      { name: "Fenugreek Seeds",   slug: "fenugreek-seeds",   ft20: "13 MT", ft40: "27 MT", harvest: "Oct – Feb", note: "20–25% protein; digestive & blood-sugar benefits" },
      { name: "Cardamom",          slug: "cardamom",          ft20: "8 MT",  ft40: "16 MT", harvest: "Sep – Dec", note: "5–7% volatile oil; Green & Black varieties" },
      { name: "Black Cumin (Kalonji)", slug: "black-cumin",   ft20: "14 MT", ft40: "27 MT", harvest: "Oct – Feb", note: "30–40% oil (Nigella sativa); powerful wellness seed" },
      { name: "Dill Seeds",        slug: "dill-seeds",        ft20: "13 MT", ft40: "27 MT", harvest: "Jun – Sep", note: "3–4% volatile oil; citrusy fresh aroma" },
      { name: "Psyllium Husk",     slug: "psyllium-husk",     ft20: "9 MT",  ft40: "18 MT", harvest: "Jun – Sep", note: "80–85% dietary fiber; pharmaceutical & food grade" },
      { name: "Ajwain (Carom)",    slug: "ajwain",            ft20: "13.5 MT",ft40: "27 MT",harvest: "Jun – Sep", note: "2–4% essential oil (thymol); digestive & anti-microbial" },
      { name: "Chia Seeds",        slug: "chia-seeds",        ft20: "18 MT", ft40: "—",      harvest: "Jun – Sep", note: "30–40% fiber, 20–30% omega-3; superfood grade" },
      { name: "Celery Seeds",      slug: "celery-seeds",      ft20: "13 MT", ft40: "27 MT", harvest: "Oct – Feb", note: "1–3% essential oil; anti-inflammatory properties" },
      { name: "Cloves",            slug: "cloves",            ft20: "11 MT", ft40: "22 MT", harvest: "Sep – Jan", note: "15–20% volatile oil; Indonesian, Madagascar & Indian" },
      { name: "Star Anise",        slug: "star-anise",        ft20: "10 MT", ft40: "20 MT", harvest: "Feb – Sep", note: "5–7% volatile oil; Chinese & Indian varieties" },
      { name: "Nutmeg",            slug: "nutmeg",            ft20: "8 MT",  ft40: "16 MT", harvest: "Jun – Aug", note: "Premium whole & broken; high myristicin content" },
      { name: "Black Pepper",      slug: "black-pepper",      ft20: "14 MT", ft40: "28 MT", harvest: "Nov – Feb", note: "Malabar & Tellicherry grades; 4–7% piperine" },
      { name: "Cinnamon",          slug: "cinnamon",          ft20: "10 MT", ft40: "20 MT", harvest: "Oct – Mar", note: "Ceylon & Cassia varieties; 0.5–4% volatile oil" },
      { name: "Flax Seeds",        slug: "flax-seed",         ft20: "18 MT", ft40: "36 MT", harvest: "Oct – Feb", note: "Brown & golden; 40% oil, 28% fiber, omega-3 rich" },
      { name: "Quinoa",            slug: "quinoa",            ft20: "16 MT", ft40: "32 MT", harvest: "Jun – Sep", note: "White, red & black; complete protein superfood" },
    ],

    shipping: {
      GCC: {
        label: "GCC (UAE, Saudi, Qatar, Kuwait, Oman, Bahrain)",
        sea: "15–22 days from Nhava Sheva / Mundra",
        air: "2–4 days",
        ports: "Jebel Ali (Dubai), Dammam, Shuaiba, Doha",
        notes: "ESMA / SFDA compliance docs provided",
      },
      Europe: {
        label: "Europe (Germany, UK, Netherlands, France, Italy, Spain)",
        sea: "20–28 days via Rotterdam / Felixstowe",
        air: "3–5 days",
        ports: "Hamburg, Rotterdam, Antwerp, Felixstowe, Barcelona",
        notes: "EU MRL compliant; organic certification available",
      },
      USA: {
        label: "USA & Canada",
        sea: "25–35 days via East Coast / West Coast",
        air: "5–7 days",
        ports: "Los Angeles, New York/NJ, Houston",
        notes: "FDA-compliant labeling; USDA organic on request",
      },
      Asia: {
        label: "South & Southeast Asia (Malaysia, Indonesia, Vietnam, Philippines, Singapore)",
        sea: "10–18 days",
        air: "2–4 days",
        ports: "Singapore, Port Klang, Tanjung Priok, Ho Chi Minh",
        notes: "Halal certification available",
      },
      Africa: {
        label: "Africa (Egypt, Morocco, Nigeria, Kenya, South Africa)",
        sea: "18–28 days",
        air: "4–6 days",
        ports: "Port Said, Casablanca, Lagos, Mombasa, Durban",
        notes: "Phytosanitary & fumigation certs provided",
      },
      Other: {
        label: "Russia, Central Asia, Latin America & Other",
        sea: "25–40 days (varies by destination)",
        air: "5–9 days",
        ports: "St. Petersburg, Novorossiysk, Santos",
        notes: "All export documentation supported",
      },
    },

    certifications: [
      "✅ FSSAI — India food safety authority compliance",
      "✅ ISO 22000 — Food safety management system",
      "✅ Organic — Available on request (USDA / EU / India NOP)",
      "✅ Halal — Available on request",
      "✅ Phytosanitary Certificate — Issued by Indian authorities",
      "✅ Fumigation Certificate — Provided with every shipment",
      "✅ Certificate of Analysis (COA) — Lab report per batch",
      "✅ ESMA compliance — For UAE market",
      "✅ SFDA compliance — For Saudi market",
      "✅ Non-GMO declaration — Available on request",
    ],

    payment: [
      "💳 LC at Sight — Letter of Credit (most common for new buyers)",
      "💳 30% TT Advance + 70% against BL copy",
      "💳 LC Usance (30/60/90 days) — for established partners",
      "💳 DA/DP terms for long-term buyers (case by case)",
    ],

    incoterms: [
      "🚢 FOB — We load at Indian port; your freight from there",
      "🌍 CIF — We cover cost + insurance + freight to your port",
      "📦 CNF/CFR — Cost + freight, you arrange insurance",
      "🏭 EXW — Ex-factory; you arrange all logistics",
    ],
  };

  // ============================================================
  //  GOOGLE APPS SCRIPT ENDPOINT (same as contact form)
  // ============================================================
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbyQ6Ued_kg4BykLo6GZOjAC6enMD-_r3Azoy_-wD9mlae-BKOcOxCtf72l2I0hukSxW/exec";

  // ============================================================
  //  CSS INJECTION
  // ============================================================
  var css = document.createElement("style");
  css.textContent = `
    /* ── Toggle Button ── */
    #cb-toggle {
      position: fixed; bottom: 110px; right: 24px;
      background: linear-gradient(135deg, #c75000, #8b4513);
      color: #fff; border: none; border-radius: 30px;
      padding: 13px 22px; cursor: pointer; z-index: 9999;
      font: 600 14px/1 'Nunito Sans', sans-serif;
      box-shadow: 0 4px 16px rgba(199,80,0,.4);
      display: flex; align-items: center; gap: 8px;
      transition: transform .2s, box-shadow .2s;
      user-select: none;
    }
    #cb-toggle:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(199,80,0,.45); }
    #cb-toggle .cb-icon { font-size: 18px; line-height:1; }
    #cb-toggle .cb-unread {
      position: absolute; top: -6px; right: -6px;
      background: #e53e3e; color: #fff; border-radius: 50%;
      font-size: 11px; width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      display: none;
    }

    /* ── Chat Box ── */
    #cb-box {
      position: fixed; bottom: 176px; right: 24px;
      width: 360px;
      /* bottom(176) + max-height must not exceed (100dvh - navbar~130px) */
      max-height: min(560px, calc(100dvh - 306px));
      background: #fff; border-radius: 18px;
      display: flex; flex-direction: column;
      font: 14px/1.5 'Nunito Sans', sans-serif;
      box-shadow: 0 8px 40px rgba(0,0,0,.18);
      z-index: 9999; overflow: hidden;
      transition: opacity .25s, transform .25s;
    }
    #cb-box.cb-hidden {
      opacity: 0; pointer-events: none;
      transform: translateY(16px) scale(.97);
    }

    /* ── Header ── */
    #cb-header {
      background: linear-gradient(135deg, #c75000, #8b4513);
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #cb-header .cb-avatar {
      width: 36px; height: 36px; background: rgba(255,255,255,.25);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
    }
    #cb-header .cb-title { flex: 1; }
    #cb-header .cb-title strong { display: block; color: #fff; font-size: 13px; font-weight: 700; }
    #cb-header .cb-title span { color: rgba(255,255,255,.8); font-size: 11px; }
    #cb-header .cb-online {
      width: 8px; height: 8px; background: #68d391; border-radius: 50%;
      display: inline-block; margin-right: 4px;
      box-shadow: 0 0 0 2px rgba(104,211,145,.3);
      animation: cb-pulse 2s infinite;
    }
    @keyframes cb-pulse { 0%,100%{box-shadow:0 0 0 2px rgba(104,211,145,.3)} 50%{box-shadow:0 0 0 5px rgba(104,211,145,.1)} }
    #cb-close {
      background: rgba(255,255,255,.15); border: none; color: #fff;
      width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; transition: background .2s; flex-shrink: 0;
    }
    #cb-close:hover { background: rgba(255,255,255,.3); }

    /* ── Messages ── */
    #cb-messages {
      flex: 1; padding: 14px 12px; overflow-y: auto;
      background: #fdf8f3; display: flex; flex-direction: column; gap: 8px;
      scroll-behavior: smooth;
    }
    #cb-messages::-webkit-scrollbar { width: 4px; }
    #cb-messages::-webkit-scrollbar-track { background: transparent; }
    #cb-messages::-webkit-scrollbar-thumb { background: #d4a27a; border-radius: 4px; }

    .cb-msg-wrap { display: flex; flex-direction: column; }
    .cb-msg-wrap.cb-user { align-items: flex-end; }
    .cb-msg-wrap.cb-bot { align-items: flex-start; }

    .cb-bubble {
      max-width: 82%; padding: 9px 13px; border-radius: 14px;
      font-size: 13px; line-height: 1.5; word-wrap: break-word;
      white-space: pre-wrap;
    }
    .cb-bot .cb-bubble {
      background: #fff; color: #3d2010;
      border: 1px solid #e8d5c0; border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .cb-user .cb-bubble {
      background: linear-gradient(135deg, #c75000, #a04000);
      color: #fff; border-bottom-right-radius: 4px;
    }

    /* ── Typing Indicator ── */
    .cb-typing { display: flex; align-items: center; gap: 4px; padding: 10px 13px; }
    .cb-dot {
      width: 7px; height: 7px; background: #c75000; border-radius: 50%;
      animation: cb-bounce .9s infinite ease-in-out;
    }
    .cb-dot:nth-child(2) { animation-delay: .15s; }
    .cb-dot:nth-child(3) { animation-delay: .3s; }
    @keyframes cb-bounce { 0%,80%,100%{transform:scale(.8);opacity:.5} 40%{transform:scale(1.2);opacity:1} }

    /* ── Quick Replies ── */
    #cb-qr {
      padding: 8px 12px 10px; display: flex; flex-wrap: wrap; gap: 6px;
      background: #fdf8f3; border-top: 1px solid #f0e4d4;
    }
    #cb-qr:empty { display: none; padding: 0; border: none; }
    .cb-chip {
      background: #fff; color: #8b4513; border: 1.5px solid #d4956a;
      padding: 6px 12px; border-radius: 18px; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: background .2s, color .2s, transform .1s;
      white-space: nowrap;
    }
    .cb-chip:hover { background: #c75000; color: #fff; border-color: #c75000; transform: translateY(-1px); }

    /* ── Input Area ── */
    #cb-form {
      display: flex; border-top: 1px solid #f0e4d4; background: #fff;
      padding: 8px 10px; gap: 8px; align-items: center;
    }
    #cb-input {
      flex: 1; border: 1.5px solid #e8d5c0; border-radius: 22px;
      padding: 9px 14px; font: 13px/1 'Nunito Sans', sans-serif;
      outline: none; color: #3d2010; background: #fdf8f3;
      transition: border-color .2s;
    }
    #cb-input:focus { border-color: #c75000; background: #fff; }
    #cb-input::placeholder { color: #b0906a; }
    #cb-send {
      width: 36px; height: 36px; border: none;
      background: linear-gradient(135deg, #c75000, #8b4513);
      color: #fff; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
      transition: transform .2s, box-shadow .2s;
    }
    #cb-send:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(199,80,0,.4); }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      #cb-box {
        left: 10px; right: 10px; width: auto;
        bottom: 176px;
        /* 176(bottom) + 130(navbar) = 306 — box top always clears navbar */
        max-height: min(480px, calc(100dvh - 306px));
      }
      #cb-toggle { right: 16px; bottom: 110px; }
    }
    @media (min-width: 993px) {
      #cb-toggle { bottom: 88px !important; }
      /* 152(bottom) + 130(navbar) = 282 */
      #cb-box { bottom: 152px; max-height: min(560px, calc(100dvh - 282px)); }
    }
  `;
  document.head.appendChild(css);

  // ============================================================
  //  DOM — Build Chat Widget
  // ============================================================
  var toggle = document.createElement("button");
  toggle.id = "cb-toggle";
  toggle.setAttribute("aria-label", "Open chat");
  toggle.innerHTML = '<span class="cb-icon">💬</span> Chat <span class="cb-unread" id="cb-unread">1</span>';
  document.body.appendChild(toggle);

  var box = document.createElement("div");
  box.id = "cb-box";
  box.className = "cb-hidden";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", "Mile Overseas chat assistant");
  box.innerHTML =
    '<div id="cb-header">' +
      '<div class="cb-avatar">🌿</div>' +
      '<div class="cb-title">' +
        '<strong>Mile Overseas Assistant</strong>' +
        '<span><span class="cb-online"></span>Online · Typically replies instantly</span>' +
      '</div>' +
      '<button id="cb-close" aria-label="Close chat">✕</button>' +
    '</div>' +
    '<div id="cb-messages" aria-live="polite"></div>' +
    '<div id="cb-qr" aria-label="Quick options"></div>' +
    '<form id="cb-form" autocomplete="off">' +
      '<input id="cb-input" type="text" placeholder="Type a message…" aria-label="Chat input" />' +
      '<button id="cb-send" type="submit" aria-label="Send">➤</button>' +
    '</form>';
  document.body.appendChild(box);

  var messagesEl = document.getElementById("cb-messages");
  var qrEl = document.getElementById("cb-qr");
  var form = document.getElementById("cb-form");
  var input = document.getElementById("cb-input");
  var closeBtn = document.getElementById("cb-close");
  var unreadBadge = document.getElementById("cb-unread");

  // ============================================================
  //  STATE MACHINE
  // ============================================================
  var state = {
    flow: null,   // current flow name string
    step: null,   // current step within flow
    data: {},     // collected data (product choice, region, etc.)
    lead: {       // lead capture collected fields
      name: null, email: null, phone: null, requirement: null
    },
    leading: false, // true while inside lead capture flow
    leadStep: null,  // "name" | "email" | "phone" | "requirement"
  };

  // ============================================================
  //  CORE RENDERING
  // ============================================================
  var typingEl = null;

  function scrollToBottom() {
    setTimeout(function () { messagesEl.scrollTop = messagesEl.scrollHeight; }, 50);
  }

  function addBotMsg(html, delay) {
    delay = delay || 0;
    return new Promise(function (resolve) {
      setTimeout(function () {
        var wrap = document.createElement("div");
        wrap.className = "cb-msg-wrap cb-bot";
        var bubble = document.createElement("div");
        bubble.className = "cb-bubble";
        bubble.innerHTML = html;
        wrap.appendChild(bubble);
        if (typingEl) { messagesEl.removeChild(typingEl); typingEl = null; }
        messagesEl.appendChild(wrap);
        scrollToBottom();
        resolve();
      }, delay);
    });
  }

  function addUserMsg(text) {
    var wrap = document.createElement("div");
    wrap.className = "cb-msg-wrap cb-user";
    var bubble = document.createElement("div");
    bubble.className = "cb-bubble";
    bubble.textContent = text;
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement("div");
    typingEl.className = "cb-msg-wrap cb-bot";
    typingEl.innerHTML = '<div class="cb-bubble cb-typing"><div class="cb-dot"></div><div class="cb-dot"></div><div class="cb-dot"></div></div>';
    messagesEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    if (typingEl) { try { messagesEl.removeChild(typingEl); } catch(e){} typingEl = null; }
  }

  function clearQR() { qrEl.innerHTML = ""; }

  function showQR(chips) {
    clearQR();
    chips.forEach(function (chip) {
      var btn = document.createElement("button");
      btn.className = "cb-chip";
      btn.type = "button";
      btn.textContent = chip.label;
      btn.addEventListener("click", function () {
        addUserMsg(chip.label);
        clearQR();
        if (chip.action) chip.action();
      });
      qrEl.appendChild(btn);
    });
  }

  // ============================================================
  //  BOT response with typing delay
  // ============================================================
  function botSay(html, delay, then) {
    showTyping();
    setTimeout(function () {
      hideTyping();
      addBotMsg(html);
      if (then) then();
    }, delay || 600);
  }

  // ============================================================
  //  MAIN MENU
  // ============================================================
  function showMainMenu(intro) {
    state.flow = null; state.step = null; state.data = {};
    var msg = intro || "How can I help you today? Choose an option or type your question:";
    botSay(msg, 400, function () {
      showQR([
        { label: "🌿 Products & Catalog", action: flowProducts },
        { label: "📦 MOQ & Quantities",   action: flowMOQ },
        { label: "🚢 Shipping & Delivery", action: flowShipping },
        { label: "💰 Get a Price Quote",  action: startLeadCapture },
        { label: "📜 Certifications",     action: flowCerts },
        { label: "🧪 Request a Sample",   action: flowSamples },
      ]);
    });
  }

  // ============================================================
  //  FLOW — Products
  // ============================================================
  function flowProducts() {
    state.flow = "products";
    botSay("We export <strong>" + KB.products.length + " premium spices & seeds</strong> from India. Which are you interested in?", 500, function () {
      // Show product chips in batches (most popular first)
      var popular = KB.products.slice(0, 12);
      var chips = popular.map(function (p) {
        return { label: p.name, action: function () { showProductDetail(p); } };
      });
      chips.push({ label: "📋 See all 22 products", action: showAllProducts });
      chips.push({ label: "🔙 Main Menu", action: function () { showMainMenu(); } });
      showQR(chips);
    });
  }

  function showAllProducts() {
    botSay("Here are all our products:", 500, function () {
      var chips = KB.products.map(function (p) {
        return { label: p.name, action: function () { showProductDetail(p); } };
      });
      chips.push({ label: "🔙 Main Menu", action: function () { showMainMenu(); } });
      showQR(chips);
    });
  }

  function showProductDetail(p) {
    state.data.product = p.name;
    var html =
      "<strong>" + p.name + "</strong><br>" +
      "🌱 <em>Harvest:</em> " + p.harvest + "<br>" +
      "📦 <em>20ft container:</em> " + p.ft20 + "<br>" +
      (p.ft40 !== "—" ? "📦 <em>40ft container:</em> " + p.ft40 + "<br>" : "") +
      "✨ " + p.note;
    botSay(html, 600, function () {
      showQR([
        { label: "💰 Get Quote for " + p.name, action: function () { startLeadCapture(p.name); } },
        { label: "📦 Check MOQ",               action: function () { showMOQForProduct(p); } },
        { label: "🧪 Request Sample",           action: function () { flowSamples(p.name); } },
        { label: "🌿 Other Products",            action: flowProducts },
        { label: "🔙 Main Menu",                action: function () { showMainMenu(); } },
      ]);
    });
  }

  // ============================================================
  //  FLOW — MOQ
  // ============================================================
  function flowMOQ() {
    state.flow = "moq";
    botSay("Our MOQ is typically <strong>one 20-foot container</strong>. Select a product to see exact capacity:", 500, function () {
      var chips = KB.products.map(function (p) {
        return { label: p.name, action: function () { showMOQForProduct(p); } };
      });
      chips.push({ label: "🔙 Main Menu", action: function () { showMainMenu(); } });
      showQR(chips);
    });
  }

  function showMOQForProduct(p) {
    var html =
      "<strong>" + p.name + " — Container Capacities</strong><br>" +
      "📦 20ft FCL: <strong>" + p.ft20 + "</strong><br>" +
      (p.ft40 !== "—" ? "📦 40ft FCL: <strong>" + p.ft40 + "</strong><br>" : "") +
      "<br>LCL consolidation available for smaller trial orders. Contact us for details.";
    botSay(html, 600, function () {
      showQR([
        { label: "💰 Get Quote",    action: function () { startLeadCapture(p.name); } },
        { label: "📦 Another Product", action: flowMOQ },
        { label: "🔙 Main Menu",    action: function () { showMainMenu(); } },
      ]);
    });
  }

  // ============================================================
  //  FLOW — Shipping
  // ============================================================
  function flowShipping() {
    state.flow = "shipping";
    botSay("We ship from <strong>Nhava Sheva (Mumbai) & Mundra (Gujarat)</strong> ports. Which region are you shipping to?", 500, function () {
      showQR([
        { label: "🇸🇦 GCC Countries",        action: function () { showShippingDetail("GCC"); } },
        { label: "🇩🇪 Europe",                action: function () { showShippingDetail("Europe"); } },
        { label: "🇺🇸 USA & Canada",          action: function () { showShippingDetail("USA"); } },
        { label: "🇸🇬 South & SE Asia",       action: function () { showShippingDetail("Asia"); } },
        { label: "🌍 Africa",                  action: function () { showShippingDetail("Africa"); } },
        { label: "🌐 Russia / Latin America", action: function () { showShippingDetail("Other"); } },
        { label: "🔙 Main Menu",              action: function () { showMainMenu(); } },
      ]);
    });
  }

  function showShippingDetail(region) {
    var s = KB.shipping[region];
    var html =
      "<strong>" + s.label + "</strong><br><br>" +
      "🚢 Sea freight: <strong>" + s.sea + "</strong><br>" +
      "✈️ Air freight: <strong>" + s.air + "</strong><br>" +
      "🏭 Main ports: " + s.ports + "<br>" +
      "📋 " + s.notes;
    botSay(html, 700, function () {
      showQR([
        { label: "💰 Get a Quote",      action: startLeadCapture },
        { label: "📜 Certifications",   action: flowCerts },
        { label: "🚢 Other Region",     action: flowShipping },
        { label: "🔙 Main Menu",        action: function () { showMainMenu(); } },
      ]);
    });
  }

  // ============================================================
  //  FLOW — Certifications
  // ============================================================
  function flowCerts() {
    var html = "<strong>Our Certifications & Compliance Docs</strong><br><br>" +
      KB.certifications.join("<br>");
    botSay(html, 600, function () {
      botSay("Need specific documents for your import? We'll prepare them for you.", 800, function () {
        showQR([
          { label: "💰 Request a Quote",   action: startLeadCapture },
          { label: "📧 Email Us Directly",  action: function () { showContactInfo(); } },
          { label: "🔙 Main Menu",          action: function () { showMainMenu(); } },
        ]);
      });
    });
  }

  // ============================================================
  //  FLOW — Samples
  // ============================================================
  function flowSamples(productName) {
    var html =
      "🧪 <strong>Free Sample Policy</strong><br><br>" +
      "✅ Up to <strong>500g per product</strong> — free of charge<br>" +
      "✅ Shipped via <strong>DHL / FedEx</strong><br>" +
      "✅ GCC delivery: <strong>3–5 business days</strong><br>" +
      "✅ Europe / USA: <strong>5–7 business days</strong><br><br>" +
      "Provide your details and we'll dispatch your sample promptly.";
    botSay(html, 600, function () {
      startLeadCapture(productName ? productName + " sample" : "sample");
    });
  }

  // ============================================================
  //  FLOW — Contact Info
  // ============================================================
  function showContactInfo() {
    var html =
      "📧 <strong>info@mileoverseas.com</strong><br>" +
      "📞 <strong>" + KB.company.phone + "</strong><br>" +
      "💬 <a href='https://wa.me/919876543210' target='_blank' style='color:#c75000;font-weight:600;'>WhatsApp Us</a>";
    botSay(html, 400, function () {
      showQR([{ label: "🔙 Main Menu", action: function () { showMainMenu(); } }]);
    });
  }

  // ============================================================
  //  LEAD CAPTURE — Conversational (inline)
  // ============================================================
  function startLeadCapture(productHint) {
    clearQR();
    state.leading = true;
    state.leadStep = "name";
    state.lead = { name: null, email: null, phone: null, requirement: productHint || null };
    botSay("Great! Let me connect you with our export team. 👋<br>May I have your <strong>name</strong>?", 600);
  }

  function handleLeadInput(text) {
    var step = state.leadStep;
    if (step === "name") {
      state.lead.name = text;
      state.leadStep = "email";
      botSay("Thanks, <strong>" + text + "</strong>! 😊<br>What's your <strong>email address</strong>?", 600);
    } else if (step === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        botSay("That doesn't look like a valid email. Please try again:", 400);
        return;
      }
      state.lead.email = text;
      state.leadStep = "phone";
      botSay("Got it! What's your <strong>WhatsApp / phone number</strong> (with country code)?", 600);
    } else if (step === "phone") {
      state.lead.phone = text;
      state.leadStep = "requirement";
      var prompt = state.lead.requirement
        ? "And what <strong>quantity</strong> are you looking for? (Current interest: " + state.lead.requirement + ")"
        : "Which <strong>product(s) and approximate quantity</strong> are you looking for?";
      botSay(prompt, 600);
    } else if (step === "requirement") {
      state.lead.requirement = text;
      state.leadStep = null;
      state.leading = false;
      submitLead();
    }
  }

  function submitLead() {
    var l = state.lead;
    var summary =
      "📋 <strong>Your Enquiry Summary</strong><br>" +
      "👤 " + l.name + "<br>" +
      "📧 " + l.email + "<br>" +
      "📱 " + l.phone + "<br>" +
      "🌿 " + l.requirement;
    botSay(summary, 600, function () {
      showTyping();
      var payload = {
        name: l.name,
        email: l.email,
        company: l.phone,
        message: "CHAT_LEAD | Product: " + l.requirement + " | Page: " + location.pathname,
      };
      // Submit via hidden form (avoids CORS issues with GAS)
      var iframe = document.getElementById("cb-iframe");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = "cb-iframe"; iframe.id = "cb-iframe";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
      }
      var hiddenForm = document.createElement("form");
      hiddenForm.style.display = "none";
      hiddenForm.method = "POST";
      hiddenForm.action = ENDPOINT;
      hiddenForm.target = "cb-iframe";
      var field = document.createElement("input");
      field.type = "hidden"; field.name = "json"; field.value = JSON.stringify(payload);
      hiddenForm.appendChild(field);
      document.body.appendChild(hiddenForm);

      var done = false;
      var finish = function (ok) {
        if (done) return; done = true;
        hideTyping();
        if (ok) {
          botSay("✅ <strong>Request sent!</strong> Our export team will contact <strong>" + l.email + "</strong> within 24 hours.<br><br>You can also reach us directly:<br>📞 " + KB.company.phone, 400, function () {
            showQR([
              { label: "💬 WhatsApp Us", action: function () { window.open("https://wa.me/919876543210?text=Hi%20Mile%20Overseas%2C%20I%20am%20interested%20in%20" + encodeURIComponent(l.requirement || "spices"), "_blank"); } },
              { label: "🔙 Main Menu",   action: function () { showMainMenu(); } },
            ]);
          });
        } else {
          botSay("We had a small hiccup sending the form. Please email us directly at <strong>info@mileoverseas.com</strong> or <a href='https://wa.me/919876543210' target='_blank' style='color:#c75000;font-weight:600'>WhatsApp us</a>.", 400);
        }
        setTimeout(function () { try { document.body.removeChild(hiddenForm); } catch(e){} }, 3000);
      };
      var timeout = setTimeout(function () { finish(false); }, 12000);
      iframe.onload = function () { clearTimeout(timeout); finish(true); };
      try { hiddenForm.submit(); } catch(e) { clearTimeout(timeout); finish(false); }
    });
    if (window.gtag) window.gtag("event", "chat_lead_submit");
  }

  // ============================================================
  //  KEYWORD FALLBACK — handles free-text outside of a flow
  // ============================================================
  function productKeywords() {
    var map = {};
    KB.products.forEach(function (p) {
      var words = p.name.toLowerCase().split(/[\s()]+/);
      words.forEach(function (w) { if (w.length > 2) map[w] = p; });
    });
    return map;
  }
  var PRODUCT_MAP = productKeywords();

  var INTENTS = [
    { rx: /\b(hi|hello|hey|good\s+(morning|evening|afternoon)|howdy|namaste)\b/i, fn: function () { showMainMenu("Hi there! 👋 Great to hear from you."); } },
    { rx: /\b(menu|help|start|options|what can|how can)\b/i, fn: function () { showMainMenu(); } },
    { rx: /\b(ship|deliver|transit|freight|port|lead time)\b/i, fn: flowShipping },
    { rx: /\b(moq|minimum|order qty|quantity|container|how much)\b/i, fn: flowMOQ },
    { rx: /\b(cert|iso|fssai|halal|organic|compliance|sfda|esma|phyto|fumig|coa|document)\b/i, fn: flowCerts },
    { rx: /\b(price|pricing|cost|rate|quote|offer|cnf|cif|fob|rates?)\b/i, fn: function () { startLeadCapture(); } },
    { rx: /\b(sample|trial|test)\b/i, fn: function () { flowSamples(); } },
    { rx: /\b(product|catalog|spice|seed|what do you)\b/i, fn: flowProducts },
    { rx: /\b(payment|lc|letter of credit|tt|advance|telegraphic)\b/i, fn: showPayment },
    { rx: /\b(incoterm|fob|cif|cnf|cfr|exw|delivery term)\b/i, fn: showIncoterms },
    { rx: /\b(contact|email|phone|whatsapp|reach)\b/i, fn: showContactInfo },
    { rx: /\b(custom blend|blending|private label|own brand|repack)\b/i, fn: showCustomBlend },
    { rx: /\b(about|who are you|company|mile overseas)\b/i, fn: showAbout },
  ];

  function handleFreeText(text) {
    var lower = text.toLowerCase();

    // 1. Product name match
    var matchedProduct = null;
    for (var word in PRODUCT_MAP) {
      if (lower.indexOf(word) !== -1) { matchedProduct = PRODUCT_MAP[word]; break; }
    }
    if (matchedProduct) { showProductDetail(matchedProduct); return; }

    // 2. Intent patterns
    for (var i = 0; i < INTENTS.length; i++) {
      if (INTENTS[i].rx.test(lower)) { INTENTS[i].fn(); return; }
    }

    // 3. Fallback
    botSay("I'm not sure about that, but I can help with:", 500, function () {
      showMainMenu();
    });
  }

  // ============================================================
  //  ADDITIONAL INFO FLOWS
  // ============================================================
  function showPayment() {
    var html = "<strong>Payment Terms We Offer</strong><br><br>" + KB.payment.join("<br>");
    botSay(html, 600, function () {
      showQR([
        { label: "💰 Get a Quote", action: startLeadCapture },
        { label: "🔙 Main Menu",   action: function () { showMainMenu(); } },
      ]);
    });
  }

  function showIncoterms() {
    var html = "<strong>Incoterms Available</strong><br><br>" + KB.incoterms.join("<br>");
    botSay(html, 600, function () {
      showQR([
        { label: "💰 Get a Quote", action: startLeadCapture },
        { label: "🔙 Main Menu",   action: function () { showMainMenu(); } },
      ]);
    });
  }

  function showCustomBlend() {
    botSay("✅ <strong>Yes!</strong> We offer custom spice blends and private-label packaging.<br><br>" +
      "• Minimum quantity: 1 MT per blend<br>" +
      "• Custom grind size, mix ratio, label design<br>" +
      "• NDA available for proprietary formulations<br><br>" +
      "Share your requirements and we'll send a proposal.", 700, function () {
      showQR([
        { label: "💰 Share Requirements", action: startLeadCapture },
        { label: "🔙 Main Menu",          action: function () { showMainMenu(); } },
      ]);
    });
  }

  function showAbout() {
    var html =
      "🌿 <strong>About Mile Overseas</strong><br><br>" +
      KB.company.founded + "<br><br>" +
      "<strong>Why buyers choose us:</strong><br>" +
      KB.company.usp.map(function (u) { return "✅ " + u; }).join("<br>");
    botSay(html, 600, function () {
      showQR([
        { label: "🌿 View Products",     action: flowProducts },
        { label: "💰 Get a Quote",       action: startLeadCapture },
        { label: "📜 Certifications",    action: flowCerts },
        { label: "🔙 Main Menu",         action: function () { showMainMenu(); } },
      ]);
    });
  }

  // ============================================================
  //  EVENT HANDLERS
  // ============================================================
  var isOpen = false;

  toggle.addEventListener("click", function () {
    isOpen = !isOpen;
    box.classList.toggle("cb-hidden", !isOpen);
    unreadBadge.style.display = "none";
    if (isOpen) {
      input.focus();
      if (!messagesEl.childElementCount) {
        // First open — welcome message
        setTimeout(function () {
          addBotMsg("👋 Welcome to <strong>Mile Overseas</strong>! We're India's premium spice exporter.<br><br>I can help you with products, MOQ, shipping, certifications, pricing & samples.");
          setTimeout(function () { showMainMenu(); }, 800);
        }, 300);
      }
      if (window.gtag) window.gtag("event", "chat_open");
    }
  });

  closeBtn.addEventListener("click", function () {
    isOpen = false;
    box.classList.add("cb-hidden");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var val = input.value.trim();
    if (!val) return;
    addUserMsg(val);
    input.value = "";
    clearQR();

    if (state.leading) {
      // Inside lead capture flow
      setTimeout(function () { handleLeadInput(val); }, 200);
    } else {
      // Free text — keyword matching
      setTimeout(function () { handleFreeText(val); }, 200);
    }

    if (window.gtag) window.gtag("event", "chat_user_message");
  });

  // Show unread badge after 4 seconds if not opened yet
  setTimeout(function () {
    if (!isOpen) {
      unreadBadge.style.display = "flex";
    }
  }, 4000);

})();
