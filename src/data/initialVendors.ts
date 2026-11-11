import { Vendor, Review } from '../types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    ownerUid: 'owner-1',
    shopName: 'Shree Chaat Corner',
    ownerName: 'Suresh Kumar',
    description: 'Famous authentic street chaat corner serving crunchy Sev Puri, Aloo Tikki, Bhel Puri, and special Dahi Puri made fresh daily with spiced chutneys.',
    category: 'Chats & Chaat',
    subCategories: ['Sev Puri', 'Bhel Puri', 'Aloo Tikki', 'Dahi Puri'],
    phone: '+91 98450 12345',
    whatsapp: '+91 98450 12345',
    address: 'Sayyaji Rao Road, Near Devaraja Market',
    landmark: 'Opposite Town Hall Gate',
    city: 'Mysuru',
    postalCode: '570001',
    location: {
      lat: 12.3087,
      lng: 76.6531,
      address: 'Devaraja Market, Sayyaji Rao Rd, Mysuru'
    },
    coverImageUrl: '/images/stalls/shree-chaat-corner.jpg',
    bannerImage: '/images/stalls/shree-chaat-corner.jpg',
    photos: [
      '/images/stalls/shree-chaat-corner.jpg',
      '/images/foods/chats.jpg',
      '/images/foods/bhel-puri.jpg'
    ],
    menu: [
      { id: 'm1', name: 'Special Sev Puri', price: 50, isVeg: true, isPopular: true, description: 'Flat crispy puris loaded with potato, sev, three chutneys, and pomegranate' },
      { id: 'm2', name: 'Mysuru Masala Bhel Puri', price: 40, isVeg: true, isPopular: true, description: 'Crispy puffed rice with peanuts, sev, and tangy tamarind gravy' },
      { id: 'm3', name: 'Crunchy Aloo Tikki Chaat', price: 60, isVeg: true, isPopular: true, description: 'Hot griddled potato patty served in curd with spicy green and sweet chutneys' }
    ],
    isOpen: true,
    openingHours: '4:00 PM - 10:30 PM',
    status: 'approved',
    rating: 4.8,
    reviewCount: 384,
    priceRange: '₹',
    isPureVeg: true,
    viewsCount: 2450,
    favoritesCount: 312,
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-02-10T12:00:00Z'
  },
  {
    id: 'vendor-2',
    ownerUid: 'owner-2',
    shopName: 'Mysuru Pani Puri',
    ownerName: 'Manjunath Gowda',
    description: 'Crispy golden mineral water pani puris served with hot spiced yellow pea aloo masala, chilled spicy mint pudina water and sweet date chutney.',
    category: 'Pani Puri & Chaat',
    subCategories: ['Pani Puri', 'Masala Puri', 'Sev Puri'],
    phone: '+91 98201 54321',
    whatsapp: '+91 98201 54321',
    address: 'D. Devaraj Urs Road, Agrahara',
    landmark: 'Near Mysore Palace North Gate',
    city: 'Mysuru',
    postalCode: '570004',
    location: {
      lat: 12.3048,
      lng: 76.6502,
      address: 'D. Devaraj Urs Rd, Agrahara, Mysuru'
    },
    coverImageUrl: '/images/stalls/mysuru-pani-puri.jpg',
    bannerImage: '/images/stalls/mysuru-pani-puri.jpg',
    photos: [
      '/images/stalls/mysuru-pani-puri.jpg',
      '/images/foods/pani-puri.jpg',
      '/images/foods/explore-banner.jpg'
    ],
    menu: [
      { id: 'm4', name: 'Crispy Pani Puri (8 pcs)', price: 40, isVeg: true, isPopular: true, description: 'Round crispy puris filled with spiced potato-chickpeas and chilled mint water' },
      { id: 'm5', name: 'Mysuru Royal Masala Puri', price: 50, isVeg: true, isPopular: true, description: 'Crushed puris in bubbling hot yellow peas gravy topped with golden sev' },
      { id: 'm6', name: 'Sukha Puri with Sev', price: 30, isVeg: true, isPopular: false, description: 'Puris sprinkled with secret spice mix, chopped onions, and lemon' }
    ],
    isOpen: true,
    openingHours: '3:30 PM - 10:30 PM',
    status: 'approved',
    rating: 4.9,
    reviewCount: 520,
    priceRange: '₹',
    isPureVeg: true,
    viewsCount: 3200,
    favoritesCount: 489,
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-02-12T14:30:00Z'
  },
  {
    id: 'vendor-3',
    ownerUid: 'owner-3',
    shopName: 'Chandni Chowk Wale Natraj Dahi Bhalla',
    ownerName: 'Virendra Sharma',
    description: 'Iconic Delhi legacy stall serving melt-in-the-mouth urad dal bhallas in creamy beaten curd topped with heirloom saunth chutney since 1940.',
    category: 'Chaat & Snacks',
    subCategories: ['Dahi Bhalla', 'Aloo Tikki', 'Papdi Chaat'],
    phone: '+91 98110 99887',
    address: '1396, Main Road, Beside Chandni Chowk Metro Station Gate 5',
    landmark: 'Chandni Chowk Metro Station',
    city: 'Delhi',
    postalCode: '110006',
    location: {
      lat: 28.6562,
      lng: 77.2307,
      address: 'Chandni Chowk, Old Delhi'
    },
    bannerImage: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'
    ],
    menu: [
      { id: 'm8', name: 'Signature Dahi Bhalla Plate', price: 80, isVeg: true, isPopular: true, description: 'Soft fermented dumplings covered in spiced yogurt and homemade dried ginger chutney' },
      { id: 'm9', name: 'Crispy Kurkuri Aloo Tikki with Chole', price: 90, isVeg: true, isPopular: true, description: 'Shallow fried stuffed potato patties drenched in spicy Amritsari chole' }
    ],
    isOpen: true,
    openingHours: '11:00 AM - 9:30 PM',
    status: 'approved',
    rating: 4.9,
    reviewCount: 512,
    priceRange: '₹',
    isPureVeg: true,
    viewsCount: 3890,
    favoritesCount: 460,
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-02-14T11:00:00Z'
  },
  {
    id: 'vendor-4',
    ownerUid: 'owner-4',
    shopName: 'Tibetan Delight Steamed & Fried Momos',
    ownerName: 'Tenzing Norbu',
    description: 'Authentic Himalayan dumplings handcrafted with thin skins, juicy fillings, and fiery roasted red chili garlic chutney.',
    category: 'Momos & Chinese',
    subCategories: ['Steamed Momos', 'Kothey Momos', 'Jhol Momos', 'Thukpa'],
    phone: '+91 99002 33445',
    address: 'Near 12th Main Road, HAL 2nd Stage, Indiranagar',
    landmark: 'Behind Corner House',
    city: 'Bangalore',
    postalCode: '560038',
    location: {
      lat: 12.9719,
      lng: 77.6412,
      address: 'Indiranagar 100ft Road, Bangalore'
    },
    bannerImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80'
    ],
    menu: [
      { id: 'm10', name: 'Paneer Cheese Steamed Momos (8 pcs)', price: 120, isVeg: true, isPopular: true, description: 'Filled with finely grated paneer, cabbage, onions, and processed cheese' },
      { id: 'm11', name: 'Spicy Tibetan Veg Jhol Momos', price: 140, isVeg: true, isPopular: true, description: 'Served submerged in aromatic tomato sesame nutty broth' },
      { id: 'm12', name: 'Crispy Pan-Fried Kurkure Momos', price: 130, isVeg: true, isPopular: false, description: 'Crusted with crunchy flakes and deep fried golden' }
    ],
    isOpen: true,
    openingHours: '4:00 PM - 11:00 PM',
    status: 'approved',
    rating: 4.6,
    reviewCount: 289,
    priceRange: '₹₹',
    isPureVeg: false,
    viewsCount: 1840,
    favoritesCount: 215,
    createdAt: '2025-01-20T14:00:00Z',
    updatedAt: '2025-02-15T16:00:00Z'
  },
  {
    id: 'vendor-5',
    ownerUid: 'owner-5',
    shopName: 'Sardar Pav Bhaji Centre',
    ownerName: 'Manjit Singh',
    description: 'Mumbai legendary melting-butter Pav Bhaji cooked on giant cast iron tawas with crushed fresh vegetables and fragrant spice blend.',
    category: 'Pav Bhaji & Fast Food',
    subCategories: ['Butter Pav Bhaji', 'Cheese Pav Bhaji', 'Tawa Pulao'],
    phone: '+91 98200 44556',
    address: '166-A, Tardeo Road, Junction of Pandit Madan Mohan Malviya Marg',
    landmark: 'Tardeo Bus Depot',
    city: 'Mumbai',
    postalCode: '400034',
    location: {
      lat: 18.9712,
      lng: 72.8152,
      address: 'Tardeo, Mumbai'
    },
    bannerImage: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80'
    ],
    menu: [
      { id: 'm13', name: 'Amul Butter Loaded Pav Bhaji', price: 180, isVeg: true, isPopular: true, description: 'Thick spicy bhaji topped with a full slab of melting Amul butter, served with 2 soft butter toasted pavs' },
      { id: 'm14', name: 'Grated Mozzarella Cheese Pav Bhaji', price: 210, isVeg: true, isPopular: true, description: 'Topped generously with mozzarella and cheddar cheese' },
      { id: 'm15', name: 'Mumbai Masala Tawa Pulao', price: 160, isVeg: true, isPopular: false, description: 'Basmati rice sautéed on the tawa with vegetables and pav bhaji masala' }
    ],
    isOpen: false,
    openingHours: '12:00 PM - 2:00 AM',
    status: 'approved',
    rating: 4.8,
    reviewCount: 680,
    priceRange: '₹₹',
    isPureVeg: true,
    viewsCount: 4500,
    favoritesCount: 520,
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-02-16T18:00:00Z'
  },
  {
    id: 'vendor-6',
    ownerUid: 'owner-6',
    shopName: 'Sharmaji Masala Chai & Hot Samosas',
    ownerName: 'Ram Kishan Sharma',
    description: 'Fresh kulhad chai brewed with crushed ginger, green cardamom, and cloves, paired with steaming hot crunchy aloo samosas and kachoris.',
    category: 'Chai & Snacks',
    subCategories: ['Kulhad Chai', 'Samosa', 'Kachori', 'Jalebi'],
    phone: '+91 94140 88776',
    address: 'Near Hawa Mahal Badi Chaupar',
    landmark: 'Opposite Wind View Cafe',
    city: 'Jaipur',
    postalCode: '302002',
    location: {
      lat: 26.9239,
      lng: 75.8267,
      address: 'Badi Chaupar, Jaipur'
    },
    bannerImage: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80'
    ],
    menu: [
      { id: 'm16', name: 'Clay Pot Adrak Elaichi Chai', price: 25, isVeg: true, isPopular: true, description: 'Thick boiled milk tea served in an earthen clay pot' },
      { id: 'm17', name: 'Special Hing Dal Samosa (2 pcs)', price: 35, isVeg: true, isPopular: true, description: 'Flaky pastry stuffed with spiced potatoes and asafoetida roasted lentils' },
      { id: 'm18', name: 'Crispy Hot Kesar Jalebi (100g)', price: 60, isVeg: true, isPopular: true, description: 'Golden spirals soaked in pure saffron sugar syrup' }
    ],
    isOpen: true,
    openingHours: '6:30 AM - 10:00 PM',
    status: 'approved',
    rating: 4.9,
    reviewCount: 310,
    priceRange: '₹',
    isPureVeg: true,
    viewsCount: 2200,
    favoritesCount: 290,
    createdAt: '2025-01-12T07:00:00Z',
    updatedAt: '2025-02-15T09:00:00Z'
  },
  {
    id: 'vendor-pending-1',
    ownerUid: 'owner-pending',
    shopName: 'Kolkata Kathi Rolls Corner',
    ownerName: 'Subir Mukherjee',
    description: 'Authentic Kolkata paratha rolls wrapped with tender marinated fillings, sliced red onions, green chillies, and secret chaat masala.',
    category: 'Rolls & Shawarma',
    subCategories: ['Paneer Roll', 'Egg Roll', 'Kathi Roll'],
    phone: '+91 98300 11223',
    whatsapp: '+91 98300 11223',
    address: 'Park Street Cross, Near Metro Exit 2',
    landmark: 'Park Street Metro',
    city: 'Kolkata',
    postalCode: '700016',
    location: {
      lat: 22.5535,
      lng: 88.3524,
      address: 'Park Street, Kolkata'
    },
    bannerImage: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1200&q=80',
    photos: [
      'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80'
    ],
    menu: [
      { id: 'm19', name: 'Double Egg Paneer Kathi Roll', price: 110, isVeg: false, isPopular: true, description: 'Crispy layered lachha paratha layered with egg and spicy paneer tikka' },
      { id: 'm20', name: 'Veg Schezwan Roll', price: 80, isVeg: true, isPopular: false, description: 'Crunchy stir fry veggies tossed in homemade spicy schezwan sauce' }
    ],
    isOpen: true,
    openingHours: '1:00 PM - 11:30 PM',
    status: 'pending', // Pending vendor application for admin review
    rating: 4.5,
    reviewCount: 14,
    priceRange: '₹',
    isPureVeg: false,
    viewsCount: 120,
    favoritesCount: 8,
    createdAt: '2025-02-18T10:00:00Z',
    updatedAt: '2025-02-18T10:00:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    vendorId: 'vendor-1',
    userId: 'cust-1',
    userName: 'Priya Sharma',
    rating: 5,
    comment: 'The butter masala dosa is heavenly! Pure nostalgic VV Puram taste. Chutneys are super fresh and unlimited. Highly recommend the filter coffee at the end.',
    createdAt: '2025-02-10T14:22:00Z'
  },
  {
    id: 'rev-2',
    vendorId: 'vendor-1',
    userId: 'cust-2',
    userName: 'Karthik Rao',
    rating: 5,
    comment: 'Crispy on the outside, melt-in-mouth soft inside. You can see the pure white butter being scooped onto the hot tawa. Outstanding street food!',
    createdAt: '2025-02-08T19:40:00Z'
  },
  {
    id: 'rev-3',
    vendorId: 'vendor-2',
    userId: 'cust-3',
    userName: 'Rohan Mehta',
    rating: 5,
    comment: 'Best pani puri in Mumbai hands down! The hing and garlic pani are so addictive. Very clean and hygienic setup too with mineral water.',
    createdAt: '2025-02-12T17:15:00Z'
  },
  {
    id: 'rev-4',
    vendorId: 'vendor-3',
    userId: 'cust-4',
    userName: 'Ananya Verma',
    rating: 5,
    comment: 'No one makes Dahi Bhalla like Natraj. The yogurt is thick, sweet, and chilled, and the saunth chutney has that vintage Chandni Chowk aroma.',
    createdAt: '2025-02-14T12:05:00Z'
  }
];

export const FOOD_CATEGORIES = [
  { id: 'all', name: 'All Cuisines', icon: 'Utensils' },
  { id: 'Dosa & South Indian', name: 'South Indian', icon: 'Sun' },
  { id: 'Pani Puri & Chaat', name: 'Pani Puri & Chaat', icon: 'Sparkles' },
  { id: 'Chaat & Snacks', name: 'Chaat & Samosa', icon: 'Flame' },
  { id: 'Momos & Chinese', name: 'Momos & Noodles', icon: 'Soup' },
  { id: 'Pav Bhaji & Fast Food', name: 'Pav Bhaji', icon: 'Sandwich' },
  { id: 'Chai & Snacks', name: 'Chai & Snacks', icon: 'Coffee' },
  { id: 'Rolls & Shawarma', name: 'Rolls & Shawarma', icon: 'Wrap' },
  { id: 'Sweets & Desserts', name: 'Sweets & Kulfi', icon: 'IceCream' },
  { id: 'Beverages', name: 'Juices & Lassi', icon: 'CupSoda' }
];
