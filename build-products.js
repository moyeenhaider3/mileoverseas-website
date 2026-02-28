#!/usr/bin/env node
/**
 * build-products.js
 * Generates 22 static product HTML pages from data.en.json + template.
 * Usage: node build-products.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname);
const DATA_FILE = path.join(ROOT, "js", "data.en.json");
const TEMPLATE_FILE = path.join(ROOT, "templates", "product-detail.html");
const OUTPUT_DIR = path.join(ROOT, "products");

// Read inputs
const products = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const template = fs.readFileSync(TEMPLATE_FILE, "utf8");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, "-") // parentheses → dash
    .replace(/[^a-z0-9]+/g, "-") // non-alphanum → dash
    .replace(/^-+|-+$/g, ""); // trim dashes
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderList(arr) {
  if (!Array.isArray(arr) || arr.length === 0)
    return "<li>No data available</li>";
  return arr
    .map((item) => `                          <li>${item}</li>`)
    .join("\n");
}

function buildProductSchema(product, slug) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://www.mileoverseas.com/products/${slug}.html#product`,
    name: product.name,
    image: [`https://www.mileoverseas.com/${product.image}`],
    description: product.description,
    category: product.category || "Spices",
    brand: {
      "@type": "Brand",
      name: "Mile Overseas",
    },
    manufacturer: {
      "@type": "Organization",
      "@id": "https://www.mileoverseas.com/#org",
      name: "Mile Overseas",
    },
    offers: {
      "@type": "Offer",
      url: `https://www.mileoverseas.com/products/${slug}.html`,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        "@id": "https://www.mileoverseas.com/#org",
        name: "Mile Overseas",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: "+91-8178070378",
          email: "moyeen@mileoverseas.com",
        },
      },
    },
    additionalProperty: [],
  };

  if (product.hs_code) {
    schema.additionalProperty.push({
      "@type": "PropertyValue",
      name: "HS Code",
      value: product.hs_code,
    });
  }
  if (product.harvest_season) {
    schema.additionalProperty.push({
      "@type": "PropertyValue",
      name: "Harvest Season",
      value: product.harvest_season,
    });
  }
  if (
    Array.isArray(product.container_capacity) &&
    product.container_capacity.length > 0
  ) {
    product.container_capacity.forEach((cap) => {
      schema.additionalProperty.push({
        "@type": "PropertyValue",
        name: "Container Capacity",
        value: cap,
      });
    });
  }

  if (schema.additionalProperty.length === 0) {
    delete schema.additionalProperty;
  }

  return JSON.stringify(schema, null, 2);
}

function buildFaqSchema(product) {
  const name = product.name;
  const load20 =
    (product.container_capacity && product.container_capacity[0]) || "varies";
  const load40 =
    (product.container_capacity && product.container_capacity[1]) || "varies";

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    publisher: {
      "@type": "Organization",
      "@id": "https://www.mileoverseas.com/#org",
    },
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I import ${name} from India?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Request a proforma invoice from Mile Overseas (sales contact: +91-8178070378 / moyeen@mileoverseas.com). Provide destination port, quantity (e.g. 20ft or 40ft container), and packaging preference. We issue documentation (Invoice, Packing List, Phytosanitary, Certificate of Origin) and arrange shipment.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the typical container load for ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Typical net load: ${load20}. For 40ft: ${load40} (approximate; final depends on packaging).`,
        },
      },
      {
        "@type": "Question",
        name: `Do you provide quality and certification reports for ${name} exports?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Lab analysis, moisture, purity, and required GCC-compliant certification are provided. Third-party (SGS) inspection available on request.`,
        },
      },
      {
        "@type": "Question",
        name: `Who is the contact for bulk ${name} export pricing?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Speak with Moyeen (Export Sales Representative) at +91-8178070378 or email moyeen@mileoverseas.com for CIF / FOB pricing and lead times.`,
        },
      },
    ],
  };

  return JSON.stringify(schema, null, 2);
}

function buildCertificationsHtml(qa) {
  if (!Array.isArray(qa) || qa.length === 0) return "";
  return qa
    .filter((c) => /certified|certification|compliance|lab testing/i.test(c))
    .slice(0, 4)
    .map((cert) => {
      const short = cert.length > 60 ? cert.substring(0, 57) + "..." : cert;
      return `<span class="cert-chip">${short}</span>`;
    })
    .join(" ");
}

function buildMetaDescription(product) {
  const name = product.name;
  const cap = product.container_capacity ? product.container_capacity[0] : "";
  const capText = cap ? ` ${cap}.` : "";
  return `Export quality ${name} from India.${capText} Bulk supply with lab testing & certifications. Ship to UAE, Saudi Arabia, GCC. Get a free quote from Mile Overseas.`;
}

function buildTitle(product) {
  return `Import ${product.name} from India | Bulk ${product.name} Supplier — Mile Overseas`;
}

// Generate pages
let generated = 0;
products.forEach((product) => {
  const slug = slugify(product.name);
  const title = buildTitle(product);
  const metaDesc = buildMetaDescription(product);
  const nameEncoded = encodeURIComponent(product.name);
  const whatsappText = encodeURIComponent(
    `Hi, I'm interested in importing ${product.name} from India. Please share pricing and availability.`,
  );

  const harvestBadge = product.harvest_season
    ? `<div class="scarcity-badge harvest-badge">Harvested: ${product.harvest_season}</div>`
    : "";

  const hsCodeBadge = product.hs_code
    ? `<div class="scarcity-badge harvest-badge">HS Code: ${product.hs_code}</div>`
    : "";

  let html = template
    .replace(/\{\{PRODUCT_TITLE\}\}/g, escapeHtml(title))
    .replace(/\{\{PRODUCT_META_DESC\}\}/g, escapeHtml(metaDesc))
    .replace(/\{\{PRODUCT_SLUG\}\}/g, slug)
    .replace(/\{\{PRODUCT_NAME\}\}/g, escapeHtml(product.name))
    .replace(/\{\{PRODUCT_NAME_ENCODED\}\}/g, nameEncoded)
    .replace(/\{\{PRODUCT_IMAGE\}\}/g, product.image || "")
    .replace(
      /\{\{PRODUCT_CATEGORY\}\}/g,
      escapeHtml(product.category || "Spices"),
    )
    .replace(
      /\{\{PRODUCT_DESCRIPTION\}\}/g,
      escapeHtml(product.description || ""),
    )
    .replace(/\{\{WHATSAPP_TEXT\}\}/g, whatsappText)
    .replace(/\{\{HARVEST_BADGE\}\}/g, harvestBadge)
    .replace(/\{\{HS_CODE_BADGE\}\}/g, hsCodeBadge)
    .replace(
      /\{\{CERTIFICATIONS_HTML\}\}/g,
      buildCertificationsHtml(product.quality_assurance),
    )
    .replace(/\{\{PRODUCT_SPECS\}\}/g, renderList(product.specifications))
    .replace(/\{\{PRODUCT_QA\}\}/g, renderList(product.quality_assurance))
    .replace(/\{\{PRODUCT_FEATURES\}\}/g, renderList(product.features))
    .replace(/\{\{PRODUCT_VARIETIES\}\}/g, renderList(product.variety))
    .replace(
      /\{\{PRODUCT_QUALITY_OPTIONS\}\}/g,
      renderList(product.quality_options),
    )
    .replace(
      /\{\{PRODUCT_CONTAINERS\}\}/g,
      renderList(product.container_capacity),
    )
    .replace(/\{\{PRODUCT_SCHEMA\}\}/g, buildProductSchema(product, slug))
    .replace(/\{\{FAQ_SCHEMA\}\}/g, buildFaqSchema(product));

  const outPath = path.join(OUTPUT_DIR, `${slug}.html`);
  fs.writeFileSync(outPath, html, "utf8");
  console.log(`✓ Generated: products/${slug}.html`);
  generated++;
});

console.log(`\nDone! Generated ${generated} product pages in products/`);
