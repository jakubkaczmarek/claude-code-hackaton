# Data Model — Real Estate Board

All data is stored as static JSON files in `/legacy/data/`. The server reads these files on every request (or they can be cached in memory in production).

---

## Property

**File:** `data/properties.json` — array of property objects.

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "house | apartment | condo | commercial | land",
  "status": "for-sale | for-rent | sold | under-offer",
  "price": "number (USD, no symbol)",
  "priceType": "sale | monthly | weekly",
  "bedrooms": "number (0 for commercial or land)",
  "bathrooms": "number",
  "parkingSpaces": "number",
  "areaSqft": "number",
  "address": {
    "street": "string",
    "suburb": "string",
    "city": "string",
    "state": "string",
    "postcode": "string",
    "country": "string"
  },
  "location": "string (suburb name — must match a name in locations.json)",
  "coordinates": {
    "lat": "number",
    "lng": "number"
  },
  "images": ["string (URL)"],
  "agentId": "string (foreign key into agents.json)",
  "features": ["string"],
  "yearBuilt": "number",
  "listedAt": "string (ISO 8601 date, e.g. '2024-11-15')"
}
```

**Enum constraints:**

| Field | Allowed values |
|-------|---------------|
| `type` | `house`, `apartment`, `condo`, `commercial`, `land` |
| `status` | `for-sale`, `for-rent`, `sold`, `under-offer` |
| `priceType` | `sale` (one-time), `monthly` (rent), `weekly` (rent) |

**Rules:**
- `priceType` must align with `status`: `for-sale` / `sold` / `under-offer` → `sale`; `for-rent` → `monthly` or `weekly`
- `bedrooms` and `bathrooms` are `0` for `commercial` and `land` types
- `images` array must contain at least one URL; the first element is used as the thumbnail
- `agentId` must reference a valid `id` in `agents.json`
- `location` must exactly match a `name` field in `locations.json`

---

## Agent

**File:** `data/agents.json` — array of agent objects.

```json
{
  "id": "string",
  "name": "string",
  "title": "string (e.g. 'Senior Property Consultant')",
  "email": "string",
  "phone": "string",
  "bio": "string",
  "photo": "string (URL)",
  "agency": "string",
  "agencyLogo": "string (URL)"
}
```

---

## Location

**File:** `data/locations.json` — array of location objects used to populate the filter dropdown.

```json
{
  "id": "string",
  "name": "string (display name — must match property.location values)",
  "city": "string",
  "state": "string"
}
```

---

## Client-Side Filter Model

Not persisted to disk. Held in `FilterService` in memory.

```json
{
  "keyword": "string | null",
  "type": "string | null",
  "status": "string | null",
  "location": "string | null",
  "bedroomsMin": "number | null",
  "priceMin": "number | null",
  "priceMax": "number | null",
  "sortKey": "price-asc | price-desc | newest | bedrooms-desc"
}
```

**Filter application logic** (in `FilterService.apply(properties, filters)`):

| Filter field | Logic |
|-------------|-------|
| `keyword` | case-insensitive includes match against `title + description + address.suburb + address.city` |
| `type` | strict equality; skip if null |
| `status` | strict equality; skip if null |
| `location` | strict equality against `property.location`; skip if null |
| `bedroomsMin` | `property.bedrooms >= bedroomsMin`; skip if null |
| `priceMin` | `property.price >= priceMin`; skip if null |
| `priceMax` | `property.price <= priceMax`; skip if null |

**Sort keys:**

| Key | Comparator |
|-----|-----------|
| `price-asc` | ascending price |
| `price-desc` | descending price |
| `newest` | descending `listedAt` (string ISO date sort) |
| `bedrooms-desc` | descending bedrooms |

---

## Seed Data Requirements

Minimum required for meaningful filter demonstration:

| Dimension | Requirement |
|-----------|-------------|
| Total properties | 12 |
| Types covered | all 5 (house, apartment, condo, commercial, land) |
| Statuses covered | all 4 (for-sale, for-rent, sold, under-offer) |
| Price range | $180,000 – $2,500,000 |
| Locations | 6 distinct suburbs |
| Agents | 4 (each assigned 2–4 properties) |
| Bedroom counts | 0, 1, 2, 3, 4, 5 all represented |
