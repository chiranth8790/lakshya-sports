/**
 * Schema.org JSON-LD Structured Data Generators for Google Search Optimization
 */

export interface SchemaBreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// 1. Local Business Schema for Both Bangalore Stores
export function getStoreLocalBusinessSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "SportingGoodsStore",
      "@id": "https://lakshyashop.in/#flagship-store",
      "name": "Lakshya Sports – Flagship Pro Store Chikkalasandra",
      "alternateName": "Lakshya Sports Badminton & Cricket Store Bangalore",
      "image": "https://lakshyashop.in/website-logo.png",
      "url": "https://lakshyashop.in",
      "telephone": "+918050856366",
      "priceRange": "₹₹",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, Credit Card, Debit Card, UPI",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No. 72/4, Chikkalasandra Main Road, Sarvabhouma Nagar, Chikkalasandra, Near Shanishwara Temple",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560061",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 12.9126,
        "longitude": 77.5385
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "09:30",
          "closes": "21:30"
        }
      ],
      "department": [
        {
          "@type": "AutoRepair",
          "name": "Badminton Racket Custom Electronic Stringing Hub"
        }
      ],
      "makesOffer": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Badminton Racket Stringing & Gutting"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Cricket Bat Knocking & Oiling"
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "SportingGoodsStore",
      "@id": "https://lakshyashop.in/#pro-shop-jpnagar",
      "name": "Lakshya Sports – Pro Store JP Nagar 7th Phase",
      "image": "https://lakshyashop.in/website-logo.png",
      "url": "https://lakshyashop.in",
      "telephone": "+919740517527",
      "priceRange": "₹₹",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, Credit Card, Debit Card, UPI",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "12th Main Road, Jagruthi Colony, Puttenahalli, JP Nagar 7th Phase",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560078",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 12.8942,
        "longitude": 77.5855
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "09:30",
          "closes": "21:30"
        }
      ]
    }
  ];
}

// 2. Sitelinks Search Box WebSite Schema
export function getWebSiteSearchSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Lakshya Sports",
    "url": "https://lakshyashop.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://lakshyashop.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// 3. BreadcrumbList Schema for Rich Breadcrumb Snippets in Google
export function getBreadcrumbSchema(items: SchemaBreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// 4. FAQPage Schema for Google Expandable SERP Accordions
export function getFAQPageSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// 5. Product Schema for Google Shopping / Rich Product Snippets
export function getProductSchema(product: any, activePrice: number, isOutOfStock: boolean) {
  const images = product.images && product.images.length > 0
    ? product.images
    : product.image
    ? [product.image]
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": images,
    "description": product.description || `Buy ${product.name} online at best price in India from Lakshya Sports Bangalore. 100% genuine gear with custom stringing options.`,
    "sku": product.id || `LAKSHYA-${Date.now()}`,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Lakshya Sports"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": `https://lakshyashop.in/product/${product.id}`,
      "priceCurrency": "INR",
      "price": activePrice || product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Lakshya Sports"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "48",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}
