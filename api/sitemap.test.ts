import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import test from 'node:test';
import sitemapHandler, { renderSitemap } from './sitemap.ts';
import publicVendorHandler from './public-vendor/[id].ts';

const vendorDocument = (
  id: string,
  status: string,
  isOnline: boolean,
  locationAvailable: boolean,
  lat = 12.3,
  lng = 76.6,
  accuracy = 20,
): { name: string; fields: Record<string, unknown> } => ({
  name: `projects/chatmaps/databases/(default)/documents/vendors/${id}`,
  fields: {
    status: { stringValue: status },
    isOnline: { booleanValue: isOnline },
    availabilityStatus: { stringValue: isOnline ? 'online' : 'offline' },
    locationAvailable: { booleanValue: locationAvailable },
    location: { mapValue: { fields: { lat: { doubleValue: lat }, lng: { doubleValue: lng } } } },
    gpsAccuracy: { integerValue: String(accuracy) },
  },
});

test('sitemap includes canonical routes and all approved vendors regardless of online status', () => {
  const xml = renderSitemap([
    vendorDocument('approved-online', 'approved', true, true),
    vendorDocument('offline', 'approved', false, false),
    vendorDocument('pending', 'pending', true, true),
    vendorDocument('rejected', 'rejected', false, false),
    vendorDocument('suspended', 'suspended', false, false),
  ]);

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /https:\/\/chatmaps\.in\/explore/);
  assert.match(xml, /https:\/\/chatmaps\.in\/vendor\/approved-online/);
  assert.match(xml, /https:\/\/chatmaps\.in\/vendor\/offline/);
  assert.doesNotMatch(xml, /https:\/\/chatmaps\.in\/vendor\/(pending|rejected|suspended)/);
  assert.doesNotMatch(xml, /https:\/\/www\.chatmaps\.in|<loc>[^<]*\?/);
});

const serviceAccountConfig = () => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  return JSON.stringify({
    project_id: 'chatmaps-test',
    client_email: 'sitemap-reader@chatmaps-test.iam.gserviceaccount.com',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  });
};

const mockFirebaseRequests = (vendors: ReturnType<typeof vendorDocument>[]) => {
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url === 'https://oauth2.googleapis.com/token') {
      return new Response(JSON.stringify({ access_token: 'server-test-token', expires_in: 3600 }), { status: 200 });
    }
    assert.match(url, /firestore\.googleapis\.com\/v1\/projects\/chatmaps-test\/databases\/\(default\)\/documents/);
    const vendorId = url.match(/\/vendors\/([^/?]+)$/)?.[1];
    if (vendorId) {
      const vendor = vendors.find((item) => item.name.endsWith(`/${vendorId}`));
      return vendor
        ? new Response(JSON.stringify(vendor), { status: 200, headers: { 'Content-Type': 'application/json' } })
        : new Response('{}', { status: 404 });
    }
    return new Response(JSON.stringify({ documents: vendors }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
};

test('sitemap endpoint returns valid XML 200 and reads approved records with server credentials', async () => {
  const originalFetch = globalThis.fetch;
  const originalServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON = serviceAccountConfig();
  mockFirebaseRequests([
    vendorDocument('offline-vendor', 'approved', false, false),
    vendorDocument('pending-vendor', 'pending', false, false),
    vendorDocument('rejected-vendor', 'rejected', false, false),
    vendorDocument('suspended-vendor', 'suspended', false, false),
  ]);

  const headers: Record<string, string> = {};
  let statusCode = 0;
  let body = '';
  const response = {
    status(code: number) { statusCode = code; return this; },
    setHeader(name: string, value: string) { headers[name] = value; },
    send(content: string) { body = content; },
  };

  try {
    await sitemapHandler({ method: 'GET' }, response);
    assert.equal(statusCode, 200);
    assert.match(headers['Content-Type'], /application\/xml/);
    assert.match(headers['Cache-Control'], /s-maxage=300/);
    assert.match(body, /https:\/\/chatmaps\.in\/vendor\/offline-vendor/);
    assert.doesNotMatch(body, /https:\/\/chatmaps\.in\/vendor\/(pending|rejected|suspended)-vendor/);
    assert.doesNotMatch(body, /ownerEmail|server-test-token/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalServiceAccount === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    else process.env.FIREBASE_SERVICE_ACCOUNT_JSON = originalServiceAccount;
  }
});

test('public detail endpoint exposes approved offline profile fields without private ownership data', async () => {
  const originalFetch = globalThis.fetch;
  const originalServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON = serviceAccountConfig();
  mockFirebaseRequests([{
    ...vendorDocument('offline-vendor', 'approved', false, false),
    fields: {
      ...vendorDocument('offline-vendor', 'approved', false, false).fields,
      ownerUid: { stringValue: 'private-owner-uid' },
      ownerEmail: { stringValue: 'private@example.com' },
      statusHistory: { arrayValue: { values: [] } },
      shopName: { stringValue: 'Public Stall Name' },
    },
  }]);

  let statusCode = 0;
  let body: Record<string, unknown> = {};
  const response = {
    status(code: number) { statusCode = code; return this; },
    setHeader() {},
    json(value: unknown) { body = value as Record<string, unknown>; },
    send() {},
  };

  try {
    await publicVendorHandler({ method: 'GET', query: { id: 'offline-vendor' } }, response);
    assert.equal(statusCode, 200);
    assert.equal(body.shopName, 'Public Stall Name');
    assert.equal(body.isOnline, false);
    assert.equal(body.location, undefined);
    assert.equal(body.ownerUid, undefined);
    assert.equal(body.ownerEmail, undefined);
    assert.equal(body.statusHistory, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalServiceAccount === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    else process.env.FIREBASE_SERVICE_ACCOUNT_JSON = originalServiceAccount;
  }
});
