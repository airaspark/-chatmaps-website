// Food Image Management System for ChatMaps
// Strictly realistic, high-resolution authentic Indian street food photography

export interface FoodCategoryItem {
  id: string;
  name: string;
  image: string;
  alt: string;
  categoryKey: string;
  description: string;
}

export const CRAVING_CATEGORIES: FoodCategoryItem[] = [
  {
    id: 'pani-puri',
    name: 'Pani Puri',
    image: '/images/foods/pani-puri.jpg',
    alt: 'Crispy Pani Puri with spiced potato stuffing, mint teekha pani and sweet tamarind chutney',
    categoryKey: 'chaat',
    description: 'Round golden crispy hollow puris stuffed with spiced potatoes and chickpeas, served with refreshing mint-coriander water.'
  },
  {
    id: 'chats',
    name: 'Chats',
    image: '/images/foods/chats.jpg',
    alt: 'Indian street Sev Puri Chaat loaded with sev, onions, chutneys, and pomegranate',
    categoryKey: 'chaat',
    description: 'Crisp flat puris topped with seasoned diced potatoes, chopped onions, tomatoes, golden sev, and tangy chutneys.'
  },
  {
    id: 'gobi',
    name: 'Gobi',
    image: '/images/foods/gobi-manchurian.jpg',
    alt: 'Crispy Gobi Manchurian cauliflower tossed in Indo-Chinese spicy dark-red sauce and spring onions',
    categoryKey: 'indo-chinese',
    description: 'Golden fried cauliflower florets tossed in a glossy, spicy Indo-Chinese chilli-garlic sauce with spring onions.'
  },
  {
    id: 'momos',
    name: 'Momos',
    image: '/images/foods/momos.jpg',
    alt: 'Steamed Tibetan street momos in bamboo steamer with red chilli chutney',
    categoryKey: 'momos',
    description: 'Freshly steamed delicate dumplings in a bamboo steamer, served with fiery red chilli garlic dip.'
  },
  {
    id: 'samosa',
    name: 'Samosa',
    image: '/images/foods/samosa.jpg',
    alt: 'Golden crispy triangular potato samosas with green mint chutney',
    categoryKey: 'snacks',
    description: 'Flaky, golden-fried triangular pastry stuffed with aromatic spiced potatoes and green peas.'
  },
  {
    id: 'dosa',
    name: 'Dosa',
    image: '/images/foods/dosa.jpg',
    alt: 'Crispy golden South Indian Mysore Masala Dosa with coconut chutney and sambar',
    categoryKey: 'south-indian',
    description: 'Crispy golden rice-lentil crepe smeared with spicy red chutney, stuffed with potato saagu and served with coconut chutney.'
  },
  {
    id: 'idli',
    name: 'Idli',
    image: '/images/foods/idli.jpg',
    alt: 'Steamed soft white idlis on banana leaf with fresh coconut chutney and sambar',
    categoryKey: 'south-indian',
    description: 'Soft, fluffy, pillowy steamed rice cakes served hot with tempered coconut chutney and vegetable sambar.'
  },
  {
    id: 'vada',
    name: 'Vada',
    image: '/images/foods/medu-vada.jpg',
    alt: 'Golden crispy South Indian Medu Vada lentil donuts with sambar',
    categoryKey: 'south-indian',
    description: 'Crispy, golden-brown lentil doughnuts with a crunchy exterior and soft, airy interior.'
  },
  {
    id: 'pav-bhaji',
    name: 'Pav Bhaji',
    image: '/images/foods/pav-bhaji.jpg',
    alt: 'Mumbai street style Pav Bhaji with buttered pav and rich spiced bhaji',
    categoryKey: 'mumbai-special',
    description: 'Mashed spiced mixed vegetable gravy topped with a melting cube of Amul butter, served with soft butter-toasted pav.'
  },
  {
    id: 'bhel-puri',
    name: 'Bhel Puri',
    image: '/images/foods/bhel-puri.jpg',
    alt: 'Crunchy Indian Bhel Puri with puffed rice, sev, crushed papdi, and chutneys',
    categoryKey: 'chaat',
    description: 'Crunchy snack of puffed rice, fine sev, roasted peanuts, diced onions, tomatoes, and sweet-spicy chutneys.'
  }
];

// Clean placeholder SVG data URI for stalls without an uploaded photo
export const STALL_PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23292524"/><rect x="180" y="90" width="240" height="180" rx="20" fill="%23ea580c" opacity="0.2"/><path d="M220 180 L260 140 L340 220 L380 180 L420 220 L220 220 Z" fill="%23ea580c" opacity="0.6"/><circle cx="260" cy="140" r="16" fill="%23f97316"/><text x="300" y="270" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23ffffff" text-anchor="middle">ChatMaps Verified Stall</text><text x="300" y="300" font-family="sans-serif" font-size="14" fill="%23a8a29e" text-anchor="middle">Authentic Street Food Artisan</text></svg>';

// Helper to get safe vendor cover photo
export function getVendorCoverImage(vendor?: { coverImageUrl?: string; bannerImage?: string; photos?: string[] } | null): string {
  if (!vendor) return STALL_PLACEHOLDER_IMAGE;
  if (vendor.coverImageUrl && vendor.coverImageUrl.trim() !== '') return vendor.coverImageUrl;
  if (vendor.bannerImage && vendor.bannerImage.trim() !== '') return vendor.bannerImage;
  if (vendor.photos && vendor.photos.length > 0 && vendor.photos[0].trim() !== '') return vendor.photos[0];
  return STALL_PLACEHOLDER_IMAGE;
}
