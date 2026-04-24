---
name: Migrate AngularJS Service to Angular 17
description: Migrates an AngularJS .service() or .factory() to an Angular 17 @Injectable with proper TypeScript types, RxJS state, and inject() DI.
---

# Migrate AngularJS Service to Angular 17

Migrate the AngularJS service at: `$ARGUMENTS`

---

## Step 1 — Read and Classify

Read the file and determine the type:
- `.service(name, fn)` — `fn` is a constructor, `this.x` are public members
- `.factory(name, fn)` — `fn` returns an object literal; keys are public members
- `.provider(name, fn)` — has a `$get` method; note this needs manual handling

Identify:
- All public methods and properties
- All injected AngularJS dependencies (`$http`, `$q`, `$rootScope`, `$timeout`, custom services)
- Any `$rootScope.$broadcast` / `$rootScope.$on` event bus usage
- Any `$q.defer()` deferred promise patterns
- Any state held on the service (properties that change over time)

---

## Step 2 — Plan

Output a migration plan before writing any code:

```
Service: <name>
Type: service | factory | provider

Public API:
  getUsers()       →  getUsers(): Observable<User[]>
  currentUser      →  readonly currentUser = signal<User | null>(null)

Dependencies:
  $http            →  inject(HttpClient)
  $q               →  native Promise / RxJS (remove)
  $rootScope       →  (see event bus section below)
  CustomService    →  inject(CustomService)

State:
  this.items = []  →  private _items = signal<Item[]>([])
                       readonly items = this._items.asReadonly()

Event bus:
  $broadcast('userLoaded', data)  →  Subject<User> exposed as Observable
  $rootScope.$on('x', fn)         →  subscribe to shared Subject in constructor
```

---

## Step 3 — Create the Angular Service

Create `<name>.service.ts`:

```ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class <Name>Service {
  private readonly http = inject(HttpClient);

  // Expose state as readonly signals
  private readonly _items = signal<Item[]>([]);
  readonly items = this._items.asReadonly();
}
```

### Migration Rules

| AngularJS | Angular 17 |
|-----------|-----------|
| `$http.get(url)` | `this.http.get<T>(url)` returns `Observable<T>` |
| `$http.post(url, body)` | `this.http.post<T>(url, body)` |
| `$q.defer()` / `deferred.resolve()` | Return `Observable` or `Promise` directly |
| `$q.all([p1, p2])` | `forkJoin([obs1, obs2])` or `Promise.all([])` |
| `$q.resolve(val)` | `of(val)` or `Promise.resolve(val)` |
| `$q.reject(err)` | `throwError(() => err)` or `Promise.reject(err)` |
| `$timeout(fn, ms)` | `timer(ms).pipe(take(1)).subscribe(fn)` |
| `this.data = []` (mutable state) | `private _data = signal<T[]>([])` |
| `$rootScope.$broadcast('evt', d)` | `private evt$ = new Subject<T>(); onEvt$ = this.evt$.asObservable()` |
| `$rootScope.$on('evt', fn)` | `inject(OtherService).onEvt$.subscribe(fn)` in consuming service |

### HTTP Response Typing
Always type HTTP calls — never use untyped `$http`:
```ts
// AngularJS
$http.get('/api/users').then(res => res.data)

// Angular
this.http.get<User[]>('/api/users')  // returns Observable<User[]>
```

### Stateful Services
For services that hold state, use signals with private write / public read:
```ts
private readonly _loading = signal(false);
readonly loading = this._loading.asReadonly();

load(): void {
  this._loading.set(true);
  this.http.get<User[]>('/api/users').subscribe({
    next: users => { this._users.set(users); this._loading.set(false); },
    error: () => this._loading.set(false),
  });
}
```

### Event Bus Replacement
Replace `$rootScope.$broadcast` / `$rootScope.$on` with a typed `Subject`:
```ts
// In the emitting service
private readonly _userLoggedIn = new Subject<User>();
readonly userLoggedIn$ = this._userLoggedIn.asObservable();

notifyLogin(user: User): void {
  this._userLoggedIn.next(user);
}

// In the consuming component/service
inject(AuthService).userLoggedIn$
  .pipe(takeUntilDestroyed())
  .subscribe(user => ...);
```

---

## Step 4 — Update Consumers

List every file that injects the old service by name (e.g. `'UserService'` in `$inject` or controller arguments).
These files will need to:
1. Import the new Angular service class
2. Replace `inject('UserService')` with `private readonly userService = inject(UserService)`
3. Update method calls if signatures changed (`.then()` → `.subscribe()` or `async/await`)

---

## Step 5 — Summary

```
## Migration Complete

File created: src/app/<path>/<name>.service.ts

Public API:
  <list of methods with new signatures>

State signals exposed:
  <list>

Event bus replacements:
  <list of $broadcast/$on → Subject>

⚠️  Manual follow-up:
  - Consumers that need updating: <list files>
  - $provider patterns (need manual config): <yes/no>
  - Any $http interceptor logic moved to: HttpInterceptorFn
```
