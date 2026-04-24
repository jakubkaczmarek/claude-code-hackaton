---
name: Migrate AngularJS Component to Angular 17
description: Step-by-step skill for migrating a single AngularJS component (controller + template) to a standalone Angular 17 component with TypeScript.
---

# Migrate AngularJS Component to Angular 17

Migrate the AngularJS component specified by the user: `$ARGUMENTS`

---

## Step 1 — Locate and Read the Source

Find and read all files related to the component:
- The controller file (`.js`)
- The template file (`.html`)
- Any associated service or filter files referenced in the controller
- The module registration (look for `.controller(`, `.component(`, `.directive(` calls that register this component)

Identify:
- Component name and selector
- All `$scope` properties and methods
- All injected dependencies (`$http`, `$state`, custom services, etc.) — note: `$scope` is NOT a service, list it separately as the binding mechanism to replace with class properties
- Input bindings (`<`, `=`, `@`, `&`)
- Lifecycle hooks (`$onInit`, `$onDestroy`, `$onChanges`, `$postLink`)
- Events emitted via `&` bindings
- Any `$watch` / `$watchGroup` / `$watchCollection` calls

---

## Step 2 — Plan the Migration

Before writing any code, output a migration plan:

```
Component: <name>
Selector:  <app-name>

Inputs:
  < binding 'foo'  →  foo = input<type>()
  = binding 'bar'  →  bar = model<type>()        (two-way: replaces @Input+@Output pair)

Outputs:
  & binding 'onSave'  →  save = output<...>()

Dependencies to inject:
  $http          →  HttpClient
  $state         →  Router
  $stateParams   →  ActivatedRoute
  $timeout       →  (inline setTimeout or RxJS timer)
  CustomService  →  CustomService (migrate separately if needed)

Lifecycle:
  $onInit    →  ngOnInit
  $onDestroy →  ngOnDestroy
  $onChanges →  ngOnChanges
  $postLink  →  ngAfterViewInit

$watch calls: <list them — each becomes ngOnChanges or a getter>
```

---

## Step 3 — Create the Angular Component

Create `<component-name>.component.ts` following these rules:

### Class Structure
```ts
import { Component, ChangeDetectionStrategy, input, output, model, inject } from '@angular/core';

@Component({
  selector: 'app-<name>',
  standalone: true,
  templateUrl: './<name>.component.html',
  styleUrl: './<name>.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <Name>Component {
  // Signal inputs / outputs / models first
  // then private injected services via inject()
  // then internal signal state
  // then computed()
  // then lifecycle methods
  // then public methods (bound in template)
  // then private helpers
}
```

### Mapping Rules
| AngularJS | Angular 17 |
|-----------|-----------|
| `$scope.foo = value` | `foo = value` (class property) |
| `$scope.fn = function()` | `fn() {}` (class method) |
| `this.$onInit()` | `ngOnInit()` |
| `this.$onDestroy()` | `ngOnDestroy()` |
| `this.$onChanges(changes)` | `ngOnChanges(changes: SimpleChanges)` |
| `this.$postLink()` | `ngAfterViewInit()` |
| `$scope.$watch('x', fn)` | `ngOnChanges` or `set x(v)` with getter/setter |
| `$http.get(url)` | `this.http.get<T>(url)` — subscribe or `toSignal()` |
| `$q.resolve()` | `Promise.resolve()` |
| `$q.all([])` | `Promise.all([])` or `forkJoin([])` |
| `$timeout(fn, ms)` | `setTimeout(fn, ms)` — clear in `ngOnDestroy` |
| `$state.go('route')` | `this.router.navigate(['/route'])` |
| `$stateParams.id` | `this.route.snapshot.params['id']` |

### Dependency Injection
Always use the `inject()` function — no constructor injection:
```ts
private readonly http = inject(HttpClient);
private readonly router = inject(Router);
private readonly route = inject(ActivatedRoute);
```

### Subscriptions
Avoid manual `subscribe()` in the component body. Prefer:
- `toSignal()` for read-only async data
- `async` pipe in the template
- `takeUntilDestroyed()` when `.subscribe()` is unavoidable

When using `takeUntilDestroyed()` inside a lifecycle hook (e.g. `ngOnInit`) rather than at field initialisation, inject `DestroyRef` explicitly:
```ts
private readonly destroyRef = inject(DestroyRef);

ngOnInit() {
  this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);
}
```
At field level (outside lifecycle hooks) `takeUntilDestroyed()` can be called without arguments.

---

## Step 4 — Migrate the Template

Create `<component-name>.component.html` applying these replacements:

| AngularJS | Angular 17 |
|-----------|-----------|
| `ng-if="expr"` | `@if (expr) { }` |
| `ng-show="expr"` | `@if (expr) { }` or `[hidden]="!expr"` |
| `ng-hide="expr"` | `@if (!expr) { }` |
| `ng-repeat="item in items"` | `@for (item of items; track item.id) { }` |
| `ng-model="x"` | `[(ngModel)]="x"` (requires `FormsModule`) |
| `ng-click="fn()"` | `(click)="fn()"` |
| `ng-change="fn()"` | `(ngModelChange)="fn()"` or `(change)="fn()"` |
| `ng-submit="fn()"` | `(ngSubmit)="fn()"` |
| `ng-class="{active: x}"` | `[class.active]="x"` or `[ngClass]` |
| `ng-style="{color: x}"` | `[style.color]="x"` or `[ngStyle]` |
| `ng-href="{{url}}"` | `[href]="url"` |
| `ng-src="{{url}}"` | `[src]="url"` |
| `ng-disabled="expr"` | `[disabled]="expr"` |
| `ng-bind="expr"` | `{{ expr }}` |
| `ng-transclude` | `<ng-content>` |
| `ng-include="'tmpl.html'"` | Extract to a child component |
| `{{ ::expr }}` | `{{ expr }}` (one-time binding not needed) |
| `$ctrl.fn()` | `fn()` (no prefix needed) |
| `filter: searchText` | Move filtering to component with `computed()` or a pipe |
| `ng-switch` / `ng-switch-when` | `@switch (expr) { @case (val) { } @default { } }` |
| `ng-options="x for x in list"` | `@for (x of list; track x) { <option [value]="x">` } |
| `ng-value="expr"` | `[value]="expr"` |
| `ng-form` / `ng-submit` | `<form (ngSubmit)="fn()">` with `FormsModule` or `ReactiveFormsModule` |

---

## Step 5 — Declare Imports in the Component

Add only what the template actually uses to the `imports` array. Never import `CommonModule`.

```ts
imports: [
  // @if / @for / @switch control flow requires NO imports — they are built-in
  FormsModule,          // only if [(ngModel)] used
  ReactiveFormsModule,  // only if reactive forms used
  RouterLink,           // only if routerLink used (not RouterModule)
  AsyncPipe,            // only if async pipe used in template
  // import other standalone components, pipes, and directives directly
]
```

Do NOT import `NgIf`, `NgFor`, or `NgSwitch` — these are the `*ngIf`/`*ngFor` directives that we do not use. Use `@if`/`@for`/`@switch` control flow blocks instead.

---

## Step 6 — Create the Styles File

Create `<component-name>.component.scss` and move any inline or external CSS scoped to this component. If none, leave it empty.

---

## Step 7 — Output a Migration Summary

After creating all files, report:

```
## Migration Complete

Files created:
  - src/app/<path>/<name>.component.ts
  - src/app/<path>/<name>.component.html
  - src/app/<path>/<name>.component.scss

Inputs migrated:   <list>
Outputs migrated:  <list>
Services injected: <list>

⚠️  Manual follow-up required:
  - <any $watch that couldn't be auto-mapped>
  - <any $broadcast/$emit event bus usage>
  - <any dynamically compiled templates>
  - <any third-party AngularJS directives with no Angular equivalent>
  - Services that still need to be migrated: <list>
```

---

## Rules

- Always use `ChangeDetectionStrategy.OnPush`
- Always use `standalone: true` — no NgModule
- Always use `inject()` — no constructor injection
- Never use `$scope`, `$rootScope`, `$broadcast`, or `$emit`
- Never use `any` type unless no type information is available
- Use Angular 17 `@if` / `@for` control flow — not `*ngIf` / `*ngFor`
- Add `track` on every `@for` loop using a stable unique key (e.g. `track item.id`)
- Unsubscribe all observables using `takeUntilDestroyed()` or `toSignal()`
