import { useEffect } from 'react';

/**
 * A page's title, description, canonical address and share preview (MVP 2, 5.7): what search engines, partners and
 * link previews read. The canonical address is always on goawaygo.com, so copies of the site (dev, test, pages.dev)
 * never compete with it. Pre-rendering (scripts/prerender.mjs) captures these tags into each public page's HTML.
 */
export const SITE_URL = 'https://goawaygo.com';

const SITE_NAME = 'GoAwayGo';

function setMeta(attribute: 'name' | 'property', key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

/**
 * @param title the page's own title ("Privacy Policy"); the site name is added
 * @param description one or two sentences about the page
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    const url = SITE_URL + window.location.pathname;
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setCanonical(url);
  }, [title, description]);
}
