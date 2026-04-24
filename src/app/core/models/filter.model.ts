export interface FilterOptions {
  keyword: string;
  type: string;
  status: string;
  location: string;
  bedroomsMin: string;
  priceMin: string;
  priceMax: string;
  sortKey: 'newest' | 'price-asc' | 'price-desc' | 'bedrooms-desc';
}

export interface Location {
  name: string;
}
