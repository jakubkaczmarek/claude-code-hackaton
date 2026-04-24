import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Property } from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private cachedProperties: Property[] | null = null;

  getAll(): Observable<Property[]> {
    if (this.cachedProperties !== null) {
      return of(this.cachedProperties);
    }
    return this.http.get<Property[]>('/api/properties').pipe(
      tap(data => { this.cachedProperties = data; })
    );
  }

  getById(id: string): Observable<Property> {
    return this.http.get<Property>(`/api/properties/${id}`);
  }

  clearCache(): void {
    this.cachedProperties = null;
  }
}
