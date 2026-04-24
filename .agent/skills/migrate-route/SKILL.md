---
name: Migrate AngularJS Routing to Angular 17
description: Migrates ui-router or ngRoute configuration to Angular 17 RouterModule with lazy-loaded standalone components, functional guards, and typed route parameters.
---

# Migrate AngularJS Routing to Angular 17

Migrate the routing configuration at: `$ARGUMENTS`

---

## Step 1 — Read and Classify

Read the routing config file and determine the router type:
- **ui-router**: uses `$stateProvider`, `.state()`, `ui-view`, `ui-sref`, `$stateParams`
- **ngRoute**: uses `$routeProvider`, `.when()`, `ng-view`, `$routeParams`

Identify:
- All route/state definitions (name, URL, template, controller)
- Nested states / child routes
- Abstract states
- Resolve dependencies (`resolve: { data: fn }`)
- Route guards (`onEnter`, `onExit`, or custom resolve-based auth)
- Parameters (`:id`, optional params, query params)
- Default route / otherwise
- Lazy-loaded modules (if any)

---

## Step 2 — Plan

Output a migration plan:

```
Router type: ui-router | ngRoute

Routes:
  state 'home'           url: '/'          →  { path: '', loadComponent: () => HomeComponent }
  state 'users'          url: '/users'     →  { path: 'users', loadComponent: ... }
  state 'users.detail'   url: '/:id'       →  { path: ':id', loadComponent: ... } (child route)
  abstract 'app'         url: ''           →  layout route with <router-outlet>

Resolves → Angular resolvers:
  resolve: { user: UserResolver }  →  ResolveFn<User>

Guards:
  onEnter: AuthCheck  →  CanActivateFn

Default route:
  .otherwise('/home')  →  { path: '**', redirectTo: '' }
```

---

## Step 3 — Create the Routes File

Create `app.routes.ts`:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
    children: [
      {
        path: ':id',
        loadComponent: () => import('./users/detail/user-detail.component').then(m => m.UserDetailComponent),
        resolve: { user: userResolver },
        canActivate: [authGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
```

### Mapping Rules

| AngularJS (ui-router) | Angular 17 |
|-----------------------|-----------|
| `$stateProvider.state('name', config)` | `{ path: 'url', ... }` in `Routes` array |
| `abstract: true` | Layout component with `<router-outlet>` as parent route |
| `template: '<ui-view/>'` | Parent component template contains `<router-outlet>` |
| `controller: 'Ctrl'` | `loadComponent: () => import(...)` |
| `resolve: { x: fn }` | `resolve: { x: resolveFn }` using `ResolveFn<T>` |
| `params: { id: null }` | `:id` in path or `queryParamsHandling` |
| `ui-sref="state.name"` | `[routerLink]="['/path']"` |
| `ui-sref-active="active"` | `routerLinkActive="active"` |
| `$state.go('name', params)` | `inject(Router).navigate(['/path', params])` |
| `$stateParams.id` | `inject(ActivatedRoute).snapshot.params['id']` |
| `$routeProvider.when('/path', config)` | `{ path: 'path', loadComponent: ... }` |
| `.otherwise('/path')` | `{ path: '**', redirectTo: '/path' }` |
| `$routeParams.id` | `inject(ActivatedRoute).snapshot.params['id']` |

### Resolvers
Convert `resolve` functions to typed `ResolveFn`:
```ts
// AngularJS
resolve: {
  user: function(UserService, $stateParams) {
    return UserService.getById($stateParams.id);
  }
}

// Angular 17
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getById(route.params['id']);
};
```

### Guards
Convert `onEnter` / resolve-based auth checks to functional `CanActivateFn`:
```ts
// Angular 17 functional guard
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login']);
};
```

### Lazy Loading
Always use `loadComponent` for feature routes — never eager import:
```ts
// Every feature route must be lazy
{
  path: 'dashboard',
  loadComponent: () =>
    import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
}
```

---

## Step 4 — Update app.config.ts

Ensure the router is wired up in `bootstrapApplication`:

```ts
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
  ],
};
```

`withComponentInputBinding()` enables route params to be received as `input()` signals directly in components.

---

## Step 5 — Update Templates

Find all `ui-view` / `ng-view` tags and replace with `<router-outlet>`.
Find all `ui-sref` attributes and replace with `routerLink`.
Find all `ui-sref-active` and replace with `routerLinkActive`.

---

## Step 6 — Summary

```
## Migration Complete

File created: src/app/app.routes.ts

Routes migrated: <count>
  <list: old state name → new path>

Resolvers created: <list>
Guards created: <list>
Templates updated (ui-view/ng-view replaced): <list files>

⚠️  Manual follow-up:
  - Abstract states converted to layout components: <list>
  - $state.go() calls in components to update: <list files>
  - $stateParams usage in components to update: <list files>
  - Named views (ui-router multiple views) — no direct equivalent, refactor to child components
```
