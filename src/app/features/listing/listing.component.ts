import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Property } from '../../core/models/property.model';
import { FilterOptions } from '../../core/models/filter.model';
import { FilterService } from '../../core/services/filter.service';
import { PropertyService } from '../../core/services/property.service';
import { FilterPanelComponent } from '../../shared/components/filter-panel/filter-panel.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [FormsModule, FilterPanelComponent, PropertyCardComponent],
  templateUrl: './listing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly filterService = inject(FilterService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly allProperties = signal<Property[]>([]);
  readonly properties = signal<Property[]>([]);
  readonly totalCount = signal(0);
  readonly sortKey = signal<FilterOptions['sortKey']>(this.filterService.filters().sortKey);

  ngOnInit(): void {
    this.propertyService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.allProperties.set(data);
        this.totalCount.set(data.length);
        this.properties.set(this.filterService.apply(data));
        this.loading.set(false);
      });

    this.filterService.filtersChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.properties.set(this.filterService.apply(this.allProperties()));
        this.sortKey.set(this.filterService.filters().sortKey);
      });
  }

  changeSort(value: string): void {
    const key = value as FilterOptions['sortKey'];
    this.sortKey.set(key);
    this.filterService.setFilter('sortKey', key);
  }

  clearFilters(): void {
    this.filterService.resetFilters();
  }
}
