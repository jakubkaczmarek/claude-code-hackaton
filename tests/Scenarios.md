# Test Scenarios — Real Estate Board

## TS-01: Listing Page — Load All Properties
**Given** no filters are active  
**When** the listing page loads  
**Then** all 12 seed properties are displayed in the grid  
**And** the results bar shows "Showing 12 of 12 properties"

---

## TS-02: Filtering — By Type
**Given** the user selects "House" in the Type dropdown  
**When** the filter is applied  
**Then** only properties with `type = "house"` are shown  
**And** no page reload occurs

---

## TS-03: Filtering — By Status
**Given** the user selects "For Rent" in the Status dropdown  
**When** the filter is applied  
**Then** only properties with `status = "for-rent"` are shown

---

## TS-04: Filtering — By Location
**Given** the user selects a suburb in the Location dropdown  
**When** the filter is applied  
**Then** only properties matching that `location` value are shown

---

## TS-05: Filtering — By Bedrooms Minimum
**Given** the user selects "3+" in the Bedrooms dropdown  
**When** the filter is applied  
**Then** only properties with `bedrooms >= 3` are shown

---

## TS-06: Filtering — By Price Range
**Given** the user enters a min and max price  
**When** the filter is applied  
**Then** only properties with `price >= min` and `price <= max` are shown

---

## TS-07: Filtering — Keyword Search
**Given** the user types a keyword into the search input  
**When** the filter is applied  
**Then** only properties whose title, description, suburb, or city contain the keyword (case-insensitive) are shown

---

## TS-08: Filtering — Empty State
**Given** the user applies filters that match no properties  
**When** the grid renders  
**Then** an empty state message is shown with a "Clear filters" CTA

---

## TS-09: Filtering — Clear Filters
**Given** one or more filters are active  
**When** the user clicks "Clear Filters"  
**Then** all filters reset and all 12 properties are shown again

---

## TS-10: Sorting
**Given** properties are displayed  
**When** the user changes the sort control  
**Then**:
- "Price Low→High" sorts ascending by price
- "Price High→Low" sorts descending by price
- "Newest" sorts by `listedAt` descending
- "Most Bedrooms" sorts by `bedrooms` descending

---

## TS-11: Property Card Display
**Given** a property card is rendered  
**Then** it shows: thumbnail image, status badge (correct color), price (formatted), title, suburb+city, bedroom/bathroom/sqft stats, favorite toggle, and "View Details" link

---

## TS-12: Navigation to Detail Page
**Given** the user clicks "View Details" on a property card  
**When** the detail page loads  
**Then** the URL changes to `/#/properties/:id`  
**And** the correct property title, images, description, stats, features, map, and agent info are displayed

---

## TS-13: Image Gallery
**Given** the detail page is loaded  
**When** the user clicks a thumbnail  
**Then** the main image updates to the clicked thumbnail

---

## TS-14: Contact Form — Validation
**Given** the user submits the contact form with empty required fields  
**Then** inline validation errors are shown for Name, Email, and Message  
**And** the form is not submitted

---

## TS-15: Contact Form — Successful Submit
**Given** the user fills in all required fields with valid data  
**When** the form is submitted  
**Then** a success/confirmation banner is shown  
**And** the form is hidden  
**And** the data is logged to the browser console

---

## TS-16: Favorites — Add Property
**Given** the user clicks the heart/favorite toggle on a property card  
**Then** the property is added to favorites  
**And** the FavoriteBadge count in the navbar increments by 1

---

## TS-17: Favorites — Persistence After Refresh
**Given** the user has favorited one or more properties  
**When** the page is fully refreshed (F5)  
**Then** the favorited properties are still saved  
**And** the badge count is correct

---

## TS-18: Favorites Page — Populated
**Given** the user has saved properties  
**When** navigating to `/#/favorites`  
**Then** all favorited properties are displayed as cards

---

## TS-19: Favorites Page — Empty State
**Given** no properties are favorited  
**When** navigating to `/#/favorites`  
**Then** the empty state message is shown with a "Browse all properties" link

---

## TS-20: Favorites — Remove Property
**Given** a property is in favorites  
**When** the user clicks the heart toggle again  
**Then** the property is removed from favorites  
**And** the badge count decrements

---

## TS-21: Related Properties on Detail Page
**Given** the detail page is loaded  
**Then** up to 3 related properties (same location or type) are shown  
**And** the current property is excluded from the related list

---

## TS-22: API — Properties Endpoint
**Given** the backend is running  
**When** `GET /api/properties` is called  
**Then** a JSON array of 12 properties is returned with correct schema

---

## TS-23: API — Property Not Found
**Given** the backend is running  
**When** `GET /api/properties/nonexistent-id` is called  
**Then** a 404 response is returned

---

## TS-24: Routing — Default Redirect
**Given** the user navigates to an unknown route  
**Then** they are redirected to `/#/properties`

---

## TS-25: Responsive Layout
**Given** the viewport is 375px wide  
**Then** the property grid renders as a single column  
**And** all content remains readable
