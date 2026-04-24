import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<string>();

  readonly label = computed(() => {
    switch (this.status()) {
      case 'for-sale':    return 'For Sale';
      case 'for-rent':    return 'For Rent';
      case 'sold':        return 'Sold';
      case 'under-offer': return 'Under Offer';
      default:            return this.status();
    }
  });
}
