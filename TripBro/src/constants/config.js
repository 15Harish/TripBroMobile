// Replace these with your actual API keys
export const CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY,
  UNSPLASH_ACCESS_KEY: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY,
  EXCHANGE_RATE_API_KEY: process.env.EXPO_PUBLIC_EXCHANGE_RATE_API_KEY,
  GOOGLE_PLACES_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
};

export const GEMINI_MODEL = 'gemini-2.0-flash';

export const TRAVEL_STYLES = [
  { id: 'luxury', label: 'Luxury', icon: '👑' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'adventure', label: 'Adventure', icon: '🏔️' },
  { id: 'cultural', label: 'Cultural', icon: '🏛️' },
  { id: 'relaxation', label: 'Relaxation', icon: '🏖️' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'romantic', label: 'Romantic', icon: '💑' },
  { id: 'backpacker', label: 'Backpacker', icon: '🎒' },
];

export const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'gluten_free', label: 'Gluten Free' },
  { id: 'dairy_free', label: 'Dairy Free' },
  { id: 'none', label: 'No Restrictions' },
];

export const ACCOMMODATION_TYPES = [
  { id: 'hotel', label: 'Hotel', icon: '🏨' },
  { id: 'hostel', label: 'Hostel', icon: '🛏️' },
  { id: 'airbnb', label: 'Vacation Rental', icon: '🏠' },
  { id: 'resort', label: 'Resort', icon: '🏝️' },
  { id: 'boutique', label: 'Boutique Hotel', icon: '✨' },
  { id: 'camping', label: 'Camping', icon: '⛺' },
];

export const POPULAR_DESTINATIONS = [
  { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400' },
  { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
  { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
  { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400' },
  { name: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
  { name: 'Rome', country: 'Italy', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
];

export const BUDGET_CATEGORIES = [
  { id: 'accommodation', label: 'Accommodation', icon: '🏨', color: '#0077BE' },
  { id: 'food', label: 'Food & Dining', icon: '🍽️', color: '#FF6B35' },
  { id: 'transport', label: 'Transportation', icon: '✈️', color: '#10B981' },
  { id: 'activities', label: 'Activities', icon: '🎭', color: '#F59E0B' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#8B5CF6' },
  { id: 'misc', label: 'Miscellaneous', icon: '💼', color: '#6B7280' },
];
