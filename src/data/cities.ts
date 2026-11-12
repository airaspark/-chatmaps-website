export const MANUAL_CITY_OPTIONS = [
  'Mysuru',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Jaipur',
  'Kolkata',
  'Hyderabad'
];

export const normalizeCityName = (value: string): string => {
  const normalized = value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const aliases: Record<string, string> = {
    bangalore: 'bengaluru',
    bengaluru: 'bengaluru',
    mysore: 'mysuru',
    mysuru: 'mysuru'
  };
  return aliases[normalized] || normalized;
};

/** Match a vendor's existing city/address text to the customer's selected city. */
export const vendorMatchesCity = (vendorCity: string | undefined, vendorAddress: string | undefined, selectedCity: string): boolean => {
  const target = normalizeCityName(selectedCity);
  if (!target) return false;
  const aliases: Record<string, string[]> = {
    bengaluru: ['bengaluru', 'bangalore'],
    mysuru: ['mysuru', 'mysore']
  };
  const terms = aliases[target] || [target];
  const normalizeSegment = (value: string) => normalizeCityName(value.replace(/\b\d{5,6}\b/g, '').replace(/[^\p{L}\p{N}\s-]/gu, ' ').trim());
  const citySegments = (vendorCity || '').split(/[,;|/]/).map(normalizeSegment).filter(Boolean);
  const addressSegments = (vendorAddress || '').split(/[,;|/]/).map(normalizeSegment).filter(Boolean);
  const cityFieldMatches = citySegments.some(segment => terms.some(term => {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escapedTerm}(?:\\s|$)`, 'i').test(segment);
  }));
  return cityFieldMatches || addressSegments.some(segment => terms.includes(segment));
};
