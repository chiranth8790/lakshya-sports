import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  type?: string;
  jsonLd?: object | object[];
}

export default function SEO({ 
  title = 'Lakshya Sports | Pro Badminton & Cricket Equipment Bengaluru',
  description = 'Official dealer for authentic Yonex badminton rackets, tournament shuttles, shoes, English willow cricket bats, and precision electronic stringing in Bangalore.',
  keywords = 'badminton rackets bangalore, buy badminton racket online, yonex badminton racket original, badminton stringing bangalore, chikkalasandra, jp nagar, cricket bats bangalore, lakshya sports',
  image = '/website-logo.png',
  canonical,
  type = 'website',
  jsonLd
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    const formattedTitle = title.includes('Lakshya Sports') ? title : `${title} | Lakshya Sports`;
    document.title = formattedTitle;

    // Helper to create or update meta tag
    const setMetaTag = (attributeName: 'name' | 'property', attributeValue: string, contentValue: string) => {
      let tag = document.querySelector(`meta[${attributeName}='${attributeValue}']`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attributeName, attributeValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', contentValue);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 3. Open Graph Tags (WhatsApp, Facebook, LinkedIn)
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:site_name', 'Lakshya Sports Bengaluru');
    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : `https://lakshyashop.in${image.startsWith('/') ? '' : '/'}${image}`;
      setMetaTag('property', 'og:image', fullImageUrl);
    }
    if (canonical) {
      setMetaTag('property', 'og:url', canonical);
    }

    // 4. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    if (image) {
      const fullImageUrl = image.startsWith('http') ? image : `https://lakshyashop.in${image.startsWith('/') ? '' : '/'}${image}`;
      setMetaTag('name', 'twitter:image', fullImageUrl);
    }

    // 5. Canonical Link
    let linkCanonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (canonical) {
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }

    // 6. JSON-LD Structured Data for Google Rich Results
    const scriptId = 'seo-structured-data';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (jsonLd) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(jsonLd);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up script on unmount
      const currentScript = document.getElementById(scriptId);
      if (currentScript) {
        currentScript.remove();
      }
    };
  }, [title, description, keywords, image, canonical, type, jsonLd]);

  return null;
}
