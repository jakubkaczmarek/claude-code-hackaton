# Product Overview — Real Estate Board

## Purpose

A browser-based property listing board for browsing, filtering, and enquiring about residential and commercial real estate. The v1 implementation uses AngularJS 1.x on the frontend and a Node.js/Express server serving static JSON data.

## Target Users

- Prospective **buyers** looking for properties for sale
- Prospective **renters** looking for properties to rent
- **Agents** who need a simple public-facing board to showcase listings

## MVP Scope

**In scope:**
- Property listing grid with card-based UI
- Client-side filtering (price, type, location, bedrooms, keyword)
- Property detail page (images, full description, map, agent info)
- Contact agent form (client-side only — no email delivery)
- Favorites list persisted to `localStorage`

**Out of scope for v1:**
- User accounts / authentication
- Server-side search or saved searches
- Payment or booking flows
- Map clustering or geospatial search
- Multi-language support
- CMS or agent admin panel

---

## User Stories

| # | As a | I want to | So that |
|---|------|-----------|---------|
| US-01 | buyer | see all available properties in a card grid | I can browse quickly at a glance |
| US-02 | buyer | filter properties by price range, type, location, and bedrooms | I only see listings that match my criteria |
| US-03 | buyer | click a property card to view full details | I can see photos, description, features, and a map |
| US-04 | buyer | fill out a contact form on the detail page | I can request a viewing from the listing agent |
| US-05 | buyer | save properties to a favorites list | I can compare shortlisted properties later |
| US-06 | buyer | see a clear "no results" empty state when no properties match | I know the filters are working and I'm not missing data |
| US-07 | agent | see contact form submissions acknowledged in the UI | I can confirm the form is functional during demos |

---

## Acceptance Criteria Summary

- Listing page loads in under 2 seconds on localhost
- Filter changes update the grid without a page reload
- Contact form shows inline validation errors before submit
- Successful form submit shows a confirmation message and logs data to the browser console
- Favorited properties persist after a full page refresh (F5)
- Layout is readable on a 375px wide mobile viewport (single column)
- All 12 seed properties are visible when no filters are active
