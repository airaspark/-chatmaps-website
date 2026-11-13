import { createSign } from 'node:crypto';

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}

interface FirestoreDocument {
  name: string;
  fields?: Record<string, unknown>;
}

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
let cachedToken: { value: string; expiresAt: number } | null = null;

const base64Url = (value: string | Buffer): string => Buffer.from(value).toString('base64url');

const getServiceAccount = (): ServiceAccount => {
  const value = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!value) throw new Error('Missing server-only Firebase service account configuration.');
  let account: ServiceAccount;
  try {
    account = JSON.parse(value) as ServiceAccount;
  } catch {
    throw new Error('Firebase service account configuration is not valid JSON.');
  }
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error('Firebase service account configuration is incomplete.');
  }
  return account;
};

const getAccessToken = async (account: ServiceAccount): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: account.client_email,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: issuedAt,
    exp: issuedAt + 3600,
  }));
  const unsignedToken = `${header}.${claims}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const assertion = `${unsignedToken}.${signer.sign(account.private_key, 'base64url')}`;
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    console.error(`Firebase service account token request returned HTTP ${response.status}.`);
    throw new Error('Unable to authenticate the sitemap service.');
  }
  const result = await response.json() as { access_token?: string; expires_in?: number };
  if (!result.access_token) throw new Error('Firebase service account token response was incomplete.');
  cachedToken = {
    value: result.access_token,
    expiresAt: Date.now() + Math.max(60, result.expires_in ?? 3600) * 1000,
  };
  return result.access_token;
};

const authorizedFetch = async (url: string): Promise<Response> => {
  const account = getServiceAccount();
  const accessToken = await getAccessToken(account);
  return fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
};

const firestoreUrl = (projectId: string, resource: string): string =>
  `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${resource}`;

export const listApprovedVendorDocuments = async (): Promise<FirestoreDocument[]> => {
  const account = getServiceAccount();
  const docs: FirestoreDocument[] = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({ pageSize: '1000', 'mask.fieldPaths': 'status' });
    if (pageToken) params.set('pageToken', pageToken);
    const endpoint = `${firestoreUrl(account.project_id, 'vendors')}?${params.toString()}`;
    const response = await authorizedFetch(endpoint);
    if (!response.ok) {
      console.error(`Firebase vendor sitemap read returned HTTP ${response.status}.`);
      throw new Error('Unable to read approved public vendors.');
    }
    const result = await response.json() as { documents?: FirestoreDocument[]; nextPageToken?: string };
    docs.push(...(result.documents ?? []).filter((document) => {
      const status = (document.fields?.status as { stringValue?: string } | undefined)?.stringValue;
      return status === 'approved';
    }));
    pageToken = result.nextPageToken ?? '';
  } while (pageToken);

  return docs;
};

export const getVendorDocument = async (vendorId: string): Promise<FirestoreDocument | null> => {
  const account = getServiceAccount();
  const path = `vendors/${encodeURIComponent(vendorId)}`;
  const response = await authorizedFetch(firestoreUrl(account.project_id, path));
  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(`Firebase public vendor read returned HTTP ${response.status}.`);
    throw new Error('Unable to read the public vendor profile.');
  }
  return await response.json() as FirestoreDocument;
};

const decodeFirestoreValue = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Record<string, unknown>;
  if ('stringValue' in item) return item.stringValue;
  if ('booleanValue' in item) return item.booleanValue;
  if ('integerValue' in item) return Number(item.integerValue);
  if ('doubleValue' in item) return item.doubleValue;
  if ('timestampValue' in item) return item.timestampValue;
  if ('nullValue' in item) return null;
  if ('arrayValue' in item) {
    const values = (item.arrayValue as { values?: unknown[] } | undefined)?.values ?? [];
    return values.map(decodeFirestoreValue);
  }
  if ('mapValue' in item) {
    const fields = (item.mapValue as { fields?: Record<string, unknown> } | undefined)?.fields ?? {};
    return Object.fromEntries(Object.entries(fields).map(([key, fieldValue]) => [key, decodeFirestoreValue(fieldValue)]));
  }
  return undefined;
};

export const toPublicVendor = (document: FirestoreDocument, vendorId: string): Record<string, unknown> | null => {
  const fields = Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
  if (fields.status !== 'approved') return null;

  const publicFields = [
    'shopName', 'ownerName', 'description', 'category', 'subCategories', 'phone', 'whatsapp',
    'address', 'landmark', 'city', 'postalCode', 'location', 'isOnline', 'availabilityStatus',
    'locationAvailable', 'locationUpdatedAt', 'gpsAccuracy', 'lastLocationAt', 'bannerImage',
    'coverImageUrl', 'photos', 'menu', 'isOpen', 'openingHours', 'closingTime', 'status',
    'rating', 'reviewCount', 'priceRange', 'isPureVeg', 'viewsCount', 'createdAt', 'updatedAt',
  ];
  const vendor = Object.fromEntries(publicFields
    .filter((key) => fields[key] !== undefined)
    .map((key) => [key, fields[key]]));
  const isCurrentlyOnline = fields.isOnline === true &&
    (fields.availabilityStatus === undefined || fields.availabilityStatus === 'online') &&
    fields.locationAvailable === true;

  if (!isCurrentlyOnline) {
    vendor.isOnline = false;
    vendor.availabilityStatus = 'offline';
    vendor.locationAvailable = false;
    vendor.isOpen = false;
    delete vendor.location;
    delete vendor.locationUpdatedAt;
    delete vendor.gpsAccuracy;
    delete vendor.lastLocationAt;
  }

  return { ...vendor, id: vendorId };
};
