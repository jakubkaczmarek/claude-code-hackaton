export interface PropertyAddress {
  street: string;
  suburb: string;
  city: string;
  state: string;
  postcode: string;
}

export interface PropertyCoordinates {
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  status: 'for-sale' | 'for-rent' | 'sold' | 'under-offer';
  type: string;
  location: string;
  price: number;
  priceType: 'monthly' | 'weekly' | 'sale';
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  areaSqft: number;
  yearBuilt: number;
  address: PropertyAddress;
  coordinates?: PropertyCoordinates;
  images: string[];
  features: string[];
  agentId: string;
  listedAt: string;
}
