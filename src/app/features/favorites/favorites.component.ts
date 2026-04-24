import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Property } from '../../core/models/property.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { PropertyService } from '../../core/services/property.service';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, PropertyCardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly properties = signal<Property[]>([]);
  readonly isEmpty = signal(false);

  ngOnInit(): void {
    const favIds = this.favoritesService.ids();
    this.propertyService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.loading.set(false);
        if (favIds.length === 0) { this.isEmpty.set(true); return; }
        const favProps = data.filter(p => favIds.includes(p.id));
        this.properties.set(favProps);
        this.isEmpty.set(favProps.length === 0);
      });
  }
}
