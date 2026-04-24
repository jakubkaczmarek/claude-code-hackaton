import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'properties',
    loadComponent: () =>
      import('./features/listing/listing.component').then(m => m.ListingComponent),
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./features/detail/detail.component').then(m => m.DetailComponent),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then(m => m.FavoritesComponent),
  },
  { path: '**', redirectTo: '/properties' },
];
