# AngularJS → Angular Migration

This project is a migration from AngularJS (1.x) to Angular (17+). Follow these rules for every file touched.

**Full conventions for the target Angular app:** [`docs/conventions.md`](docs/conventions.md)  
**Architecture decisions:** [`docs/adr/`](docs/adr/)

## Migration Rules

### Components (highest priority)
- AngularJS controller + template → Angular `@Component` class
- `$scope.foo` → class property `foo`
- `$scope.fn()` → class method `fn()`
- `controllerAs` syntax maps directly to the component class
- `ng-controller` in templates must be removed; use component selector instead

### Services
- `.service()` / `.factory()` → `@Injectable({ providedIn: 'root' })` class
- `$http` → `HttpClient` (inject via `inject(HttpClient)`)
- `$q` / deferred promises → native `Promise` or RxJS `Observable`
- `$timeout` / `$interval` → `setTimeout` / `setInterval` or RxJS `timer`/`interval`

### Template Syntax
| AngularJS | Angular |
|-----------|---------|
| `ng-model` | `[(ngModel)]` |
| `ng-if` | `@if` (prefer) / `*ngIf` |
| `ng-repeat` | `@for` (prefer) / `*ngFor` |
| `ng-show` / `ng-hide` | `@if` / `@if (!)` or `[hidden]` |
| `ng-click` | `(click)` |
| `ng-class` | `[ngClass]` |
| `ng-style` | `[ngStyle]` |
| `ng-href` / `ng-src` | `[href]` / `[src]` |
| `ng-bind` | `{{ }}` interpolation |
| `ng-transclude` | `<ng-content>` |
| `{{ ::expr }}` (one-time) | default Angular binding (no equivalent needed) |

### Routing
- `$routeProvider` / `ui-router` → `RouterModule.forRoot(routes)`
- `$stateParams` / `$routeParams` → `ActivatedRoute.snapshot.params` or `ActivatedRoute.paramMap`
- `ui-sref` → `routerLink`
- `ui-view` / `ng-view` → `<router-outlet>`

### Filters → Pipes
- Custom filters → `@Pipe` classes
- `| currency` → Angular built-in `CurrencyPipe`
- `| date` → Angular built-in `DatePipe`
- `| filter` (array filter) → custom pipe or component logic

### Directives
- Attribute directives → `@Directive` with `@HostListener` / `@HostBinding`
- Structural directives → `@Directive` with `TemplateRef` + `ViewContainerRef`
- Drop `link` function; use `ngOnInit` / `ngOnChanges` lifecycle hooks instead

### Dependency Injection
- `$inject` annotations → `inject()` function at class field level (not constructor injection)
- `angular.module(...).run()` → `APP_INITIALIZER` provider
- `angular.module(...).config()` → `APP_INITIALIZER` or module `providers`

### Lifecycle
| AngularJS | Angular |
|-----------|---------|
| `$onInit` | `ngOnInit` |
| `$onDestroy` | `ngOnDestroy` |
| `$onChanges` | `ngOnChanges` |
| `$postLink` | `ngAfterViewInit` |

### Two-Way Binding / Events

Prefer the **signal-based API** (Angular 17.1+) over decorators for all new code:

| AngularJS binding | Angular (signal API — preferred) | Angular (decorator API — legacy, avoid) |
|-------------------|-----------------------------------|-----------------------------------------|
| `<` one-way in | `foo = input<T>()` / `input.required<T>()` | `@Input() foo: T` |
| `&` callback | `save = output<T>()` | `@Output() save = new EventEmitter<T>()` |
| `=` two-way | `bar = model<T>()` | `@Input() bar` + `@Output() barChange` |

- Use `input.required<T>()` when the binding is mandatory.
- Use `model<T>()` to replace any AngularJS `=` (two-way) binding.

## What to Avoid
- Do NOT use `$scope` anywhere in migrated code
- Do NOT use `.controller()`, `.factory()`, `.directive()` AngularJS registration
- Do NOT mix AngularJS and Angular modules (use ngUpgrade only if explicitly required)
- Do NOT use `any` type in TypeScript unless unavoidable — infer or declare proper types

## File Naming Conventions
- Components: `feature-name.component.ts` + `.html` + `.scss`
- Services: `feature-name.service.ts`
- Pipes: `feature-name.pipe.ts`
- Directives: `feature-name.directive.ts`
- Models/interfaces: `feature-name.model.ts`

## Angular Version Target
Angular 17+ with standalone components (no NgModule unless the team decides otherwise).
Use `@if` / `@for` control flow blocks (Angular 17+) over `*ngIf` / `*ngFor` when writing new templates.

## Available Skills

Use the appropriate skill from `.agent/skills/` for every migration task. Do NOT migrate manually without consulting the relevant skill first.

| Task | Skill |
|------|-------|
| Analyze the full app before starting | `.agent/skills/pre-migration-analysis/SKILL.md` |
| Migrate a `.controller()` or `.component()` | `.agent/skills/migrate-component/SKILL.md` |
| Migrate a `.service()` or `.factory()` | `.agent/skills/migrate-service/SKILL.md` |
| Migrate `$routeProvider` / `$stateProvider` routing | `.agent/skills/migrate-route/SKILL.md` |
| Migrate a `.filter()` | `.agent/skills/migrate-filter/SKILL.md` |
| Migrate `angular.module()` bootstrap | `.agent/skills/migrate-module/SKILL.md` |
| Generate unit tests for a migrated file | `.agent/skills/generate-tests/SKILL.md` |
| Review a PR for migration correctness | `.agent/skills/pr-reviewer/SKILL.md` |

### Migration Order
Always follow this sequence:
1. Run `pre-migration-analysis` to map the full app
2. Migrate leaf services first (`migrate-service`)
3. Migrate filters (`migrate-filter`)
4. Migrate leaf components, then containers (`migrate-component`)
5. Migrate routing (`migrate-route`)
6. Migrate the module bootstrap last (`migrate-module`)
7. Generate tests throughout (`generate-tests`)
