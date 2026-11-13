import { getVendorDocument, toPublicVendor } from '../_firebaseAdmin.ts';

interface VercelRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status: (statusCode: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
  send: (body: string) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  const id = req.query?.id;
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(id)) {
    res.status(400).send('Invalid vendor id.');
    return;
  }

  try {
    const document = await getVendorDocument(id);
    const vendor = document ? toPublicVendor(document, id) : null;
    if (!vendor) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(404).json({ error: 'Vendor not found.' });
      return;
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Public vendor detail request failed.', error);
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).json({ error: 'Vendor details are temporarily unavailable.' });
  }
}
