# ADR-004: Change Detection — OnPush Mandatory on All Components

**Status:** Accepted  
**Date:** 2026-04-24  
**Deciders:** Frontend team

---

## Context

Angular's default change detection (`ChangeDetectionStrategy.Default`) checks every component in the tree on every event — equivalent to AngularJS dirty-checking. While safe, it produces the same performance profile that made large AngularJS apps sluggish.

`ChangeDetectionStrategy.OnPush` restricts checks to components whose inputs have changed (by reference), whose signals have changed, or that explicitly mark themselves dirty. It is more efficient but requires discipline: mutable objects passed as inputs must be replaced, not mutated in place.

Since we are writing all components fresh during migration (not porting behavior exactly), we can enforce this consistently from the start.

---

## Decision

**Every migrated `@Component` must use `ChangeDetectionStrategy.OnPush`.**

```ts
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
```

This is non-negotiable. The `pr-reviewer` skill and `/audit` command both check for violations.

### Why this is safe with Signals

Angular 17 Signals trigger OnPush updates automatically — a component using `signal()` values in its template is notified when they change without any extra plumbing. This removes the main friction point of OnPush (manually calling `markForCheck()`).

### When `markForCheck()` is still needed

Only when subscribing to observables manually inside lifecycle hooks and updating a non-signal property. Prefer `toSignal()` to eliminate this case.

---

## What We Chose Not to Do

| Option | Reason rejected |
|--------|----------------|
| Default change detection | Same performance failure mode as AngularJS dirty-checking; defeats the purpose of migration |
| OnPush opt-in (per developer discretion) | Inconsistent; components interact and a single Default component can force the entire tree to re-check |
| OnPush only on container components | Leaf components re-render frequently; they benefit most from OnPush |

---

## Consequences

**Positive:**
- Application performance is structurally better than the AngularJS original.
- Forces immutable data practices: inputs are replaced, not mutated.
- Signals make OnPush ergonomic — most components need no manual change detection calls.

**Negative:**
- Developers must replace input objects rather than mutate them: `this.items = [...this.items, newItem]` not `this.items.push(newItem)`.
- Debugging change detection issues is harder than with Default.
- AngularJS `$watch`-style deep object observation has no equivalent — shallow reference comparison only (mitigated by using signals).

**Rule encoded in `CLAUDE.md`:** Every component must use `ChangeDetectionStrategy.OnPush`.  
**Enforced by:** `pr-reviewer` skill review criteria and the `/audit` command pattern scan.
