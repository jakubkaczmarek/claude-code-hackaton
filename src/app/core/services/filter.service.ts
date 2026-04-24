import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { FilterOptions } from '../models/filter.model';
import { Property } from '../models/property.model';

const DEFAULT_FILTERS: FilterOptions = {
  keyword: '',
  type: '',
  status: '',
  location: '',
  bedroomsMin: '',
  priceMin: '',
  priceMax: '',
  sortKey: 'newest',
};

@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly _filters = signal<FilterOptions>({ ...DEFAULT_FILTERS });
  readonly filters = this._filters.asReadonly();

  private readonly _filtersChanged = new Subject<void>();
  readonly filtersChanged$ = this._filtersChanged.asObservable();

  setFilter(key: keyof FilterOptions, value: string): void {
    this._filters.update(f => ({ ...f, [key]: value } as FilterOptions));
    this._filtersChanged.next();
  }

  resetFilters(): void {
    this._filters.set({ ...DEFAULT_FILTERS });
    this._filtersChanged.next();
  }

  apply(properties: Property[]): Property[] {
    const f = this._filters();
    const result = properties.filter(p => {
      if (f.keyword) {
        const searchStr = [p.title, p.description, p.address.suburb, p.address.city]
          .join(' ')
          .toLowerCase();
        if (!searchStr.includes(f.keyword.toLowerCase())) return false;
      }
      if (f.type && p.type !== f.type) return false;
      if (f.status && p.status !== f.status) return false;
      if (f.location && p.location !== f.location) return false;
      if (f.bedroomsMin && p.bedrooms < parseInt(f.bedroomsMin, 10)) return false;
      if (f.priceMin && p.price < parseInt(f.priceMin, 10)) return false;
      if (f.priceMax && p.price > parseInt(f.priceMax, 10)) return false;
      return true;
    });

    switch (f.sortKey) {
      case 'price-asc':     result.sort((a, b) => a.price - b.price); break;
      case 'price-desc':    result.sort((a, b) => b.price - a.price); break;
      case 'newest':        result.sort((a, b) => b.listedAt.localeCompare(a.listedAt)); break;
      case 'bedrooms-desc': result.sort((a, b) => b.bedrooms - a.bedrooms); break;
    }
    return result;
  }
}
