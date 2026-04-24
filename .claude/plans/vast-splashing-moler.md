# Migration Plan: AngularJS → Angular 17 (`src/frontend-legacy`)

## Context

Full migration of the `realEstateBoardApp` AngularJS 1.8.3 SPA (real-estate property board) to Angular 17+ standalone components. The app has 4 services (factories), 4 controllers with templates, 4 directives with templates, and one inline NavController. All migrated files land in `src/app/` following `docs/conventions.md`.

---

## Migration Order

1. Models (new files) → 2. Services → 3. Shared components (leaves) → 4. Feature components (pages) → 5. Routing → 6. Bootstrap / AppComponent

---

## File Map

### 1. Models

| New file | What it defines |
|---|---|
| `src/app/core/models/agent.model.ts` | `Agent` interface |
| `src/app/core/models/filter.model.ts` | `FilterOptions` interface, `Location` interface |

`property.model.ts` already exists — no changes needed.

---

### 2. Services

All 4 factories → `@Injectable({ providedIn: 'root' })` classes, `inject()` DI, no `$scope`/$rootScope.

| Legacy | New file | Key changes |
|---|---|---|
| `services/property.service.js` | `src/app/core/services/property.service.ts` | `$http` → `HttpClient`; fake-promise cache → private `cachedProperties` field + `of()` short-circuit; returns `Observable<T>` |
| `services/agent.service.js` | `src/app/core/services/agent.service.ts` | Simple `$http` → `HttpClient` wrappers |
| `services/filter.service.js` | `src/app/core/services/filter.service.ts` | Filter state → `private _filters = signal<FilterOptions>(…)`; `$rootScope.$broadcast('filtersChanged')` → `private _filtersChanged = new Subject<void>(); readonly filtersChanged$ = …asObservable()`; `apply()` logic cleaned up with `Array.filter/sort` |
| `services/favorites.service.js` | `src/app/core/services/favorites.service.ts` | LocalStorage; IDs stored as `private _ids = signal<string[]>(…)` so `isFavorite()` is reactive; `toggle()` updates signal + storage; exposes `ids` as readonly signal |

**Note on `FilterService`:** the `$rootScope.$broadcast` is replaced with a `Subject<void>`. Consumers subscribe to `filtersChanged$` using `takeUntilDestroyed`.

---

### 3. Shared Components

All `app.directive()` → `@Component({ standalone: true, changeDetection: OnPush })`. Isolated-scope `@` bindings → `input.required<string>()`; `=` bindings → `input.required<T>()` (read-only in practice); form `agent` binding → `input.required<Agent>()`.

#### 3a. StatusBadge
| File | Notes |
|---|---|
| `src/app/shared/components/status-badge/status-badge.component.ts` | `status = input.required<string>()`; `label` and `cssClass` as `computed()` using `switch`; selector `app-status-badge` |
| `src/app/shared/components/status-badge/status-badge.component.html` | `<span class="badge" [class]="cssClass()">{{ label() }}</span>` |
| `src/app/shared/components/status-badge/status-badge.component.scss` | Empty placeholder |

#### 3b. PropertyCard
| File | Notes |
|---|---|
| `src/app/shared/components/property-card/property-card.component.ts` | `property = input.required<Property>()`; `isFav = computed(() => favoritesService.isFavorite(property().id))` (reactive because `FavoritesService.isFavorite` reads signal); `priceDisplay`, `thumbImg`, `addressLine` as `computed()`; imports: `RouterLink`, `StatusBadgeComponent` |
| `src/app/shared/components/property-card/property-card.component.html` | `ng-src` → `[src]`; `ng-show` → `@if`; `ng-click` → `(click)`; `href="#/properties/{{id}}"` → `[routerLink]="['/properties', property().id]"` |
| `src/app/shared/components/property-card/property-card.component.scss` | Empty |

#### 3c. FilterPanel
| File | Notes |
|---|---|
| `src/app/shared/components/filter-panel/filter-panel.component.ts` | No isolated scope in AngularJS → injects `FilterService` directly; `locations = signal<Location[]>([])`; HTTP call in `constructor()` via `takeUntilDestroyed()`; `get filters()` getter reads `filterService.filters()` signal (reactive, OnPush-safe); `updateFilter()` delegates to service; `bedroomOptions` as `readonly` array; imports: `FormsModule` |
| `src/app/shared/components/filter-panel/filter-panel.component.html` | `ng-model` → `[ngModel]` + `(ngModelChange)`; `ng-repeat` → `@for … track`; `ng-click` → `(click)` |
| `src/app/shared/components/filter-panel/filter-panel.component.scss` | Empty |

#### 3d. ContactForm
| File | Notes |
|---|---|
| `src/app/shared/components/contact-form/contact-form.component.ts` | `agent = input.required<Agent>()`; `formData` plain class property; `submitted`, `showSuccess`, `showErrors` as writable signals; `submitForm(form: NgForm)` checks `form.valid`; imports: `FormsModule` |
| `src/app/shared/components/contact-form/contact-form.component.html` | `ng-show` → `@if`; `ng-model` → `[(ngModel)]`; `ng-click="submitForm()"` → `(ngSubmit)="submitForm(contactForm)"` on `<form #contactForm="ngForm">`; per-field errors use `contactForm.controls['name']?.invalid` |
| `src/app/shared/components/contact-form/contact-form.component.scss` | Empty |

---

### 4. Feature Components (Pages)

#### 4a. Listing
| File | Notes |
|---|---|
| `src/app/features/listing/listing.component.ts` | Injects `PropertyService`, `FilterService`, `FavoritesService`, `DestroyRef`; `loading`, `allProperties`, `properties`, `totalCount`, `sortKey` as writable signals; `ngOnInit` subscribes to `propertyService.getAll()` and `filterService.filtersChanged$` both with `takeUntilDestroyed(destroyRef)`; `changeSort()` calls `filterService.setFilter('sortKey', sortKey())`; `clearFilters()` calls `filterService.resetFilters()`; imports: `FormsModule`, `FilterPanelComponent`, `PropertyCardComponent` |
| `src/app/features/listing/listing.component.html` | `<app-filter-panel />`; `ng-repeat` → `@for (prop of properties(); track prop.id)`; `ng-show` → `@if`; sort `<select>` uses `[ngModel]` + `(ngModelChange)` |
| `src/app/features/listing/listing.component.scss` | Empty |

#### 4b. Detail
| File | Notes |
|---|---|
| `src/app/features/detail/detail.component.ts` | Injects `PropertyService`, `AgentService`, `FavoritesService`, `ActivatedRoute`, `DestroyRef`; all state as writable signals (`property`, `agent`, `related`, `loading`, `activeImage`, `isFav`, `mapUrl`, `priceDisplay`); reads route id via `route.snapshot.params['id']`; nested subscribe chain mirrors original: after property loads, load agent + related properties; `setActiveImage()`, `toggleFav()`, `getFullAddress()` as class methods; imports: `PropertyCardComponent`, `StatusBadgeComponent`, `ContactFormComponent` |
| `src/app/features/detail/detail.component.html` | `ng-show` → `@if`; `ng-src` → `[src]`; `ng-repeat` → `@for … track`; `ng-class` → `[class.detail-gallery__thumb--active]`; `ng-href` → `[href]`; `<status-badge>` → `<app-status-badge>`; `<contact-form>` → `<app-contact-form>`; `<iframe [src]="mapUrl()">` needs `DomSanitizer` bypass → use `SafeResourceUrl` via `computed()` |
| `src/app/features/detail/detail.component.scss` | Empty |

**Note:** `mapUrl` needs `DomSanitizer.bypassSecurityTrustResourceUrl()` for the iframe `[src]`. Inject `DomSanitizer` and produce a `SafeResourceUrl` signal.

#### 4c. Favorites
| File | Notes |
|---|---|
| `src/app/features/favorites/favorites.component.ts` | Injects `PropertyService`, `FavoritesService`, `DestroyRef`; `properties`, `loading`, `isEmpty` as writable signals; `ngOnInit` loads favIds then filters all properties; imports: `PropertyCardComponent`, `RouterLink` |
| `src/app/features/favorites/favorites.component.html` | `ng-show` → `@if`; `ng-repeat` → `@for … track prop.id`; `href="#/properties"` → `routerLink="/properties"` |
| `src/app/features/favorites/favorites.component.scss` | Empty |

---

### 5. Routing

**`src/app/app.routes.ts`**
```
/properties       → loadComponent → ListingComponent
/properties/:id   → loadComponent → DetailComponent
/favorites        → loadComponent → FavoritesComponent
**                → redirectTo: '/properties'
```
All routes use `loadComponent` (lazy). `withComponentInputBinding()` in `provideRouter`.

---

### 6. Bootstrap

| File | Notes |
|---|---|
| `src/app/app.component.ts` | Minimal shell: `selector: 'app-root'`, `standalone: true`, imports `[RouterOutlet, RouterLink]`, template includes navbar HTML (brand + nav links with favCount badge) replacing NavController; `favCount = computed(() => favoritesService.getCount())` using `FavoritesService.ids` signal (reactive) |
| `src/app/app.component.html` | Navbar + `<router-outlet />` |
| `src/app/app.component.scss` | Empty |
| `src/app/app.config.ts` | `provideZoneChangeDetection`, `provideRouter(routes, withComponentInputBinding())`, `provideHttpClient()` |
| `src/main.ts` | `bootstrapApplication(AppComponent, appConfig)` |

**NavController migration:** The inline `NavController` that listens on `'favoritesChanged'` event is replaced by `AppComponent` with `favCount = computed(() => favoritesService.ids().length)`. Since `FavoritesService.ids` is a signal, the nav count updates reactively whenever favorites change.

---

## Manual Follow-Up Items

- The `mapUrl` iframe in detail view requires `DomSanitizer` — handled in the plan above via `SafeResourceUrl`.
- No `$watch` calls in the legacy code — no manual `ngOnChanges` conversions needed.
- No `$broadcast`/`$emit` except `filtersChanged` (replaced by `Subject`) and `favoritesChanged` (removed; replaced by signal).
- The legacy `FavoritesService` had no `favoritesChanged` broadcast — the NavController listened but it was never emitted. The Angular `AppComponent` simply reads `favoritesService.ids()` as a computed signal, which is always in sync.
- CSS: legacy stylesheets in `assets/css/` are referenced in `index.html`. For the Angular app they should be referenced in `src/styles.scss` or kept as global assets — **not** scoped per component. The `.scss` files for each component are left empty; global CSS stays in its current location.

---

## Verification

1. `npx ng build` — should compile with zero TypeScript errors (strict mode, `noImplicitAny`, `strictTemplates`).
2. `npx ng serve` — navigate to `/properties`, `/properties/:id`, `/favorites`.
3. Toggle a favorite on the listing page → badge count in navbar updates immediately (signal reactivity).
4. Reset filters from the listing page → filter panel inputs clear (signal from FilterService propagates back).
5. Contact form: submit with empty fields → errors shown; fill all required fields → success message.
