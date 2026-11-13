interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  status: (statusCode: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
}

import { listApprovedVendorDocuments } from './_firebaseAdmin.ts';

interface FirestoreDocument {
  name?: string;
  fields?: Record<string, unknown>;
}

const BASE_URL = 'https://chatmaps.in';
const STATIC_PATHS = [
  '/',
  '/explore',
  '/live-map',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-conditions',
];

const xmlEscape = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export const renderSitemap = (documents: FirestoreDocument[] = []): string => {
  const publicVendorPaths = documents
    .filter((document) => (document.fields?.status as { stringValue?: string } | undefined)?.stringValue === 'approved')
    .map((document) => document.name?.split('/').pop())
    .filter((id): id is string => Boolean(id) && /^[A-Za-z0-9_-]+$/.test(id!))
    .map((id) => `/vendor/${id}`);
  const uniquePaths = [...new Set([...STATIC_PATHS, ...publicVendorPaths])];
  const urls = uniquePaths.map((path) => `  <url><loc>${xmlEscape(`${BASE_URL}${path === '/' ? '/' : path}`)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const approvedVendors = await listApprovedVendorDocuments();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).send(req.method === 'HEAD' ? '' : renderSitemap(approvedVendors));
  } catch (error) {
    console.error('Sitemap generation failed.', error);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).send('Sitemap is temporarily unavailable.');
  }
}
