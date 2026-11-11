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
