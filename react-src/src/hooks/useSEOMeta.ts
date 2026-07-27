import { useEffect } from 'react';
import { getToolSEO, generateJSONLDSchemas, DOMAIN } from '../lib/seoHelper';

export function useSEOMeta(toolId: string) {
  useEffect(() => {
    const meta = getToolSEO(toolId);

    // 1. Title Tag
    document.title = meta.title;

    // 2. Meta Description
    setOrCreateMetaTag('name', 'description', meta.metaDescription);

    // 3. Meta Keywords
    setOrCreateMetaTag('name', 'keywords', meta.keywords.join(', '));

    // 4. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', meta.canonicalUrl);

    // 5. OpenGraph Tags
    setOrCreateMetaTag('property', 'og:title', meta.ogTitle);
    setOrCreateMetaTag('property', 'og:description', meta.ogDescription);
    setOrCreateMetaTag('property', 'og:url', meta.ogUrl);
    setOrCreateMetaTag('property', 'og:type', 'website');

    // 6. Twitter Tags
    setOrCreateMetaTag('name', 'twitter:title', meta.ogTitle);
    setOrCreateMetaTag('name', 'twitter:description', meta.ogDescription);

    // 7. Dynamic JSON-LD Schema Script Tag Update
    let scriptTag = document.getElementById('dynamic-jsonld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'dynamic-jsonld-schema';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    const schemas = generateJSONLDSchemas(meta);
    scriptTag.textContent = JSON.stringify(schemas);
  }, [toolId]);
}

function setOrCreateMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}
