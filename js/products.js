// products.js
// This module loads and renders products from data.en.json (Google Translate handles localization).

let productsData = [];

// Fetch and cache the product data (always English — Google Translate handles translation)
async function loadProductsData() {
  try {
    const response = await fetch("js/data.en.json");
    const data = await response.json();
    productsData = Array.isArray(data) ? data : [];
    return productsData;
  } catch (error) {
    console.error("Error loading product data:", error);
    return [];
  }
}

// --- Flat Product List Rendering ---
function slugifyProductName(name) {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderProductsList(
  products,
  containerId = "products-list",
  searchTerm = "",
) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  if (!Array.isArray(products) || products.length === 0) {
    container.innerHTML = '<p class="no-results">No products available</p>';
    return;
  }
  const grid = document.createElement("div");
  grid.className = "product-list-dynamic-area";
  products.forEach((product, idx) => {
    // Defensive: skip if product is not an object or missing name
    if (!product || typeof product !== "object" || !product.name) return;
    // Search filter (case-insensitive, matches name or description)
    if (
      searchTerm &&
      !(
        (product.name && product.name.toLowerCase().includes(searchTerm)) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm))
      )
    )
      return;
    const productDiv = document.createElement("div");
    productDiv.className = "product-card fade-in";
    productDiv.setAttribute("data-full-image", product.image);
    productDiv.style.transitionDelay = idx * 60 + "ms";
    let imageHtml = "";
    if (
      product.image &&
      product.image.trim() &&
      product.image.trim().toLowerCase() !== "none"
    ) {
      const webp = product.image.replace(/\.[a-z]+$/, ".webp");
      imageHtml = `
                <picture>
                    <source type="image/webp" srcset="${webp}">
                    <source type="image/jpeg" srcset="${product.image}">
                    <img
                        class="lazy product-image"
                        src="${product.image}"
                        data-src="${product.image}"
                        alt="${product.name}"
                        data-hero-image
                        data-product-id="${product.id}"
                        loading="lazy"
                        onload="this.classList.add('loaded'); this.closest('picture') && this.closest('picture').classList.add('loaded');"
                        onerror="this.style.display='none';const card=this.closest('.product-card');if(card){const ph=card.querySelector('.product-image-placeholder');if(ph)ph.style.display='flex';}"
                    />
                </picture>`;
    }
    productDiv.innerHTML = `
            <a href="products/${slugifyProductName(product.name)}.html" class="product-link" data-product-id="${product.id}">
                <div class="product-image-placeholder" style="display:${imageHtml ? "none" : "flex"}">
                    <span class="product-image-name">${product.name}</span>
                </div>
                ${imageHtml}
                <h3>${product.name}</h3>
                <p class="product-category">${product.category || ""}</p>
                <p class="product-description">${product.description || ""}</p>
            </a>
            <a href="contact.html?product=${encodeURIComponent(product.name)}" class="product-quote-btn">
                <i class="fas fa-file-invoice"></i> Request Quote
            </a>
        `;
    // --- HERO ANIMATION LOGIC ---
    // Add click event for hero animation if image exists
    const link = productDiv.querySelector(".product-link");
    const img = productDiv.querySelector(".product-image");
    if (link && img) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        // Get bounding rect
        const rect = img.getBoundingClientRect();
        // Store info for hero animation
        sessionStorage.setItem("heroProductId", product.id);
        sessionStorage.setItem(
          "heroImageRect",
          JSON.stringify({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            src: img.src,
          }),
        );
        // Animate clone
        const clone = img.cloneNode();
        clone.classList.add("hero-clone");
        clone.style.position = "fixed";
        clone.style.top = rect.top + "px";
        clone.style.left = rect.left + "px";
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
        clone.style.zIndex = 9999;
        clone.style.transition = "all 0.6s cubic-bezier(0.4,0,0.2,1)";
        document.body.appendChild(clone);
        // Go to detail page after short delay
        setTimeout(() => {
          window.location.href = link.href;
        }, 80);
      });
    }
    grid.appendChild(productDiv);
  });
  container.appendChild(grid);
  // Force show images: add 'loaded' class to all product images
  grid
    .querySelectorAll(".product-image")
    .forEach((img) => img.classList.add("loaded"));
  if (!grid.childElementCount) {
    container.innerHTML = '<p class="no-results">No products found</p>';
  }
}

// --- Search Field Logic ---
function setupProductSearch(
  products,
  inputId = "productSearch",
  containerId = "products-list",
) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener("input", () => {
    renderProductsList(products, containerId, input.value.trim().toLowerCase());
  });
  // Remove custom clear button (cross)
  const clearBtn = input.parentNode.querySelector(".clear-search");
  if (clearBtn) clearBtn.remove();
}

// --- Custom Spice Solutions Section ---
function renderCustomSpiceSection(containerId = "custom-spice-form") {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
        <div class="custom-spice-section-content">
            <h2>Looking for a Custom Spice Blend?</h2>
            <p>Can't find a specific spice or need a custom blend? We work with importers worldwide to provide tailored spice solutions. Tell us your requirements, and our team will prepare a personalized quote.</p>
            <p>We offer flexible packaging, private labeling, and custom formulations to meet your exact needs.</p>
            <a href="contact.html" class="custom-spice-inquire-btn">Inquire Now</a>
        </div>
    `;
  container
    .querySelector(".custom-spice-inquire-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "contact.html";
    });
}

document.addEventListener("DOMContentLoaded", function () {
  renderCustomSpiceSection("custom-spice-form");
});

// --- Main Page Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("products-list");
  if (container)
    container.innerHTML = '<p class="loading">Loading products...</p>';
  const productsData = await loadProductsData();
  renderProductsList(productsData);
  setupProductSearch(productsData, "productSearch", "products-list");
});

// Remove leftover hero clones on pageshow (e.g. when returning via bfcache)
window.addEventListener("pageshow", function () {
  document.querySelectorAll("img.hero-clone").forEach(function (clone) {
    clone.remove();
  });
});

window.renderCustomSpiceSection = renderCustomSpiceSection;
window.renderProductsList = renderProductsList;
window.setupProductSearch = setupProductSearch;
