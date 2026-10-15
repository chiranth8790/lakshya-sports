import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
}

export default function SEO({ 
  title = 'Lakshya Sports | Pro Badminton & Cricket Equipment',
  description = 'Shop pro badminton rackets, cricket bats, court shoes, and authentic gear at Lakshya Sports. Fast shipping and 100% genuine products.',
  image = '/og-image.jpg'
}: SEOProps) {
  useEffect(() => {
    // 1. Title
    document.title = title.includes('Lakshya Sports') ? title : `${title} | Lakshya Sports`;

    // 2. Meta description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Open Graph Tags
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property='${property}']`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:title', document.title);
    setOgTag('og:description', description);
    if (image) setOgTag('og:image', image);
    setOgTag('og:type', 'website');
  }, [title, description, image]);

  return null;
}
