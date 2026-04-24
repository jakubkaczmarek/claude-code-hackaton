import {
  ChangeDetectionStrategy, Component, computed, DestroyRef,
  inject, OnInit, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Agent } from '../../core/models/agent.model';
import { Property } from '../../core/models/property.model';
import { AgentService } from '../../core/services/agent.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { PropertyService } from '../../core/services/property.service';
import { ContactFormComponent } from '../../shared/components/contact-form/contact-form.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, PropertyCardComponent, ContactFormComponent],
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly agentService = inject(AgentService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly property = signal<Property | null>(null);
  readonly agent = signal<Agent | null>(null);
  readonly related = signal<Property[]>([]);
  readonly activeImage = signal('');
  readonly mapUrl = signal<SafeResourceUrl | null>(null);

  readonly isFav = computed(() => {
    const p = this.property();
    return p ? this.favoritesService.isFavorite(p.id) : false;
  });

  readonly priceDisplay = computed(() => {
    const p = this.property();
    if (!p) return '';
    const fmt = '$' + p.price.toLocaleString();
    switch (p.priceType) {
      case 'monthly': return fmt + ' / month';
      case 'weekly':  return fmt + ' / week';
      default:        return fmt;
    }
  });

  ngOnInit(): void {
    const propId = this.route.snapshot.params['id'] as string;

    this.propertyService.getById(propId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.property.set(data);
        this.loading.set(false);

        if (data.images?.length > 0) {
          this.activeImage.set(data.images[0]);
        }

        if (data.coordinates) {
          const raw = `https://maps.google.com/maps?q=${data.coordinates.lat},${data.coordinates.lng}&z=15&output=embed`;
          this.mapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(raw));
        }

        this.agentService.getById(data.agentId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(agentData => this.agent.set(agentData));

        this.propertyService.getAll()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(allProps => {
            const rel = allProps
              .filter(p => p.id !== data.id && (p.location === data.location || p.type === data.type))
              .slice(0, 3);
            this.related.set(rel);
          });
      });
  }

  setActiveImage(imgUrl: string): void {
    this.activeImage.set(imgUrl);
  }

  toggleFav(): void {
    const p = this.property();
    if (p) this.favoritesService.toggle(p.id);
  }

  getFullAddress(): string {
    const a = this.property()?.address;
    if (!a) return '';
    return `${a.street}, ${a.suburb}, ${a.city} ${a.state} ${a.postcode}`;
  }
}
