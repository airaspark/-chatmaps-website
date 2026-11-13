export interface PageMetadata {
  title: string;
  description: string;
  indexable: boolean;
}

export const HOME_METADATA: PageMetadata = {
  title: 'ChatMaps | Discover Authentic Street Food Near You',
  description: 'Discover approved street-food stalls near you with live locations, menus, opening hours, directions, and community reviews.',
  indexable: true,
};

const PUBLIC_PAGES: Record<string, PageMetadata> = {
  '/': HOME_METADATA,
  '/explore': {
    title: 'Explore Street Food Near You | ChatMaps',
    description: 'Explore approved street-food stalls, browse cuisines, menus, ratings, and find local favourites with ChatMaps.',
    indexable: true,
  },
  '/live-map': {
    title: 'Live Street Food Map | ChatMaps',
    description: 'Find approved street-food vendors sharing their live location on the ChatMaps map.',
    indexable: true,
  },
  '/about': {
    title: 'About ChatMaps | Local Street Food Discovery',
    description: 'Learn how ChatMaps helps people discover local street food and helps vendors share when they are open.',
    indexable: true,
  },
  '/contact': {
    title: 'Contact ChatMaps',
    description: 'Contact the ChatMaps team for customer, vendor, privacy, and platform support.',
    indexable: true,
  },
  '/privacy-policy': {
    title: 'Privacy Policy | ChatMaps',
    description: 'Read how ChatMaps handles account, location, and platform information.',
    indexable: true,
  },
  '/terms-conditions': {
    title: 'Terms and Conditions | ChatMaps',
    description: 'Read the terms and conditions for using ChatMaps street-food discovery services.',
    indexable: true,
  },
};

const PRIVATE_METADATA: PageMetadata = {
  title: 'ChatMaps',
  description: 'ChatMaps street-food discovery.',
  indexable: false,
};

export const getRouteMetadata = (pathname: string): PageMetadata => {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return PUBLIC_PAGES[normalizedPath] ?? PRIVATE_METADATA;
};

const ensureMeta = (name: string, value: string, property = false): void => {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    if (property) element.setAttribute('property', name);
    else element.name = name;
    document.head.appendChild(element);
  }
  element.content = value;
};

export const applyPageMetadata = (pathname: string, metadata = getRouteMetadata(pathname)): void => {
  const canonicalUrl = `https://chatmaps.in${pathname === '/' ? '/' : pathname.replace(/\/+$/, '')}`;
  document.title = metadata.title;
  ensureMeta('description', metadata.description);
  ensureMeta('robots', metadata.indexable ? 'index,follow,max-image-preview:large' : 'noindex,nofollow');
  ensureMeta('og:title', metadata.title, true);
  ensureMeta('og:description', metadata.description, true);
  ensureMeta('og:type', 'website', true);
  ensureMeta('og:url', canonicalUrl, true);
  ensureMeta('og:image', 'https://chatmaps.in/pwa-512x512.png', true);
  ensureMeta('twitter:card', 'summary_large_image');
  ensureMeta('twitter:title', metadata.title);
  ensureMeta('twitter:description', metadata.description);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
};
