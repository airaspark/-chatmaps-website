export type UserRole = 'customer' | 'vendor' | 'admin';

export type VendorApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status?: 'active' | 'suspended';
  phone?: string;
  photoURL?: string;
  city?: string;
  dietaryPreference?: 'all' | 'veg' | 'jain';
  termsAccepted?: boolean;
  privacyPolicyAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  privacyPolicyVersion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isVeg: boolean;
  image?: string;
  isPopular?: boolean;
}

export interface VendorLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Vendor {
  id: string;
  ownerUid: string;
  shopName: string;
  ownerName: string;
  description: string;
  category: string;
  subCategories?: string[];
  phone: string;
  whatsapp?: string;
  address: string;
  landmark?: string;
  city: string;
  postalCode?: string;
  location: VendorLocation;
  bannerImage: string;
  coverImageUrl?: string;
  photos: string[];
  menu: MenuItem[];
  isOpen: boolean;
  openingHours: string;
  closingTime?: string;
  status: VendorApprovalStatus;
  rejectionReason?: string;
  rating: number;
  reviewCount: number;
  priceRange?: '₹' | '₹₹' | '₹₹₹';
  isPureVeg?: boolean;
  viewsCount?: number;
  favoritesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  vendorId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  vendorId: string;
  createdAt: string;
  vendor?: Vendor;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  maxDistance: number | null; // in km
  minRating: number | null;
  openNowOnly: boolean;
  pureVegOnly: boolean;
  sortBy: 'recommended' | 'rating' | 'distance' | 'reviews';
}
