---
name: Pre-Migration Analysis
description: Analyses the full AngularJS application and produces a migration map — component tree, service dependency graph, route structure, and a prioritised migration backlog. Run once before starting migration.
---

# Pre-Migration Analysis

Analyse the AngularJS application and produce a complete migration map.

Run this skill once at the start of the migration, before touching any code.

---

## Step 1 — Discover the Application Structure

Scan the project (focus on `src/` or the app root directory) and collect:

### 1a — Modules
Find all `angular.module(...)` declarations and `.module(name, [deps])` registrations.
List the module dependency tree.

### 1b — Components / Controllers
Find all `.controller(`, `.component(` registrations.
For each, note:
- Name
- File path
- Template file (if external)
- Dependencies injected
- Bindings (`<`, `=`, `@`, `&`)

### 1c — Services and Factories
Find all `.service(`, `.factory(`, `.provider(` registrations.
For each, note:
- Name
- File path
- Dependencies injected
- Whether it holds mutable state
- Whether it uses `$rootScope.$broadcast` / `$rootScope.$on`

### 1d — Directives
Find all `.directive(` registrations.
For each, note:
- Name
- File path
- Type: element / attribute / CSS class
- Whether it has its own template (→ migrate to `@Component`) or not (→ `@Directive`)

### 1e — Filters
Find all `.filter(` registrations.
For each, note:
- Name
- File path
- Whether an Angular built-in pipe covers it

### 1f — Routes
Find `$routeProvider` / `$stateProvider` configuration.
For each route/state, note:
- State name and URL
- Controller and template
- Resolve dependencies
- Whether it is abstract / nested
- Guard-like patterns (`onEnter`, resolve-based auth)

### 1g — Third-Party AngularJS Dependencies
Check `package.json` and `bower.json` for AngularJS ecosystem libraries:
- `angular-ui-router` — needs Angular Router
- `angular-material` — needs Angular Material
- `angular-translate` — needs `@ngx-translate` or Angular i18n
- `ui-select` — needs Angular Material Select or ng-select
- `angular-file-upload` — needs replacement
- List any others found

---

## Step 2 — Build the Dependency Graph

For each service, identify which components and other services depend on it.
Output as a text dependency tree:

```
AppModule
├── AuthService  (used by: LoginComponent, UserService, AuthGuard)
├── UserService  (used by: UserListComponent, UserDetailComponent)
│   └── depends on: AuthService, $http
├── LoginComponent
│   └── depends on: AuthService
├── UserListComponent
│   └── depends on: UserService
└── UserDetailComponent
    └── depends on: UserService, $stateParams
```

---

## Step 3 — Produce the Migration Backlog

Output a prioritised list of files to migrate, ordered by:
1. **Leaf services** (no dependencies on other custom services) — migrate first
2. **Shared services** (depended on by many components) — migrate early
3. **Leaf components** (no child components) — can be migrated independently
4. **Container/parent components** — migrate after their children
5. **Routing** — migrate after all components and services it references are done
6. **Root module / bootstrap** — migrate last

Format:

```
## Migration Backlog

### Phase 1 — Leaf Services (no custom deps)
[ ] src/app/auth/auth.service.js          → auth.service.ts          (skill: migrate-service)
[ ] src/app/utils/date-format.filter.js   → date-format.pipe.ts      (skill: migrate-filter)

### Phase 2 — Shared Services
[ ] src/app/users/user.service.js         → user.service.ts          (skill: migrate-service)

### Phase 3 — Leaf Components
[ ] src/app/users/user-card.component.js  → user-card.component.ts   (skill: migrate-component)
[ ] src/app/shared/spinner.component.js   → spinner.component.ts     (skill: migrate-component)

### Phase 4 — Container Components
[ ] src/app/users/user-list.component.js  → user-list.component.ts   (skill: migrate-component)
[ ] src/app/login/login.component.js      → login.component.ts       (skill: migrate-component)

### Phase 5 — Routing
[ ] src/app/app.routes.js                 → app.routes.ts            (skill: migrate-route)

### Phase 6 — Bootstrap
[ ] src/app/app.module.js                 → main.ts + app.config.ts  (manual)
```

---

## Step 4 — Risk Assessment

Flag high-risk items that will need extra attention:

| Risk | Items | Why |
|------|-------|-----|
| `$rootScope` event bus | <list files> | No direct equivalent — needs Subject refactor |
| `$compile` / dynamic templates | <list files> | No Angular equivalent — needs redesign |
| Third-party AngularJS libs | <list packages> | May need replacement library |
| `ng-include` | <list files> | Extract to child components |
| Deeply nested `ui-router` states | <list states> | Complex child route setup required |
| Two-way `=` bindings | <list components> | Needs `@Input` + `@Output` pair |

---

## Step 5 — Output Summary

```
## Pre-Migration Analysis Complete

Application size:
  Modules:     <count>
  Components:  <count>
  Services:    <count>
  Directives:  <count>
  Filters:     <count>
  Routes:      <count>

Estimated migration effort:
  Low risk  (<straightforward 1:1 migrations>):  <count> files
  Med risk  (event bus, watchers, resolves):     <count> files
  High risk ($compile, third-party, ng-include): <count> files

Recommended first steps:
  1. <top priority item>
  2. <second priority item>
  3. <third priority item>

Skills to use:
  migrate-service    → <count> files
  migrate-component  → <count> files
  migrate-filter     → <count> files
  migrate-route      → <count> files
```
