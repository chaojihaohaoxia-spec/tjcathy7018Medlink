# MedLink Codex Handoff

This file is a continuity note for opening a new Codex window/model. It summarizes the active project, prior decisions, current implementation status, and the most recent edits so the new conversation can continue without losing context.

## Workspace

- Main workspace root: `/Users/xiaotan/Documents/Codex/2026.4 web design`
- Next.js project folder: `/Users/xiaotan/Documents/Codex/2026.4 web design/coding pages`
- Current app URL used in browser: `http://localhost:3000`
- Tech stack: Next.js 14 App Router, TypeScript, Tailwind CSS, lucide-react, Framer Motion, Recharts, shadcn/ui-style local components.
- Do not install `three.js`, `i18next`, or external i18n libraries.

## User Preferences And Guardrails

- The user often gives strict file scopes. Respect them exactly.
- Do not regenerate or overwrite previous batch files unless the user explicitly asks.
- When a prompt says “only modify these files,” do not touch any other file.
- Preserve mock data and logic unless specifically requested.
- Run `npm run lint` and `npm run build` after code changes when requested.
- The project is based in mainland China, pilot city Chengdu. Avoid Hong Kong/Taiwan/non-mainland institutions in mock hospitals or locations.
- Patient-facing pages should avoid visible technical terms such as smart contract, blockchain, IPFS, hash, DID, Hyperledger, FHIR, audit trail, or on-chain. Use plain patient language instead.

## Current High-Level Product

MedLink is a university fintech innovation prototype for a blockchain + AI patient care coordination platform. It has three role paths:

- Patient: simplified patient journey.
- Business Partner: B2B partnership/pricing page.
- Developer / Evaluator: full technical platform view.

Role selection is stored in `localStorage` using `medlink_role`.

## Major Implemented Areas

### Core App Skeleton

Implemented project structure under:

- `app/`
- `components/layout/`
- `components/support/`
- `data/`
- `services/`
- `contexts/`

Important files include:

- `app/layout.tsx`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/journey/page.tsx`
- `app/medichain/page.tsx`
- `app/mediroute/page.tsx`
- `app/medirx/page.tsx`
- `app/explorer/page.tsx`
- `app/dashboard/page.tsx`
- `app/technology/page.tsx`
- `app/business/page.tsx`
- `app/partners/page.tsx`
- `app/role-select/page.tsx`
- `components/layout/Navbar.tsx`
- `components/layout/Sidebar.tsx`
- `components/support/SupportChat.tsx`
- `contexts/LanguageContext.tsx`
- `contexts/AuthContext.tsx`
- `data/translations.ts`
- `data/mockHospitals.ts`
- `data/mockPatients.ts`
- `data/mockMedicines.ts`
- `services/authService.ts`
- `services/blockchainService.ts`
- `services/triageService.ts`
- `services/prescriptionService.ts`

### Pages

- Landing page: hero, pain points, solution flow, comparison table, footer.
- Login/Register: verification code demo, demo patient bypass to `/journey`.
- Patient Journey: 7-step patient flow, now consumer-friendly.
- MediChain: record vault demo.
- MediRoute: AI triage playground.
- MediRx: prescription routing.
- Explorer: transaction table and live mode.
- Dashboard: hospital admin dashboard with Recharts.
- Technology: layered architecture and animated data flow.
- Business: target customers, revenue streams, financial projection, GTM timeline.
- Partners: B2B SaaS partnership/pricing page.
- Role Select: patient/business/professional role cards.
- 404 page exists.

## Visual Theme

The app was redesigned from dark navy to a clean light healthcare SaaS theme.

Main palette:

- Page background: `#F8FAFC`
- Cards: white with `border-slate-200`, `shadow-sm`, rounded-xl.
- Primary accent: sky blue `#0EA5E9`.
- Secondary accent: emerald `#10B981`.
- Text: slate family.
- Status colors: emerald success, amber warning, red danger, sky info.

Glassmorphism dark styling was mostly replaced with clean light cards. Some class names like `glass-card` or `glass-button` may still exist as semantic CSS utilities, but visually they should map to the light theme.

## Language / Translation Status

Language context supports:

- `en`
- `zh-CN`
- `zh-TW`
- `ko`

The app has had multiple translation passes. Many common UI strings are in `data/translations.ts`.

Important caveat:

- Some pages, especially `app/journey/page.tsx`, use local copy objects for Chinese/English rather than the global `translations.ts`.
- In `app/journey/page.tsx`, `zh-CN` and `zh-TW` use Chinese copy; `en` and `ko` currently fall back to English copy.
- Prior user request: English/Korean views should not show Chinese in parentheses. Chinese bracket labels should only appear in Chinese views.

## Mainland China / Chengdu Hospital Data

`data/mockHospitals.ts` was corrected to Chengdu/Sichuan institutions:

- West China Hospital, Sichuan University
- Chengdu Second People's Hospital
- Chengdu Jinjiang District Community Health Center
- Sichuan Cancer Hospital
- Chengdu Xinhua Community Clinic

English hospital level labels should be:

- `Class A Tertiary Hospital (Top-Tier)`
- `Class B Secondary Hospital`
- `Primary Care Clinic`
- `Class A Specialist Hospital`

Chinese views keep Chinese level names.

## Role-Based Navigation

`components/layout/Navbar.tsx` and `components/layout/Sidebar.tsx` were updated for roles:

- `patient`: Navbar shows Patient Journey and Support; hides technical pages.
- `business`: Navbar shows partner page anchors/packages/contact/switch role.
- `professional`: shows full platform navigation and sidebar.

All roles should show a Switch Role control that clears role selection and returns to `/role-select`.

`app/layout.tsx` redirects first visit with no `medlink_role` to `/role-select`.

## Recent Important Fixes

### Server Error From Bad Import

There was a previous server error:

`Error: Cannot find module './245.js'`

It appeared after role-select work. This was likely from stale Next build/runtime chunks and has since been handled enough for the app to compile.

### MediChain Vault Layout

The encrypted vault visual in `app/medichain/page.tsx` was fixed:

- Removed overlapping absolute positioning.
- Changed to vertical flow: File icon -> arrow -> hash line -> arrow -> blockchain node.
- Added labels and padding.

### Business Page Revenue Streams

`Commercial Insurers` was removed from target customers and revenue streams. Correct revenue stream ownership:

- SaaS Hospital Subscription: tertiary and secondary hospitals.
- Drug Batch Blockchain Certification Fee: pharmaceutical distributors and high-value drug manufacturers, not insurers or patients.
- AI Triage API Subscription: hospitals and medical networks.
- De-identified Data Authorization: pharma R&D, CROs, academic institutions.
- CaaS: health insurance bureaus and regulators.

## Current Latest Task Completed

The latest user request was to fix three logic and UX issues in `app/journey/page.tsx` only.

Completed:

1. Step 1 family member profiles are always visible.
   - Removed expand/collapse behavior.
   - The right-side family card always shows:
     - `Mr. Wang Jianguo (Father)` · Age 78 · Diabetes
     - `Wang Xiaomei (Daughter)` · Age 8 · Sulfa drug allergy
   - Clicking either sub-profile selects it and enables Next.
   - `Ms. Wang Fang` self card remains selectable.

2. Step 2 was restructured according to the corrected flow.
   - The recipient selector was removed entirely because the user clarified patients should not select a hospital before triage.
   - Step 2 is now `Prepare Your Records`.
   - It only asks:
     - Which record types to prepare/share.
     - How long to prepare/share for.
   - Added patient-facing explanation:
     - Selected records will help MedLink find the right care.
     - After the system suggests a clinic/hospital, the patient can choose whether to share records directly.
   - Button text: `Prepare My Records`.
   - Success message: records are ready and MedLink will use them to find the right care.

3. Step 4 now asks for hospital-specific sharing after triage.
   - After a recommendation appears, a new card asks:
     - `Share your records with this hospital?`
   - Buttons:
     - `Yes, share my records with [hospital]`
     - `I'll decide later`
   - Yes flow:
     - 1-second loading animation.
     - Green success chip: records shared with hospital.
     - Adds an entry to session audit state.
   - Later flow:
     - Shows note that the patient can share records at clinic reception.
     - Adds a deferred sharing entry to session audit state.

4. Step 5 care plan reflects the Step 4 decision.
   - If shared: says no paper records needed and doctor can view records directly.
   - If not shared/later: says bring a summary or share at clinic reception.

Verification for latest task:

- `npm run lint` passed.
- `npm run build` passed.

## Latest Verification Output Summary

`npm run lint`:

- `✔ No ESLint warnings or errors`

`npm run build`:

- Production build compiled successfully.
- Static routes generated successfully, including:
  - `/`
  - `/journey`
  - `/login`
  - `/medichain`
  - `/mediroute`
  - `/medirx`
  - `/explorer`
  - `/dashboard`
  - `/partners`
  - `/role-select`
  - `/technology`
  - `/business`

## Suggested Next Steps For New Codex Window

When continuing in a new Codex window:

1. Open `/Users/xiaotan/Documents/Codex/2026.4 web design/coding pages`.
2. Read this file first.
3. If asked to change a page, inspect the exact file before editing.
4. Keep edits scoped to the files named by the user.
5. Run `npm run lint` and `npm run build` after significant changes or when requested.
6. For patient-facing UX, keep text plain and non-technical.

## Commands Useful For Continuation

```bash
cd "/Users/xiaotan/Documents/Codex/2026.4 web design/coding pages"
npm run dev
npm run lint
npm run build
```

If the local site needs to be opened in the in-app browser, use:

`http://localhost:3000`

