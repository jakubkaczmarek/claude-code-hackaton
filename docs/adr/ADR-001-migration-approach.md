# ADR-001: Migration Approach — Incremental File-by-File over Big-Bang Rewrite

**Status:** Accepted  
**Date:** 2026-04-24  
**Deciders:** Frontend team

---

## Context

The Northwind Logistics frontend is an AngularJS 1.x single-page application. AngularJS reached end-of-life in December 2021 and no longer receives security updates. The team must migrate to Angular 17+.

Two approaches were considered:

1. **Big-bang rewrite** — freeze AngularJS, build the full Angular app in parallel, cut over on a single date.
2. **Incremental migration** — migrate file-by-file in dependency order (services → filters → components → routing → bootstrap), keeping the AngularJS app runnable throughout.

---

## Decision

We will migrate **incrementally**, in dependency order, guided by the `pre-migration-analysis` skill and the migration backlog it produces.

Migration sequence (see `CLAUDE.md`):
1. `pre-migration-analysis` — map the full app first
2. Leaf services (`migrate-service`)
3. Filters (`migrate-filter`)
4. Leaf components, then containers (`migrate-component`)
5. Routing (`migrate-route`)
6. Bootstrap last (`migrate-module`)
7. Tests throughout (`generate-tests`)

The AngularJS app remains functional at each step. ngUpgrade is **not** used — we target a clean cut once all files are migrated.

---

## What We Chose Not to Do

| Option | Reason rejected |
|--------|----------------|
| Big-bang rewrite | Requires full domain knowledge up front; long feature freeze; high risk of behavior regression |
| ngUpgrade hybrid mode | Adds significant complexity and is a dead-end; Angular and AngularJS run simultaneously but must eventually be separated anyway |
| Auto-migration tooling (e.g., `angular-migrate`) | Generates mechanical output without applying Angular 17 idioms (OnPush, signals, standalone) |

---

## Consequences

**Positive:**
- The app is testable and runnable throughout the migration.
- Each migrated file can be reviewed independently.
- Leaf-first ordering ensures no migrated file depends on un-migrated code.

**Negative:**
- Migration takes longer than a big-bang rewrite.
- Two codebases must be understood simultaneously during the transition.
- The bootstrap file (`main.ts` + `app.config.ts`) cannot be written until everything else is migrated.
