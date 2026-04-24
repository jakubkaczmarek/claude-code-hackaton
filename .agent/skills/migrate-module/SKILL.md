---
name: Migrate AngularJS Module to Angular 17 Bootstrap
description: Migrates the AngularJS root angular.module() and bootstrap to Angular 17 bootstrapApplication() with app.config.ts, replacing all module-level providers, run blocks, and config blocks.
---

# Migrate AngularJS Module to Angular 17 Bootstrap

Migrate the AngularJS module at: `$ARGUMENTS`

Run this skill **last**, after all components, services, filters, and routes have been migrated.

---

## Step 1 — Read and Inventory

Read the module file and identify everything registered on `angular.module(...)`:

- **Declarations**: `.controller(`, `.component(`, `.directive(` — should already be migrated
- **Services**: `.service(`, `.factory(`, `.provider(` — should already be migrated
- **Filters**: `.filter(` — should already be migrated
- **Config blocks**: `.config(fn)` — runs before app starts, often configures `$routeProvider` / `$stateProvider` or interceptors
- **Run blocks**: `.run(fn)` — runs after app starts, often sets up auth checks or global listeners
- **Constants / Values**: `.constant(name, val)` / `.value(name, val)`
- **Third-party module imports**: e.g. `['ui.router', 'ngMaterial', 'ngAnimate']`

---

## Step 2 — Plan

```
Module name: <name>
Bootstrap element: <body> | #app | custom

Config blocks:
  router config ($stateProvider)  →  already in app.routes.ts (skip)
  HTTP interceptor config         →  provideHttpClient(withInterceptors([...]))
  custom config fn                →  APP_INITIALIZER or provideX()

Run blocks:
  auth check on start             →  APP_INITIALIZER
  global $rootScope listener      →  APP_INITIALIZER or service constructor

Constants:
  .constant('API_URL', '...')     →  InjectionToken<string> or environment.ts

Values:
  .value('config', {...})         →  InjectionToken or environment.ts

Third-party modules:
  ui.router        →  provideRouter() — already done
  ngMaterial       →  Angular Material providers
  ngAnimate        →  not needed (Angular handles animations natively)
  ngSanitize       →  not needed (Angular escapes by default)
  ngTranslate      →  provideTranslateService() from @ngx-translate
```

---

## Step 3 — Create main.ts

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

---

## Step 4 — Create app.config.ts

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([/* add interceptors here */])),
    // add further providers below
  ],
};
```

### Provider Mapping

| AngularJS | Angular 17 |
|-----------|-----------|
| `angular.module('app', ['ui.router'])` | `provideRouter(routes)` in `app.config.ts` |
| `$httpProvider.interceptors.push(...)` | `provideHttpClient(withInterceptors([fn]))` |
| `.constant('TOKEN', val)` | `{ provide: TOKEN, useValue: val }` with `InjectionToken` |
| `.value('config', obj)` | `{ provide: CONFIG, useValue: obj }` with `InjectionToken` |
| `.run(fn)` | `{ provide: APP_INITIALIZER, useFactory: fn, multi: true }` |
| `.config(fn)` | Inline in `app.config.ts` providers (most cases) |
| `ngAnimate` | Remove — not needed |
| `ngSanitize` | Remove — Angular sanitizes by default |
| `ngAria` | Angular CDK a11y if needed |

### Constants and Values → InjectionTokens

```ts
// AngularJS
angular.module('app').constant('API_URL', 'https://api.example.com');

// Angular 17
export const API_URL = new InjectionToken<string>('API_URL');

// In app.config.ts providers:
{ provide: API_URL, useValue: 'https://api.example.com' }

// Usage:
private readonly apiUrl = inject(API_URL);
```

### Run Blocks → APP_INITIALIZER

```ts
// AngularJS
angular.module('app').run(function(AuthService) {
  AuthService.checkSession();
});

// Angular 17
export function initAuth(auth: AuthService) {
  return () => auth.checkSession();
}

// In app.config.ts providers:
{
  provide: APP_INITIALIZER,
  useFactory: (auth: AuthService) => () => auth.checkSession(),
  deps: [AuthService],
  multi: true,
}
```

### HTTP Interceptors

```ts
// Angular 17 functional interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) return next(req);
  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};

// Register in app.config.ts:
provideHttpClient(withInterceptors([authInterceptor]))
```

---

## Step 5 — Create the Root AppComponent

If not already present, create a minimal `app.component.ts` that replaces the AngularJS root template:

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
```

---

## Step 6 — Remove AngularJS Bootstrap

Remove or replace the legacy bootstrap:
- Remove `ng-app` attribute from `index.html`
- Remove `angular.bootstrap(document, ['app'])` calls
- Remove `<script>` tags for `angular.js` / `angular.min.js` and all AngularJS plugin scripts
- Update `index.html` to reference the Angular build output

---

## Step 7 — Summary

```
## Migration Complete

Files created:
  - src/main.ts
  - src/app/app.config.ts
  - src/app/app.component.ts  (if new)

Providers migrated:
  Constants/Values → InjectionTokens: <list>
  Run blocks → APP_INITIALIZER: <list>
  HTTP interceptors: <list>
  Third-party modules removed: <list>
  Third-party modules replaced: <list with Angular equivalent>

⚠️  Manual follow-up:
  - Remove angular.js <script> tags from index.html
  - Remove ng-app from index.html
  - Verify all migrated services/components are tree-shaken (no NgModule imports remaining)
  - Run the app: npx ng serve
```
