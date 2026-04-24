import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Property } from '../../../core/models/property.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, StatusBadgeComponent],
  templateUrl: './property-card.component.html',
  styleUrl: './property-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyCardComponent {
  property = input.required<Property>();

  private readonly favoritesService = inject(FavoritesService);

  readonly isFav = computed(() => this.favoritesService.isFavorite(this.property().id));

  readonly priceDisplay = computed(() => {
    const p = this.property();
    const fmt = '$' + p.price.toLocaleString();
    switch (p.priceType) {
      case 'monthly': return fmt + ' / mo';
      case 'weekly':  return fmt + ' / wk';
      default:        return fmt;
    }
  });

  readonly thumbImg = computed(() => this.property().images?.[0] ?? '');

  readonly addressLine = computed(() => {
    const a = this.property().address;
    return `${a.suburb}, ${a.city}`;
  });

  toggleFav(): void {
    this.favoritesService.toggle(this.property().id);
  }
}
