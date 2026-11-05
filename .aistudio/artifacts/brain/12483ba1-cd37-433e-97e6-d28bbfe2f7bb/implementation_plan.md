# AI Visual Quality Inspection MVP

A web-based visual quality control MVP for manufacturing and workshop inspection workflows. Users can upload or select product images across multiple categories, run server-side vision AI inspection via Gemini, review structured Pass / Fail / Needs Review results with detailed defect cards and validated bounding-box overlays, and maintain an audit history persisted in Supabase or local persistent storage.

## User Review & Critical Decisions

> [!IMPORTANT]
> The implementation plan incorporates the following final engineering refinements:

1. **Configurable Vision Model (`gemini-3.8-flash`)**:
   - The backend uses `process.env.GEMINI_VISION_MODEL || 'gemini-3.8-flash'`, verified against `@google/genai` guidelines.
   - Model selection is isolated in a server config utility, making it configurable while defaulting to the fast, vision-capable `gemini-3.8-flash`.

2. **Rigorous Bounding Box Validation & Aspect-Ratio Alignment**:
   - Normalized coordinates `box_2d: [ymin, xmin, ymax, xmax]` must strictly satisfy:
     - `0 <= ymin < ymax <= 1000`
     - `0 <= xmin < xmax <= 1000`
   - Any coordinates that fail boundary or ordering checks are rejected and excluded from the visual overlay (while retaining the text defect description).
   - In the frontend, the image container uses exact `naturalWidth` / `naturalHeight` aspect ratio preservation and percentage-based overlay positioning (`top: (ymin/10)%`, `left: (xmin/10)%`, `width: ((xmax-xmin)/10)%`, `height: ((ymax-ymin)/10)%`) so overlays remain pixel-accurate across desktop and mobile resizing.

3. **Strict Inspection Status Rules**:
   - **PASS**: Image quality is sufficient, product is identifiable, and no visible structural or cosmetic defects are detected.
   - **FAIL**: One or more confirmed defects (Critical, Moderate, or Minor) are identified with clear visual evidence.
   - **NEEDS_REVIEW**: The image is blurry, underexposed, overexposed, occluded, low-resolution, not a recognizable product, or the visual evidence is insufficient for a reliable verdict.

4. **Private Supabase Storage & Signed URLs**:
   - The Supabase Storage bucket (`inspection-images`) is configured as **private**.
   - Image access is mediated via backend-generated temporary signed URLs (`createSignedUrl(path, 3600)`), ensuring images are not publicly scrapable while providing seamless preview in the inspection views.

5. **Explicit Storage Mode & No Silent Failover**:
   - **Local Storage Mode** is activated **only** when Supabase environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are intentionally absent.
   - If Supabase credentials **are provided**, the system strictly uses Supabase. If a network, permission, or database error occurs with configured Supabase, the API returns a clear, actionable HTTP 502/500 error instead of silently switching to local storage, preventing data fragmentation.
   - Local persistent storage is backed by `data/inspections.json` and `uploads/`, designed for environments with local disk persistence.

6. **Included Supabase SQL Setup Scripts (`docs/supabase-schema.sql`)**:
   - A complete setup script is provided in the repository defining the `inspections` table, performance indexes on `created_at` and `status`, bucket creation, and Row Level Security (RLS) policies.

7. **Security & Secrets Isolation**:
   - `.gitignore` verifies `.env` exclusion.
   - `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and all tokens remain exclusively in `server.ts`. Frontend bundles contain zero secrets.

8. **Strict Four-Page Scope & Anti-Slop Industrial Design**:
   - Four pages: **Dashboard**, **Image Inspection**, **Inspection Result**, **Inspection History**.
   - White + blue industrial aesthetic (`#F7FAFF`, `#142B4A`, `#2563EB`, `#EFF6FF`), `Plus Jakarta Sans` typography, and `font-mono tabular-nums` for all metrics.

---

## 1. Overview & Core Concept

- **What It Does**: Provides automated, first-pass visual defect screening on product photographs. Evaluators and inspectors can upload an image or choose a demo sample, select an optional product category, submit it for vision analysis, view detected defects, and browse persistent past inspection logs.
- **Target Audience / Persona**: Quality assurance leads, manufacturing evaluators, student engineers, and workshop inspectors testing automated inspection workflows.
- **Key Value**: Replaces subjective, undocumented manual checks with standardized, traceable, first-pass visual inspection records in seconds.

---

## 2. User Experience & Visual Design

The application adheres strictly to the **4-Page Simplified MVP Scope** outlined in Section 23 of the PRD:

### Four Dedicated Screens

1. **Dashboard (`/` or View: `dashboard`)**:
   - Executive quality KPIs: Total Inspections, Passed Count, Failed Count, Needs Review Count, and Pass Rate percentage (with `font-mono tabular-nums`).
   - Category distribution bar showing inspection breakdown across Metal, Packaging, Electronics, Fabric, and General.
   - Prominent primary action button: **"Start New Inspection"**.
   - Recent inspection quick table displaying the last 5 runs with status badge, category, date, and 1-click drill-down.

2. **Image Inspection (`/inspect` or View: `inspect`)**:
   - Drag-and-drop file upload zone supporting JPG, PNG, and WEBP formats (up to 8 MB) with instant client-side preview and replace/remove actions.
   - Product category selector: *Auto Detect / General*, *Metal Part*, *Bottle / Packaging*, *Electronic Component*, *Clothing / Fabric*, *Other*.
   - **"Try Sample Images" gallery**: 4 category sample cards with pristine and defective options for instant 1-click demo testing:
     - *Metal Parts*: Precision bearing (Pristine) vs. Scratched casing (Defective)
     - *Bottles & Packaging*: Sealed bottle (Pristine) vs. Cracked cap / dented box (Defective)
     - *Electronics*: Clean solder joints (Pristine) vs. Bridged solder / missing resistor (Defective)
     - *Clothing & Fabric*: Uniform weave (Pristine) vs. Oil stain / fabric tear (Defective)
   - Action toolbar: **"Inspect Image"** (triggering server-side AI processing with step-by-step progress feedback) and **"Clear"**.

3. **Inspection Result (`/results/:id` or View: `result`)**:
   - Prominent verdict banner: **PASS** (emerald green), **FAIL** (rose red), or **NEEDS REVIEW** (amber).
   - Inspected product image viewport featuring validated **bounding boxes** highlighting detected defects with their severity color when coordinates pass validation.
   - **Detailed Defect Cards**: Each detected flaw displays Defect Type (e.g., surface scratch, hairline crack, cold solder joint), Severity badge (**Critical**, **Moderate**, or **Minor**), location summary, and AI rationale.
   - AI Summary paragraph, **"AI-Estimated Confidence"** indicator with explanatory disclaimer, and standard industrial prototype note ("Assistive AI prototype — requires qualified human sign-off").
   - Action buttons: **"Run Another Inspection"** and **"View in History"**.

4. **Inspection History (`/history` or View: `history`)**:
   - Full historical inspection log loaded from Supabase PostgreSQL (or local persistent storage in Demo Mode).
   - Quick filters by status (*All*, *Pass*, *Fail*, *Needs Review*) and product category.
   - Clean data table with image thumbnail, inspection date, category, defect summary count, and **"View Details"** action.
   - Inspection detail modal allowing quick deep-dive inspection directly from the history view without losing table position.

### Visual Identity & Theme
- **Theme**: Crisp, modern industrial-tech SaaS aesthetic.
- **Color Palette**:
  - Main background: `#F7FAFF` / `#FFFFFF`
  - Deep Navy primary headings & navigation: `#142B4A`
  - Industrial Accent Blue: `#2563EB`
  - Soft surface blue: `#EFF6FF`
  - Neutral borders: `#E2E8F0`
  - Status tokens: Emerald (`#16A34A` for PASS), Crimson (`#DC2626` for FAIL), Amber (`#D97706` for NEEDS REVIEW).
- **Typography**: `Plus Jakarta Sans` for clean, professional headers and navigation; `DM Sans` for body copy; `font-mono tabular-nums` for all timestamps, inspection counts, and percentages.
- **Anti-Slop Discipline**: Zero unnecessary pill-in-pill clusters, no fake latency tickers, no arbitrary gamified scores, and no decorative pulsing dots. Clean, functional, and responsive on both mobile and 1440px desktop viewports.

---

## 3. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI Visual Quality Inspector                     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────┐                       ┌─────────────────────┐
│    Frontend (React 19)    │                       │ Backend (Express)   │
│  - Dashboard View         │   /api/inspections    │  - Multer Image Val │
│  - Upload & Preset Samples│ ────────────────────> │  - Gemini 3.8 Flash │
│  - Result Card + Bounding │ <──────────────────── │  - Signed URL Gen   │
│  - History Table & Modal  │   JSON Inspection     │  - Dual Persistence │
└───────────────────────────┘                       └──────────┬──────────┘
                                                               │
                                  ┌────────────────────────────┴──────────────┐
                                  ▼                                           ▼
                      ┌──────────────────────┐                    ┌──────────────────────┐
                      │    Gemini Vision     │                    │  Storage / Database  │
                      │  (gemini-3.8-flash)  │                    │  1. Supabase (Cloud) │
                      │  - Status & Summary  │                    │     Private Bucket + │
                      │  - Critical/Mod/Min  │                    │     Signed URLs      │
                      │  - Validated box_2d  │                    │     OR               │
                      └──────────────────────┘                    │  2. Local Disk JSON  │
                                                                  │     (uploads/ & db)  │
                                                                  └──────────────────────┘
```

### Data Model (`inspections` record schema)
| Field | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | Primary key |
| `image_name` | `string` | Original uploaded or sample file name |
| `image_path` | `string` | Storage path or relative upload URL |
| `image_url` | `string` | Signed URL (Supabase) or local accessible URL |
| `product_category` | `string` | Selected category (Metal Part, Packaging, Electronics, Fabric, General) |
| `status` | `string` | `'PASS' \| 'FAIL' \| 'NEEDS_REVIEW'` |
| `summary` | `string` | Concise AI visual inspection explanation |
| `estimated_confidence` | `number` | AI-estimated certainty (e.g. 0.88), clearly labeled as an estimate |
| `defects` | `DefectItem[]` | Array of `{ type: string, severity: 'Critical' \| 'Moderate' \| 'Minor', description: string, box_2d?: [number, number, number, number] }` |
| `limitations` | `string` | Technical disclaimer regarding angle, resolution, or lighting |
| `created_at` | `string (ISO)` | Timestamp of inspection |

### Supabase Schema Definition (`docs/supabase-schema.sql`)
```sql
-- Supabase Database Schema for AI Visual Quality Inspection
create table if not exists inspections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default null,
  image_name text not null,
  image_path text not null,
  product_category text not null default 'General',
  status text not null check (status in ('PASS', 'FAIL', 'NEEDS_REVIEW')),
  defects jsonb not null default '[]'::jsonb,
  summary text not null,
  estimated_confidence numeric(4,2),
  limitations text,
  created_at timestamptz default now()
);

-- Performance indexes for sorting and filtering
create index if not exists idx_inspections_created_at on inspections (created_at desc);
create index if not exists idx_inspections_status on inspections (status);
create index if not exists idx_inspections_category on inspections (product_category);

-- Storage bucket configuration (private bucket)
insert into storage.buckets (id, name, public)
values ('inspection-images', 'inspection-images', false)
on conflict (id) do nothing;
```

### Backend Endpoints
- `POST /api/inspections`: Receives multipart form data (`image`, `category`, `isSample`), saves image to private Supabase bucket (or local disk in demo mode), invokes `gemini-3.8-flash` with vision prompt, validates coordinates, saves result, and returns the normalized inspection record with signed image URL.
- `GET /api/inspections`: Returns recent inspections with filtering by status and product category.
- `GET /api/inspections/:id`: Returns single inspection details with freshly signed image URL.
- `GET /api/health`: Health check reporting Gemini API status and whether Cloud Supabase or Local Persistent Storage is active.

---

## 5. Execution Steps (Ready Upon Approval)

1. **Configure Environment & Dependencies**:
   - Update `.env.example` with Supabase keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) and `GEMINI_VISION_MODEL`. Verify `.env` in `.gitignore`.
   - Install `@supabase/supabase-js`, `multer`, `@types/multer` via a single `install_applet_package` call.
2. **Implement Full-Stack Server (`server.ts`)**:
   - Set up Express API routes (`/api/inspections`, `/api/health`).
   - Configure Gemini client using `@google/genai` with `process.env.GEMINI_VISION_MODEL || 'gemini-3.8-flash'`.
   - Implement storage manager supporting Supabase (private bucket + signed URLs) and Local Persistent Disk Storage (`data/inspections.json`), with strict no-silent-fallback semantics.
   - Include `docs/supabase-schema.sql` for user reference.
3. **Generate High-Fidelity Preset Test Images**:
   - Generate realistic industrial photos for the 4 categories (pristine & defective) using `generate_image`.
4. **Implement Frontend Views & Components**:
   - **Header & Navigation**: Industrial top bar with 4-view tabs and Demo Mode indicator.
   - **Dashboard View**: Metric cards, category distribution, recent runs.
   - **Image Inspection View**: Drag-and-drop zone, category picker, preset sample bar, inspect trigger with progress steps.
   - **Inspection Result View**: Verdict banner, defect cards with Critical/Moderate/Minor severities, validated bounding-box overlay, AI-estimated confidence score, limitations note.
   - **Inspection History View**: Filterable table with search and modal detail view.
5. **Verification & Testing**:
   - Verify build and compilation with `compile_applet` and `lint_applet`.
   - Test upload and inspection flows across all sample images and error states.
