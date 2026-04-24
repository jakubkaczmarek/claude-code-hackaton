# ADR-002: Standalone Components — No NgModule

**Status:** Accepted  
**Date:** 2026-04-24  
**Deciders:** Frontend team

---

## Context

Angular supports two component models:
1. **NgModule-based** — components must be declared in an `@NgModule`; the module declares, imports, and exports everything.
2. **Standalone** (Angular 14+, idiomatic in Angular 17) — components, directives, and pipes declare their own imports directly; no NgModule required.

Since we are migrating from scratch (no existing Angular codebase to integrate with), we choose the target model once and apply it consistently.

---

## Decision

All migrated components, directives, and pipes will use **`standalone: true`**. No `NgModule` will be created unless a third-party library specifically requires one.

Every component file will include:
```ts
@Component({
  standalone: true,
  imports: [ /* only what this component's template uses */ ],
  ...
})
```

Bootstrap uses `bootstrapApplication()` + `app.config.ts` (no `AppModule`).

---

## What We Chose Not to Do

| Option | Reason rejected |
|--------|----------------|
| NgModule-based architecture | Legacy pattern; Angular team recommends standalone for all new code since v17; no benefit for a greenfield migration |
| Mixed (some NgModule, some standalone) | Inconsistency; harder to maintain; no upside for this project |
| Feature modules as NgModules | Replaced by lazy-loaded routes with `loadComponent` / `loadChildren` pointing to standalone components |

---

## Consequences

**Positive:**
- No shared module boilerplate; each component is self-contained.
- Unused imports are tree-shaken per component, not per module.
- Easier to review: a component's template dependencies are visible in the `imports` array.
- Aligns with Angular 17+ recommended practice.

**Negative:**
- Every component must explicitly import `CommonModule` pieces it uses (e.g., `NgClass`, `AsyncPipe`) — or use Angular 17 control flow blocks (`@if`, `@for`) which need no import.
- Developers unfamiliar with standalone must learn the pattern.

**Rule encoded in `CLAUDE.md`:** "Angular 17+ with standalone components (no NgModule unless the team decides otherwise)."
