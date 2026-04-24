# UI Component Map — Real Estate Board

All three pages share the `AppShell` (defined in `index.html`) and use `<ng-view>` for the routed content area.

---

## AppShell (index.html)

```
AppShell
├── NavBar
│   ├── Logo / site name → links to /#/properties
│   ├── Nav link: "Properties" → /#/properties
│   ├── Nav link: "Favorites" → /#/favorites
│   └── FavoriteBadge — shows count from FavoritesService.getCount()
└── <ng-view>   ← routed content renders here
```

---

## Page: Listing (`/#/properties`)

**Controller:** `ListingController`  
**Template:** `views/listing/listing.html`

```
ListingView
├── FilterPanel directive  (<filter-panel>)
│   ├── KeywordInput        text, ng-model → FilterService.filters.keyword
│   ├── TypeSelect          options: Any / House / Apartment / Condo / Commercial / Land
│   ├── StatusSelect        options: Any / For Sale / For Rent / Sold / Under Offer
│   ├── LocationSelect      options populated from GET /api/locations
│   ├── BedroomsMinSelect   options: Any / 1+ / 2+ / 3+ / 4+ / 5+
│   ├── PriceRangeSlider directive (<price-range-slider>)
│   │   ├── PriceMin number input
│   │   └── PriceMax number input
│   └── ClearFiltersButton  calls FilterService.resetFilters()
│
├── ResultsBar
│   ├── ResultsSummary      "Showing X of Y properties"
│   └── SortControl         select: Price (Low→High) / Price (High→Low) / Newest / Most Bedrooms
│
└── PropertyGrid            ng-repeat over filtered+sorted properties
    └── PropertyCard directive  (<property-card property="prop">)   × N
        ├── ThumbnailImage      property.images[0], fallback to placeholder
        ├── StatusBadge directive  (<status-badge status="property.status">)
        │   └── Pill: "For Sale" (green) / "For Rent" (blue) / "Sold" (grey) / "Under Offer" (amber)
        ├── Price               formatted: "$1,250,000" or "$2,400/mo"
        ├── Title               property.title
        ├── AddressLine         property.address.suburb + ", " + property.address.city
        ├── StatsRow
        │   ├── BedroomCount    icon + number (hidden if 0)
        │   ├── BathroomCount   icon + number (hidden if 0)
        │   └── AreaSqft        icon + number + "sqft"
        ├── FavoriteToggle      heart button; filled if FavoritesService.isFavorite(id)
        └── ViewDetailsLink     → /#/properties/:id
```

**Empty state:** shown when `properties.length === 0` — message + "Clear filters" CTA.

---

## Page: Detail (`/#/properties/:id`)

**Controller:** `DetailController`  
**Template:** `views/detail/detail.html`

```
DetailView
├── BreadcrumbNav           "All Properties > [property.title]"
│
├── ImageGallery
│   ├── MainImage           large display; ng-click on thumbnail swaps it
│   └── ThumbnailStrip      ng-repeat over property.images (max 5 shown)
│
├── PropertyHeader
│   ├── Title               property.title
│   ├── StatusBadge directive
│   ├── PriceDisplay        formatted price + priceType label ("/ month", "/ week", or sale price)
│   └── FullAddress         street, suburb, city, state, postcode
│
├── StatsGrid
│   ├── Bedrooms            (hidden if 0)
│   ├── Bathrooms           (hidden if 0)
│   ├── ParkingSpaces       (hidden if 0)
│   ├── AreaSqft
│   └── YearBuilt
│
├── DescriptionSection      property.description (paragraph text)
│
├── FeaturesList            ng-repeat over property.features as pill/chip tags
│
├── MapEmbed                <iframe> Google Maps embed using property.coordinates.lat + lng
│
├── AgentCard
│   ├── AgentPhoto          agent.photo
│   ├── AgentName           agent.name
│   ├── AgentTitle          agent.title
│   ├── AgencyName          agent.agency
│   ├── PhoneLink           tel: link
│   ├── EmailLink           mailto: link
│   └── ContactForm directive  (<contact-form agent="agent">)
│       ├── NameInput           required
│       ├── EmailInput          required, type="email"
│       ├── PhoneInput          optional
│       ├── MessageTextarea     required
│       ├── PreferredContactRadio   email | phone
│       ├── ViewingDatePicker   type="date", optional
│       ├── ValidationMessages  shown on submit if $invalid
│       ├── SubmitButton        disabled while $invalid (optional UX choice)
│       └── SuccessBanner       shown after valid submit; hides form
│
└── RelatedProperties
    └── PropertyCard × 3    same location or type, excluding current property
```

---

## Page: Favorites (`/#/favorites`)

**Controller:** `FavoritesController`  
**Template:** `views/favorites/favorites.html`

```
FavoritesView
├── PageHeading             "Your Saved Properties"
├── FavoritesCount          "X properties saved"
│
├── [if favorites.length === 0]
│   EmptyState
│   ├── Icon / illustration
│   ├── Message             "You haven't saved any properties yet."
│   └── CTALink             "Browse all properties" → /#/properties
│
└── [if favorites.length > 0]
    PropertyGrid
    └── PropertyCard × N    same directive as listing page; heart always filled
```

---

## Component Inventory

| Component | Type | File | Isolate Scope |
|-----------|------|------|---------------|
| `propertyCard` | directive | `components/property-card/property-card.directive.js` | `{ property: '=' }` |
| `statusBadge` | directive | `components/badge/badge.directive.js` | `{ status: '@' }` |
| `filterPanel` | directive | `components/filter-panel/filter-panel.directive.js` | none (uses FilterService directly) |
| `priceRangeSlider` | directive | `components/price-range-slider/price-range-slider.directive.js` | none |
| `contactForm` | directive | `components/contact-form/contact-form.directive.js` | `{ agent: '=' }` |
| `ListingController` | controller | `views/listing/listing.controller.js` | — |
| `DetailController` | controller | `views/detail/detail.controller.js` | — |
| `FavoritesController` | controller | `views/favorites/favorites.controller.js` | — |
| `PropertyService` | service | `services/property.service.js` | — |
| `AgentService` | service | `services/agent.service.js` | — |
| `FilterService` | service | `services/filter.service.js` | — |
| `FavoritesService` | service | `services/favorites.service.js` | — |
