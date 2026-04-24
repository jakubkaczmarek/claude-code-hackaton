import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly STORAGE_KEY = 'realestate_favorites';

  private readonly _ids = signal<string[]>(this.loadIds());
  readonly ids = this._ids.asReadonly();

  isFavorite(id: string): boolean {
    return this._ids().includes(id);
  }

  toggle(id: string): void {
    const current = this._ids();
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    this._ids.set(updated);
    this.saveIds(updated);
  }

  private loadIds(): string[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  }

  private saveIds(ids: string[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ids));
  }
}
