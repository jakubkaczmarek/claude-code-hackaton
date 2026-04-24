# Architecture — Real Estate Board

## System Topology

```
┌─────────────────────────────────────────┐
│           Browser (AngularJS SPA)        │
│                                          │
│  /#/properties        ListingController  │
│  /#/properties/:id    DetailController   │
│  /#/favorites         FavoritesController│
└────────────────┬────────────────────────┘
                 │ HTTP (localhost:3000)
                 │  GET /api/properties
                 │  GET /api/properties/:id
                 │  GET /api/agents
                 │  GET /api/agents/:id
                 │  GET /api/locations
                 │  GET / (static files)
                 ▼
┌─────────────────────────────────────────┐
│         Node.js / Express (port 3000)    │
│                                          │
│  express.static → /legacy/app/           │
│  /api/* routes → read JSON files         │
└────────────────┬────────────────────────┘
                 │ fs.readFileSync
                 ▼
┌─────────────────────────────────────────┐
│           Static JSON files              │
│  /legacy/data/properties.json            │
│  /legacy/data/agents.json                │
│  /legacy/data/locations.json             │
└─────────────────────────────────────────┘
```

---

## Request Flow — Listing Page

1. Browser navigates to `http://localhost:3000` (or `/#/properties`).
2. Express serves `/legacy/app/index.html` as a static file.
3. AngularJS bootstraps; `$routeProvider` matches `/properties`, activates `ListingController`.
4. `ListingController` calls `PropertyService.getAll()`.
5. `PropertyService` fires `$http.get('/api/properties')`.
6. Express reads `data/properties.json` and responds with the full JSON array.
7. `PropertyService` caches the response in memory.
8. `ListingController` stores the array, passes it through `FilterService.apply()`.
9. `ng-repeat` renders one `<property-card>` directive per result.
10. User changes a filter input → `FilterService` state updates → `$rootScope.$broadcast('filtersChanged')` → controller re-runs `FilterService.apply()` on the cached array → grid re-renders. **No new HTTP call.**

## Request Flow — Detail Page

1. User clicks a property card; AngularJS routes to `/#/properties/:id`.
2. `DetailController` reads `:id` from `$routeParams`.
3. Calls `PropertyService.getById(id)` → `$http.get('/api/properties/' + id)`.
4. Express reads `properties.json`, finds the matching object by `id`, returns it as JSON (404 if not found).
5. Controller then calls `AgentService.getById(property.agentId)`.
6. For related properties: calls `PropertyService.getAll()` — returns from cache synchronously.
7. View renders image gallery, stats, description, features, map iframe, agent card, and contact form.

---

## Routing Table

| Path | Controller | Template |
|------|-----------|----------|
| `/properties` | `ListingController` | `views/listing/listing.html` |
| `/properties/:id` | `DetailController` | `views/detail/detail.html` |
| `/favorites` | `FavoritesController` | `views/favorites/favorites.html` |
| (otherwise) | — | redirect to `/properties` |

Routing uses **hash-based mode** (`#`) — the default for AngularJS 1.x `ngRoute`. No `$locationProvider.html5Mode` configuration needed; URLs look like `http://localhost:3000/#/properties/prop-001`.

---

## State Management

No Flux/Redux. Simple, explicit state flow:

| State | Owner | Scope |
|-------|-------|-------|
| Property list and detail | `PropertyService` (in-memory cache) | App lifetime |
| Active filter criteria | `FilterService` singleton | App lifetime |
| Favorited property IDs | `FavoritesService` + `localStorage` | Persistent across sessions |
| Current page data | `$scope` on each controller | Route lifetime |
| Contact form fields | `$scope` on `DetailController` / `contactForm` directive | Route lifetime |

Cross-view communication uses `$rootScope.$broadcast('filtersChanged')` — the listing controller listens and re-renders. All other state is local to the controller that owns it.

---

## Technology Choices

| Concern | Choice | Reason |
|---------|--------|--------|
| Frontend framework | AngularJS 1.8.3 | Intentionally legacy first version |
| Routing | `ngRoute` (`angular-route`) | Sufficient for 3 routes; no need for `ui-router` |
| HTTP | `$http` (built-in) | No external dependency needed |
| HTML sanitization | `ngSanitize` | Safe rendering if description ever contains HTML |
| Styling | Plain CSS (BEM-like class names) | No preprocessor; keeps stack truly minimal |
| Build tool | None | Script tags in `index.html` in load order; authentic to the legacy pattern |
| Backend | Express 4.x | Minimal; 50 lines for all routes |
| Data persistence | Static JSON files | No database; zero infrastructure |
| Favorites storage | `localStorage` | No auth = no user identity; only viable client option |
