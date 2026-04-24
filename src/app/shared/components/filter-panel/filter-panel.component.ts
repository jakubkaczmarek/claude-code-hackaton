import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FilterOptions, Location } from '../../../core/models/filter.model';
import { FilterService } from '../../../core/services/filter.service';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanelComponent {
  private readonly filterService = inject(FilterService);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly locations = signal<Location[]>([]);

  readonly bedroomOptions = [
    { label: 'Any', value: '' },
    { label: '1+', value: '1' },
    { label: '2+', value: '2' },
    { label: '3+', value: '3' },
    { label: '4+', value: '4' },
    { label: '5+', value: '5' },
  ];

  get filters(): FilterOptions {
    return this.filterService.filters();
  }

  constructor() {
    this.http.get<Location[]>('/api/locations')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(locs => this.locations.set(locs));
  }

  updateFilter(key: keyof FilterOptions, value: string): void {
    this.filterService.setFilter(key, value);
  }

  clearAll(): void {
    this.filterService.resetFilters();
  }
}
