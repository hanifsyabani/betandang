# AGENTS.md

## Project Overview

Pojok BPS Muba is an information and statistics service website for Badan Pusat
Statistik (BPS) Kabupaten Musi Banyuasin, Sumatera Selatan.

The project has moved from prototype to website development. Build for residents,
local government, academics, researchers, and businesses. Write content around
their information and service needs.

## Current Phase

Website development. Current implementation:

- The Svelte frontend and client-side pages are available.
- Public statistics, profile, contacts, and activity summaries reference BPS
  sources. Local content is not automatically synchronized with those sources.
- Service links lead to existing official BPS channels.
- DTSEN forms use Zod validation and an Axios service for create only.
  All APIs, database access, Storage, and application management belong to Satu
  Portal. Its DTSEN create endpoint has not been implemented yet. Submission
  stays disabled until `VITE_DTSEN_CREATE_URL` is configured. There are no
  applicant accounts or integration with official DTSEN decisions.
- The admin dashboard uses explicitly labeled sample records. Authentication and
  management of actual applications are not connected.
- This repository contains only the frontend, directly at the project root.
  The local API and workspace packages have been removed. Keep backend code,
  database migrations, and private Storage in the separate Satu Portal project.

Focus on:

- UI/UX
- Responsive layout
- Navigation
- Interactive frontend components
- Forms with truthful completion states
- Admin dashboard
- Verified public content and clearly labeled temporary sample data
- Loading, empty, and error states where useful

Do not describe the entire website as a prototype or unfinished features as
operational. Implement backend, database, authentication, storage, and integrations
when the requested task includes that work. A content update alone does not
require implementing those features.

## Current Stack

Follow the stack that exists in `README.md`:

- Bun single-package frontend project
- Svelte + Vite
- TypeScript
- Tailwind CSS 4 via the Vite plugin
- Shared BPS theme tokens in `src/app.css`
- shadcn-svelte and Bits UI components in `src/lib/components/ui`
- External Satu Portal API for DTSEN create; database and private Storage stay
  in that backend
- Zod schemas in `src/schemas/desil.ts`
- Frontend Axios service in `src/services/`

Do not migrate to SvelteKit or replace the installed UI or chart libraries unless that
migration is explicitly requested. Do not add dependencies for work that can be
handled with the current stack.

Use Tailwind utilities for page and component styling. Keep shared theme tokens
and reusable utilities in `src/app.css`.

## Website Scope

The website covers these sections:

```text
Pojok BPS Muba
|-- Beranda
|-- Profil BPS
|-- Statistik & Data
|-- Layanan
|-- Perbaikan Data Desil
|-- Kegiatan
`-- Admin Dashboard
```

Each navigation item has a separate client-side route and page component.
`App.svelte` owns routing state, while `nav-bottom.svelte` renders the active page.

## Content And Data

Centralize local content, data, and configuration in:

```text
src/constants/
```

Do not scatter large datasets directly inside Svelte components.
Keep data strongly typed.
Keep frontend type definitions and component props in `src/types/`.
Mutable form state must use copies of constant templates.

The existing `prototype.ts` filenames are legacy names, not the project phase.

- Use clear, professional Indonesian directed at website users.
- Replace presentation and UI demonstration copy with relevant institutional,
  statistical, or service information.
- Verify statistics, periods, units, geography, contacts, activities, organization,
  and official service requirements against sources listed in `README.md`.
- Show source links and reference periods for public statistics and activities.
- Distinguish population projections from administrative population records.
- Do not invent statistics, schedules, officials, application IDs, or service
  guarantees. Show an unavailable state when information is missing.
- Label remaining sample records as `Data contoh` or `Data latihan`. Removing a
  label does not make sample data official.
- Messages must reflect the actual outcome. A local review is not a submitted
  application. Show success only for the action that really completed.
- Do not claim this is the officially published institution website without
  verified authorization.

## Color System

Use the current BPS palette from `src/app.css`:

```text
Sky Blue  #2D95CA
Green     #75B547
Orange    #E28939
Ink       #102033
Base      #F8FAFC
Surface   #FFFFFF
Text      #334155
```

Do not hardcode one-off colors inside components unless there is a clear local
reason. Prefer CSS variables.

## UI Direction

The website should feel like a modern Indonesian government institution site:

- Professional
- Clean
- Trustworthy
- Data-oriented
- Accessible
- Responsive

Avoid:

- Startup-style marketing pages
- Excessive gradients
- Glassmorphism
- Decorative animation
- Rounded cards everywhere
- Claims that sound official but have not been verified

Content and data should stay visually primary.

## Forms

Forms should have:

- Clear labels
- Required indicators
- Validation messages or validation feedback
- Focus states
- Success states
- Disabled/loading states

For the current Perbaikan Data Desil implementation:

- Keep form state, validation, files, and service calls in
  `src/components/dtsen/form-dtsen.svelte`; the page owns layout only.
- Use shadcn controls with BPS theme tokens. Submit opens an AlertDialog
  confirmation before the API request; there is no separate review step.
- Validate documents before submission, up to 5 MB per file.
- Allow removing a selected file.
- Validate PDF, JPG, JPEG, and PNG.
- Confirm storage only after the API succeeds. Preserve form data on errors.
- This website only calls create. Keep reads, updates, deletion, downloads, and
  applicant management in Satu Portal. Do not generate browser-session bearer
  credentials. Use the complete endpoint URL from `VITE_DTSEN_CREATE_URL` with
  no fallback to a local API, and show an unavailable state when it is absent.
- A database UUID identifies the stored application, not an official registration
  or acknowledgment by an officer. Storage does not change DTSEN decile decisions.
- Require owner credentials for application reads, updates, deletion, and downloads.
  Keep Storage private and server secrets out of the frontend.
- Verify official procedure and requirements before claiming institutional processing.

## Admin Dashboard

The admin dashboard currently uses clearly labeled sample records. Maintain:

- KPI cards
- Pengajuan Desil table
- Search
- Status filter
- Status badges
- Pagination UI
- Detail buttons with useful feedback

Counts and pagination must match the displayed dataset. Actual applicant data
requires authentication, authorization, and privacy controls as part of the task
that introduces it.

## Accessibility

Use semantic HTML where practical:

```html
<header>
<nav>
<main>
<section>
<article>
<footer>
```

Use buttons for actions and links for navigation. Form inputs must have visible
labels. Do not rely only on color to communicate status.
Charts must expose their values and units in an accessible text alternative.

## Definition of Done

A frontend change is complete when:

- The requested behavior works with its intended data source.
- Public facts have verifiable sources and appropriate reporting periods.
- Sample data and unavailable services are accurately identified.
- It is responsive.
- TypeScript and the build pass.
- Important empty/loading/error states are considered when relevant.
- No unnecessary dependency is added.
- Existing flows and user changes are preserved.

## Most Important Rule

This is website development for BPS Kabupaten Musi Banyuasin.

Prioritize:

```text
Content accuracy -> Visual quality -> User experience -> Reliable behavior -> Responsive design -> Maintainable code
```

Develop according to the requested scope and the actual state of integrations.
Keep documentation current as capabilities become available.
