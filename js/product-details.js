// product-details.js
// Loads product detail data from data.json based on URL param 'id'

// === Enhanced Product Detail Dynamic Rendering ===
/**
 * Gets a localized string by key from the global translations
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text if key not found
 * @returns {string} - Localized text
 */
function t(key, fallback) {
  // Use the global localization manager if available
  if (window.localizationManager && typeof window.localizationManager.translate === 'function') {
    const translation = window.localizationManager.translate(key);
    return translation || fallback;
  }
  return fallback;
}

async function renderEnhancedProductDetail(product) {
  // Product Image
  const img = document.getElementById('product-image');
  img.src = product.image;
  img.alt = product.name; // Dynamic product name as alt text
  img.setAttribute('data-product-id', product.id); // For hero animation

  // Scarcity Badge
  const scarcityBadge = document.getElementById('scarcity-badge');
  if (scarcityBadge) {
    if (product.harvest_season) {
      // Only show the text prefix from translations, and append the dynamic harvest season
      scarcityBadge.textContent = `${t('scarcity_badge_harvested')} ${product.harvest_season}`;
    } else {
      scarcityBadge.textContent = t('scarcity_badge_default');
    }
  }

  // Add HS Code display if available
  if (scarcityBadge) {
    // Remove existing HS Code element if present
    const existingHs = document.getElementById('hs-code');
    if (existingHs) {
      existingHs.remove();
    }
    if (product.hs_code) {
      const hsCodeEl = document.createElement('div');
      hsCodeEl.id = 'hs-code';
      // Use same CSS classes as scarcityBadge
      hsCodeEl.className = scarcityBadge.className;
      hsCodeEl.textContent = `${t('hs_code', 'HS Code')}: ${product.hs_code}`;
      scarcityBadge.parentNode.insertBefore(hsCodeEl, scarcityBadge.nextSibling);
    }
  }

  // Category Chip
  document.getElementById('category-chip').textContent = product.category;

  // Product Name
  document.getElementById('product-name').textContent = product.name;
  // Dynamically update title and meta tags after setting product name
  updateProductMetaTags(product.name);

  // Certifications (top)
  // Handle quality_assurance which is now an array, not a string
  // const certs = Array.isArray(product.quality_assurance) 
  //   ? product.quality_assurance.map(c => c.trim()).filter(Boolean)
  //   : [];
    
  // document.getElementById('certifications').innerHTML = certs
  //   .map(cert => {
  //     if (/certified|certification|certificat/i.test(cert)) {
  //       return `<span class="cert-chip"><span class="cert-bold">${t('certified')}</span> ${cert.replace(/certified|certification|certificat/ig, '').trim()}</span>`;
  //     }
  //     return `<span class="cert-chip">${cert}</span>`;
  //   })
  //   .join('');

  // Certifications (bottom - in informative block)
  const certsBottom = document.getElementById('certifications-bottom');
  if (certsBottom) {
    certsBottom.innerHTML = certs
      .map(cert => {
        if (/certified|certification|certificat/i.test(cert)) {
          return `<span class="cert-chip"><span class="cert-bold">${t('certified')}</span> ${cert.replace(/certified|certification|certificat/ig, '').trim()}</span>`;
        }
        return `<span class="cert-chip">${cert}</span>`;
      })
      .join('');
  }

  // Description
  document.getElementById('product-description').textContent = product.description;

  // Features rendering - now at a different position in our layout
  if (Array.isArray(product.features) && product.features.length > 0) {
    let featuresBlock = document.getElementById('features-block');
    if (featuresBlock) {
      // Clear existing content if any
      featuresBlock.innerHTML = '';
      
      // Create heading
      const heading = document.createElement('div');
      heading.className = 'static-label bold-label';
      heading.textContent = t('features_label', 'Key Features');
      featuresBlock.appendChild(heading);
      
      // Create features list
      const featuresList = document.createElement('ul');
      featuresList.className = 'features-list';
      featuresList.innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
      featuresBlock.appendChild(featuresList);
    }
  } else {
    // Hide the block if no features
    const featuresBlock = document.getElementById('features-block');
    if (featuresBlock) {
      featuresBlock.style.display = 'none';
    }
  }

  // Render collapsible sections with proper handling for each data type
  // Handle specifications differently as they might have nested content
  if (Array.isArray(product.specifications) && product.specifications.length > 0) {
    const specsElement = document.getElementById('specs-list');
    if (specsElement) {
      // Check if specs has newline characters indicating it needs to be split
      if (typeof product.specifications[0] === 'string' && product.specifications[0].includes('\n')) {
        // Handle multiline specs in the first element
        specsElement.innerHTML = product.specifications[0]
          .split('\n')
          .map(spec => `<li>${spec.replace(/^- /, '')}</li>`)
          .join('');
      } else {
        // Handle single-line specs as a regular array
        specsElement.innerHTML = product.specifications
          .map(spec => `<li>${spec.replace(/^- /, '')}</li>`)
          .join('');
      }
    }
  }

  // Render all other lists with the same simple array format
  renderBulletList(product.quality_assurance, 'quality-assurance-list');
  renderBulletList(product.container_capacity, 'container-capacity-list');
  renderBulletList(product.variety, 'variety-list');
  renderBulletList(product.quality_options, 'quality-options-list');

  // Initialize collapsible panels
  initCollapsiblePanels();

  // WhatsApp Integration
  setupWhatsAppButton(product);
}

/**
 * Renders an array of items as a bullet list
 * @param {Array|string} items - Array of item strings to render or a string to split
 * @param {string} elementId - ID of the element to populate
 */
function renderBulletList(items, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  // Ensure items is treated as an array
  let itemsArray = [];
  
  if (items) {
    itemsArray = Array.isArray(items) ? items : [items.toString()];
  }

  if (itemsArray.length > 0) {
    element.innerHTML = itemsArray.map(item => `<li>${item}</li>`).join('');
  } else {
    // Use localizationManager for empty data message
    let msg = 'No data available';
    if (window.localizationManager && typeof window.localizationManager.translate === 'function') {
      msg = window.localizationManager.translate('no_data_available');
    }
    element.innerHTML = `<li>${msg}</li>`;
  }
}

/**
 * Initializes all collapsible panels
 */
function initCollapsiblePanels() {
  const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
  
  collapsibleHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      
      // Toggle the aria-expanded state
      this.setAttribute('aria-expanded', !expanded);
      
      // Toggle the aria-hidden attribute on the content
      const content = this.nextElementSibling;
      content.setAttribute('aria-hidden', expanded);
      
      // Optional: close other panels when opening one
      // if (!expanded) {
      //   collapsibleHeaders.forEach(otherHeader => {
      //     if (otherHeader !== this) {
      //       otherHeader.setAttribute('aria-expanded', 'false');
      //       otherHeader.nextElementSibling.setAttribute('aria-hidden', 'true');
      //     }
      //   });
      // }
    });
  });
}

/**
 * Set up WhatsApp button with product-specific message
 * @param {Object} product - The product data
 */
function setupWhatsAppButton(product) {
  const whatsappBtn = document.getElementById('whatsapp-btn');
  if (!whatsappBtn) return;
  
  // Format a professional inquiry message
  const phoneNumber = '918178070378'; // Indian number with country code (91)
  const productName = product.name || '';
  const productCategory = product.category || '';
  
  // Create a professional message with product details
  let message = `Hello, I'm interested in your ${productName}`;
  if (productCategory) {
    message += ` from the ${productCategory} category`;
  }
  message += `. Could you please provide more information about availability, pricing, and shipping options?`;
  
  // Create the WhatsApp URL
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  // Set the URL to the button
  whatsappBtn.href = whatsappUrl;
}

// --- Enquiry Button: Go to Contact Page ---
const enquiryBtn = document.getElementById('enquire-btn');
if (enquiryBtn) {
  enquiryBtn.onclick = function() {
    window.location.href = 'contact.html';
  };
}

// --- Render Similar Products Section ---
function renderSimilarProducts(currentProduct, allProducts) {
  const section = document.getElementById('similar-products-list');
  if (!section || !Array.isArray(allProducts)) return;
  
  // Filter similar: same category, not the same id
  // Only include products with valid categories to avoid the grouping bug mentioned in the memory
  const similar = allProducts.filter(p => 
    p && p.category && currentProduct && currentProduct.category && 
    p.category === currentProduct.category && 
    p.id !== currentProduct.id
  );
  
  section.innerHTML = similar.map(product => `
    <div class="similar-product-card">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-name">${product.name}</div>
      <div class="category">${product.category}</div>
      <button class="view-btn" onclick="window.location.href='product-details.html?id=${product.id}'">${t('view')}</button>
    </div>
  `).join('');
}

// --- HERO ANIMATION LOGIC ON DETAIL PAGE ---
document.addEventListener('DOMContentLoaded', function() {
  const heroProductId = sessionStorage.getItem('heroProductId');
  const heroImageRect = sessionStorage.getItem('heroImageRect');
  if (heroProductId && heroImageRect) {
    const detailImg = document.querySelector('.product-image[data-product-id="' + heroProductId + '"]');
    if (detailImg) {
      const rect = detailImg.getBoundingClientRect();
      const src = detailImg.src;
      const startRect = JSON.parse(heroImageRect);
      // Create clone at start position
      const clone = detailImg.cloneNode();
      clone.style.position = 'fixed';
      clone.style.top = startRect.top + 'px';
      clone.style.left = startRect.left + 'px';
      clone.style.width = startRect.width + 'px';
      clone.style.height = startRect.height + 'px';
      clone.style.zIndex = 9999;
      clone.style.transition = 'all 0.6s cubic-bezier(0.4,0,0.2,1)';
      clone.style.pointerEvents = 'none';
      document.body.appendChild(clone);
      // Force reflow
      void clone.offsetWidth;
      // Animate to final position
      clone.style.top = rect.top + 'px';
      clone.style.left = rect.left + 'px';
      clone.style.width = rect.width + 'px';
      clone.style.height = rect.height + 'px';
      // After animation, remove clone
      setTimeout(() => {
        clone.remove();
        sessionStorage.removeItem('heroProductId');
        sessionStorage.removeItem('heroImageRect');
      }, 650);
    }
  }

  // Get language from localStorage or document
  const lang = localStorage.getItem('language') || document.documentElement.lang || 'en';
  
  // First, apply localization to all elements with data-i18n attributes
  if (window.localizationManager) {
    window.localizationManager.applyLanguage(lang);
  }
  
  // Then load product details
  loadProductDetail(lang);
  setupMobileNavDrawer();
  
  // Set up language switcher
  setupLanguageSwitcher();

  // Initialize static collapsible panels
  initCollapsiblePanels();
  
  // Listen for language changes
  window.addEventListener('languageChanged', function() {
    const newLang = localStorage.getItem('language') || 'en';
    
    // First apply translations to all static text elements
    if (window.localizationManager) {
      window.localizationManager.applyLanguage(newLang);
    }
    
    // Then reload the product details for dynamic content
    loadProductDetail(newLang);
  });
});

// --- Patch: Call renderSimilarProducts after main render ---
async function loadProductDetail(lang = 'en') {
  // Set the document language attribute if it's not already set
  if (!document.documentElement.lang) {
    document.documentElement.lang = lang;
  }
  
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) return;
  
  try {
    const response = await fetch(`js/data.${lang}.json`);
    const data = await response.json();
    const products = Array.isArray(data) ? data : [];
    
    // Safety check for products array
    if (!Array.isArray(products)) {
      document.getElementById('product-detail-card').innerHTML = 
        `<p>${t('error_loading_product')}</p>`;
      return;
    }
    
    const product = products.find(p => p && p.id === productId);
    if (product) {
      await renderEnhancedProductDetail(product);
      renderSimilarProducts(product, products);
    }
    else {
      document.getElementById('product-detail-card').innerHTML = 
        `<p>${t('product_not_found')}</p>`;
    }
  } catch (e) {
    console.error('Error loading product details:', e);
    document.getElementById('product-detail-card').innerHTML = 
      `<p>${t('error_loading_product')}</p>`;
  }
}

// TODO: Ensure all labels are localized for additional languages (fr, ru, hi, etc.)

// --- Hamburger Menu & Mobile Nav Drawer Logic ---
function setupMobileNavDrawer() {
  const hamburger = document.getElementById('hamburger-icon');
  const drawer = document.getElementById('mobile-drawer');
  if (!hamburger || !drawer) return;
  hamburger.addEventListener('click', function() {
    drawer.classList.toggle('open');
    document.body.classList.toggle('drawer-open');
  });
  // Close drawer on link click (for SPA-like feel)
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      document.body.classList.remove('drawer-open');
    });
  });
  // Optional: close on outside click
  document.addEventListener('click', function(e) {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !hamburger.contains(e.target)) {
      drawer.classList.remove('open');
      document.body.classList.remove('drawer-open');
    }
  });
}

// --- Handle language switching ---
function setupLanguageSwitcher() {
  const languageDropdown = document.getElementById('language-dropdown');
  if (!languageDropdown) return;
  
  languageDropdown.querySelectorAll('a[data-lang]').forEach(link => {
    // Remove existing event listeners to prevent duplicates
    const newLink = link.cloneNode(true);
    link.parentNode.replaceChild(newLink, link);
    
    newLink.addEventListener('click', function(e) {
      e.preventDefault();
      const lang = this.getAttribute('data-lang');
      
      // Update localStorage and document language
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.body.classList.toggle('rtl', lang === 'ar');
      
      // Apply active class
      document.querySelectorAll('.language-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
      });
      
      // Fire the language changed event
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
      
      // If we have the global localization manager, use it
      if (window.localizationManager) {
        window.localizationManager.applyLanguage(lang);
      }
    });
  });
  
  // Also handle mobile drawer language options
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('.language-dropdown-content a[data-lang]').forEach(link => {
      // Remove existing event listeners to prevent duplicates
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      newLink.addEventListener('click', function(e) {
        e.preventDefault();
        const lang = this.getAttribute('data-lang');
        
        // Update localStorage and document language
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.body.classList.toggle('rtl', lang === 'ar');
        
        // Apply active class
        document.querySelectorAll('.language-option').forEach(opt => {
          opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
        });
        
        // Fire the language changed event
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        
        // If we have the global localization manager, use it
        if (window.localizationManager) {
          window.localizationManager.applyLanguage(lang);
        }
        
        // Close mobile drawer after selection
        mobileDrawer.classList.remove('open');
        document.body.classList.remove('drawer-open');
      });
    });
  }
}

// Dynamically update title and meta tags after setting product name
function updateProductMetaTags(productName) {
  document.title = productName + " Export from India | Bulk " + productName + " Supplier";
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `Export quality ${productName} from India. Bulk supply, certifications, global shipping. Trusted by international spice buyers. Get a quote for ${productName} export now!`);
  }
  var ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', `${productName} Export from India | Bulk ${productName} Supplier`);
  }
  var ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) {
    ogDesc.setAttribute('content', `Export quality ${productName} from India. Bulk supply, certifications, global shipping. Trusted by international spice buyers.`);
  }
}
