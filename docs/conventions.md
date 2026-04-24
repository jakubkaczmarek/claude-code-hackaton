# Angular 17+ Application Conventions

Conventions for the Northwind Logistics Angular frontend.  
Source of truth: Angular team guidelines at [angular.dev](https://angular.dev).

---

## 1. Project Structure

Organize by **feature**, not by layer. Each feature folder is self-contained.

```
src/
  app/
    app.component.ts
    app.config.ts          ← bootstrapApplication() config
    app.routes.ts          ← root route array
    shared/                ← truly shared UI (buttons, inputs, layout)
      ui/
    core/                  ← singleton services: auth, http interceptors, error handler
    features/
      orders/
        orders.routes.ts   ← feature route array (lazy-loaded)
        order-list/
          order-list.component.ts
          order-list.component.html
          order-list.component.scss
          order-list.component.spec.ts
        order-detail/
        services/
          order.service.ts
        models/
          order.model.ts
      shipments/
        ...
  main.ts
```

Rules:
- One feature per directory under `features/`.
- `core/` services are singletons; never import `core/` from another feature directly.
- `shared/` contains only presentational, stateless components/pipes/directives.
- No `SharedModule`. Import standalone components individually where needed.

---

## 2. TypeScript

```json
// tsconfig.json (required settings)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictTemplates": true
  }
}
```

- **Never use `any`** — infer or declare explicit types.
- Prefer `interface` over `type` for object shapes.
- Use `readonly` on class fields that should not be reassigned after construction.
- Use `as const` for literal tuples and enums.

---

## 3. Components

### Declaration

```ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-order-list',
  standalone: true,         // required; default from Angular 19, explicit in 17
  changeDetection: ChangeDetectionStrategy.OnPush,  // required on every component
  imports: [RouterLink, CurrencyPipe, OrderCardComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent { }
```

**Rules:**
- `standalone: true` on every component, directive, and pipe — no NgModule.
- `ChangeDetectionStrategy.OnPush` is **mandatory** on every component (see [ADR-004](adr/ADR-004-change-detection-onpush.md)).
- Only import what the template actually uses in the `imports` array.
- Use `templateUrl` for templates longer than ~10 lines; inline `template` for trivial markup.

### Naming

| File | Class name |
|------|-----------|
| `order-list.component.ts` | `OrderListComponent` |
| `order.service.ts` | `OrderService` |
| `status.pipe.ts` | `StatusPipe` |
| `highlight.directive.ts` | `HighlightDirective` |
| `order.model.ts` | `interface Order { ... }` |
| `app.routes.ts` | `export const routes: Routes` |

> The Angular team recommends omitting the `Component` class suffix in new projects. This project retains the suffix for clarity during migration; new files follow the suffix convention.

---

## 4. Inputs, Outputs, and Two-Way Binding

Use the **signal-based API** introduced in Angular 17.1. Decorator-based `@Input()` / `@Output()` are supported but not recommended for new code.

### Inputs

```ts
import { input } from '@angular/core';

export class OrderCard {
  // Optional with default
  title = input('Untitled order');

  // Required — build error if not provided
  order = input.required<Order>();

  // With transform
  disabled = input(false, { transform: booleanAttribute });
}
```

### Outputs

```ts
import { output } from '@angular/core';

export class OrderCard {
  save = output<Order>();          // replaces @Output() EventEmitter
  cancel = output<void>();

  onSave(order: Order) {
    this.save.emit(order);
  }
}
```

### Two-Way Binding

```ts
import { model } from '@angular/core';

export class SearchBox {
  query = model('');    // replaces @Input() + @Output() queryChange
}
```

```html
<app-search-box [(query)]="searchQuery" />
```

---

## 5. Templates

Use Angular 17+ **built-in control flow blocks**. Never use `*ngIf` / `*ngFor` / `*ngSwitch` in new code.

### Conditional

```html
@if (order.status === 'delivered') {
  <app-delivery-badge />
} @else if (order.status === 'in_transit') {
  <app-transit-badge />
} @else {
  <app-pending-badge />
}

<!-- Result aliasing (avoids re-evaluation) -->
@if (order.metadata(); as meta) {
  <p>{{ meta.carrier }}</p>
}
```

### Loops

`track` is **required**. Use a unique, stable identifier.

```html
@for (order of orders(); track order.id) {
  <app-order-card [order]="order" />
} @empty {
  <p>No orders found.</p>
}

<!-- With implicit variables -->
@for (item of items(); track item.id; let i = $index, last = $last) {
  <li [class.last]="last">{{ i + 1 }}. {{ item.name }}</li>
}
```

### Switch

```html
@switch (status()) {
  @case ('loading') { <app-spinner /> }
  @case ('error')   { <app-error [msg]="error()" /> }
  @case ('success') { <app-data-table [rows]="data()" /> }
  @default never;   <!-- compile error if a new union member is added -->
}
```

### Other rules

- Prefer self-closing tags for components with no projected content: `<app-badge />`.
- No logic in templates beyond simple signal reads and method calls that return pure values.
- Avoid method calls that produce side effects in templates — use `computed()` instead.

---

## 6. Reactivity (Signals)

### Core primitives

```ts
import { signal, computed, effect, untracked } from '@angular/core';

// Writable state
const count = signal(0);
count.set(1);
count.update(v => v + 1);

// Derived state (lazy, memoized)
const doubled = computed(() => count() * 2);

// Side effects (use sparingly — see below)
effect(() => {
  console.log('count is now', count());
});
```

### Exposing state from services

Always expose a **readonly** view; only the owning service mutates state.

```ts
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly _orders = signal<Order[]>([]);
  readonly orders = this._orders.asReadonly();  // consumers cannot call .set()
}
```

### Bridging RxJS → Signals

```ts
import { toSignal } from '@angular/core/rxjs-interop';

// In a component or service (injection context required)
readonly user$ = this.authService.currentUser$;
readonly user = toSignal(this.user$, { initialValue: null });
```

### `effect()` — use sparingly

Effects run when their dependencies change. Do not use them to synchronize signals with other signals — use `computed()` or `linkedSignal()` instead.

```ts
// ❌ Wrong — synchronizing signals with an effect
effect(() => { this.derivedValue.set(this.source() * 2); });

// ✅ Correct — computed() for derived state
readonly derivedValue = computed(() => this.source() * 2);

// ✅ Acceptable effect use — DOM side effect, logging, analytics
effect(() => {
  document.title = `Orders (${this.orderCount()})`;
});
```

### Reading signals before async boundaries

Reactive context is **synchronous only**. Read signals before `await`.

```ts
// ✅ Correct
effect(async () => {
  const currentTheme = this.theme();   // read before await
  const data = await this.http.firstValueFrom(this.data$);
  this.applyTheme(currentTheme, data);
});
```

---

## 7. Dependency Injection

Use `inject()` at **class field level**. Never use constructor injection.

```ts
@Component({ ... })
export class OrderListComponent {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);  // for takeUntilDestroyed
}
```

### Subscription cleanup

Use this decision tree:

| Situation | Pattern |
|-----------|---------|
| Read-only async data for display | `toSignal(obs$, { initialValue: ... })` — no cleanup needed |
| Async data with side effects on arrival | `takeUntilDestroyed()` + `.subscribe()` |
| Observable set up inside a lifecycle hook | `takeUntilDestroyed(this.destroyRef)` with explicit `DestroyRef` |

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class OrderListComponent {
  // Preferred: toSignal() handles cleanup automatically
  readonly orders = toSignal(this.orderService.orders$, { initialValue: [] });

  // When side effects are needed — inject DestroyRef explicitly for lifecycle hook use
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.orderService.poll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(orders => this.logger.log(orders));  // side effect
  }
}
```

At field level (outside lifecycle hooks), `takeUntilDestroyed()` can be called without arguments.

---

## 8. Services

```ts
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  private readonly _orders = signal<Order[]>([]);
  readonly orders = this._orders.asReadonly();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(): void {
    this.loading.set(true);
    this.http.get<Order[]>('/api/orders').subscribe({
      next: data => {
        this._orders.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }
}
```

Rules:
- `providedIn: 'root'` for application-wide singletons.
- Use `providedIn: 'any'` or component-level providers only when you need a scoped instance.
- Expose state as readonly signals; never expose mutable subjects or writable signals.
- Services should not hold presentation logic (formatting, sorting for display) — put that in pipes or component `computed()`.

---

## 9. Routing

### Route definition

```ts
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },

  // Eager-load only primary landing page
  { path: 'orders', component: OrderListComponent },

  // Lazy-load all feature areas
  {
    path: 'shipments',
    loadChildren: () => import('./features/shipments/shipments.routes'),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin.component')
      .then(m => m.AdminComponent),
  },
  { path: '**', loadComponent: () => import('./shared/ui/not-found.component').then(m => m.NotFoundComponent) },
];
```

### Functional guards

```ts
// auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.parseUrl('/login');
};
```

### Resolvers

```ts
// order.resolver.ts
export const orderResolver: ResolveFn<Order> = (route) => {
  const orders = inject(OrderService);
  return orders.getById(route.paramMap.get('id')!);
};
```

Rules:
- All feature routes use `loadComponent` or `loadChildren` (lazy loading).
- Only the primary landing route is eager-loaded.
- Guards and resolvers are always **functional** (`CanActivateFn`, `ResolveFn`) — never class-based.
- Use `withComponentInputBinding()` in `provideRouter()` so route params bind directly to component inputs.

---

## 10. Forms

For **Angular 17**, use typed reactive forms for complex forms, template-driven for simple ones.

```ts
// Typed reactive form (Angular 14+)
import { FormBuilder, Validators } from '@angular/forms';

@Component({ ... })
export class OrderForm {
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    customerId: ['', [Validators.required]],
    items: this.fb.array([]),
    notes: [''],
  });

  submit() {
    if (this.form.valid) {
      // form.value is fully typed
    }
  }
}
```

> **Future:** Angular 21+ introduces signal forms (`FormField`). When the project upgrades, prefer signal forms for all new forms.

---

## 11. HTTP

```ts
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ],
};
```

### Functional interceptors

```ts
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

Rules:
- No class-based `HttpInterceptor`. Use `HttpInterceptorFn`.
- Never inject `HttpClient` in a component — always go through a service.
- Use `resource()` (Angular 17.3+) for simple GET-and-display patterns instead of manual `http.get()` + signal management.

---

## 12. Testing

Test framework: **Vitest** (preferred by Angular team). Fallback: Jest. Not Karma/Jasmine.

### Zoneless async pattern

Do not call `fixture.detectChanges()`. Use **Act → Wait → Assert**.

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListComponent],  // standalone — import directly
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
  });

  it('should render order count', async () => {
    // ACT
    component.orders.set([{ id: '1', status: 'active' }]);

    // WAIT
    await fixture.whenStable();

    // ASSERT
    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('1');
  });
});
```

### Service tests

```ts
describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should load orders', () => {
    const mock: Order[] = [{ id: '1', status: 'active' }];
    service.load();
    httpMock.expectOne('/api/orders').flush(mock);
    expect(service.orders()).toEqual(mock);
  });
});
```

### Coverage targets

| Type | Target |
|------|--------|
| Services (public methods) | 100% |
| Components (inputs, outputs, interactions) | Key paths |
| Pipes | All transform branches |
| Guards / Resolvers | Happy path + rejection |

---

## 13. Styling

```ts
@Component({
  styleUrl: './order-list.component.scss',
  // ViewEncapsulation.Emulated is the default — do not change unless you have a specific reason
})
```

Rules:
- Component styles are scoped by default (emulated encapsulation). Never use `ViewEncapsulation.None` unless building a global reset or theme utility.
- Global styles belong in `src/styles.scss` only: CSS resets, design tokens (CSS custom properties), typography.
- Use CSS custom properties (`--color-primary`) for theming; do not hard-code hex values in component styles.
- BEM naming for component-internal classes: `.order-card__title`, `.order-card--active`.

---

## 14. Accessibility

- Every interactive element must be keyboard-accessible and carry an ARIA label when its visual label is absent.
- Use Angular CDK `a11y` for focus management in custom overlays, modals, and menus.
- Test with a screen reader before shipping any new component.

---

## Summary Cheat-Sheet

| Rule | Value |
|------|-------|
| Component model | Standalone (`standalone: true`) |
| Change detection | `OnPush` always |
| DI | `inject()` at field level |
| Inputs | `input()` / `input.required()` |
| Outputs | `output()` |
| Two-way | `model()` |
| State | `signal()` + `.asReadonly()` in services |
| Derived state | `computed()` |
| RxJS bridge | `toSignal()` |
| Subscription cleanup | `takeUntilDestroyed(destroyRef)` |
| Template conditionals | `@if` / `@else` |
| Template loops | `@for ... track item.id` |
| Template switch | `@switch` / `@case` / `@default never` |
| Routing | `loadComponent` / `loadChildren` (lazy) |
| Guards | `CanActivateFn` (functional) |
| Resolvers | `ResolveFn<T>` (functional) |
| HTTP interceptors | `HttpInterceptorFn` (functional) |
| Forms | Typed `ReactiveFormsModule` (signal forms when on v21+) |
| Tests | Vitest, zoneless Act/Wait/Assert |
| No `any` | Strict TypeScript throughout |
