# ADR-003: State Management — Angular Signals for Local State, RxJS for Async Streams

**Status:** Accepted  
**Date:** 2026-04-24  
**Deciders:** Frontend team

---

## Context

AngularJS managed state via `$scope` (mutable objects observed by dirty-checking) and `$rootScope` events (`$broadcast`/`$emit`) for cross-component communication.

Angular 17 offers two primary reactive primitives:
1. **Signals** (`signal()`, `computed()`, `toSignal()`) — synchronous, push-based reactive state; native to Angular 17; integrated with OnPush change detection.
2. **RxJS Observables** — asynchronous streams; composable; required for `HttpClient` and many Angular APIs.

A third option — external state libraries (NgRx, Akita, NGXS) — was also considered.

---

## Decision

- **Local component state** → Angular Signals (`signal()`, `computed()`)
- **Async data (HTTP, WebSocket, timers)** → RxJS Observables, bridged to templates via `toSignal()` where practical
- **Cross-component communication** (replacing `$rootScope.$broadcast`) → a `signal()` or `Subject` in an `@Injectable` service, exposed as `.asReadonly()`
- **No external state management library** for this migration

### Pattern for services with shared state

```ts
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly _orders = signal<Order[]>([]);
  readonly orders = this._orders.asReadonly();   // consumers cannot mutate

  private readonly http = inject(HttpClient);

  load(): void {
    this.http.get<Order[]>('/api/orders').subscribe(data => {
      this._orders.set(data);
    });
  }
}
```

### Pattern for replacing `$rootScope.$broadcast`

```ts
// AngularJS: $rootScope.$broadcast('cart:updated', cart)
// Angular 17:
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _cart = signal<Cart>(emptyCart);
  readonly cart = this._cart.asReadonly();
}
// Components inject CartService and read cart() directly — no event bus needed
```

---

## What We Chose Not to Do

| Option | Reason rejected |
|--------|----------------|
| NgRx / Redux pattern | Adds significant boilerplate for a migration project; the domain is not complex enough to justify it |
| `$rootScope`-style event bus (using `Subject` broadcast) | Creates the same hidden coupling problem as AngularJS `$broadcast`; prefer explicit service injection |
| Pure RxJS for all state | More complex than signals for synchronous local state; Signals integrate better with OnPush |
| Keep `BehaviorSubject` as primary pattern | Still valid, but `signal()` is simpler and more readable for most local state use cases |

---

## Consequences

**Positive:**
- Signals are simpler to read and write than `BehaviorSubject` chains for local state.
- OnPush components can derive their change detection directly from signals.
- `toSignal()` bridges the RxJS ↔ Signal boundary cleanly without manual subscription management.
- Eliminates the hidden global coupling of `$rootScope`.

**Negative:**
- Team must learn when to use a signal vs. an observable — the boundary is not always obvious.
- `toSignal()` requires an injection context; cannot be called outside of class fields or `runInInjectionContext`.
- Some RxJS operators (debounce, combineLatest, switchMap) have no signal equivalent and remain as observables.
