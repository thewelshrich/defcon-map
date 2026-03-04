# DEFCON Map - Technical Architecture

## Architecture Decision

The original `D3 + SVG + vanilla JS` approach is useful for a visual prototype, but it is not the right long-term architecture for the product defined in the feature docs.

This product is not just a map. It is an interactive application with:

- synchronized timeline playback
- live and historical event data
- derived global and per-country metrics
- hover and selection state
- filter state
- ticker and side-panel UI
- responsive layouts across desktop, tablet, and mobile

That combination pushes the project toward an application-first architecture with GPU-backed geospatial rendering.

**Recommended implementation:**

- **Frontend app:** React 19 + TypeScript + Vite
- **Map rendering:** deck.gl (WebGL)
- **Geospatial utilities:** D3 for scales, normalization, and small data transforms only
- **Client state:** Zustand or React reducer-based state
- **Client data fetching:** TanStack Query
- **Backend/API:** Cloudflare Workers + Workers KV + Cron
- **Hosting:** Cloudflare Pages + Workers

---

## Why This Stack

### Why React + TypeScript

React is the right fit because the map is only one part of the interface. The rest of the product depends on coordinated UI state and composable panels.

**React solves:**

- shared state between map, controls, panels, and ticker
- controlled timeline playback
- responsive layout composition
- predictable event handling
- isolated UI components for testing and iteration

**TypeScript is strongly recommended because:**

- source data from ACLED and GDELT needs normalization
- event models will evolve over time
- derived DEFCON calculations should be explicit and testable
- map layer props, filters, and aggregation logic benefit from compile-time validation

Without TypeScript, the data layer will become fragile quickly.

### Why deck.gl

`deck.gl` is the best default for this project because it matches the actual rendering problem:

- many dynamic geospatial markers
- animated updates
- time-window filtering
- hover and click picking
- future growth into denser datasets and historical playback

It gives us GPU-backed rendering from the start, instead of beginning in SVG and rewriting later.

**Key fit for this product:**

- `GeoJsonLayer` for countries and borders
- `ScatterplotLayer` for pulsing event markers
- `TextLayer` for lightweight labels if needed
- `ArcLayer` for future relationship or trajectory overlays
- built-in picking for hover and click interactions
- smooth transitions and performant redraws as filters change

### Why Not D3 as the Main Rendering Engine

D3 still has value here, but not as the primary scene graph.

Use D3 for:

- color scales
- threshold mapping
- score normalization
- time scales
- binning and derived metrics

Do not use D3 for:

- owning the main render tree
- imperative DOM updates for the map
- large-scale marker rendering

The browser should not be managing thousands of animated SVG nodes for a map-first UI.

---

## Frontend Architecture

### Rendering Model

The app should render a custom flat world view, not a standard slippy map.

- Use world country geometry from GeoJSON or TopoJSON
- Render country polygons directly in `deck.gl`
- Avoid a generic tiled basemap unless there is a specific later need
- Preserve the DEFCON visual identity through custom fills, strokes, glow, and overlays

This keeps the map consistent with the product aesthetic instead of inheriting a generic map provider look.

### Application Structure

Recommended frontend structure:

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes/
│   └── providers/
├── components/
│   ├── defcon-indicator/
│   ├── ticker/
│   ├── timeline/
│   ├── filters/
│   ├── country-panel/
│   └── stats-panel/
├── map/
│   ├── MapView.tsx
│   ├── layers/
│   │   ├── countries-layer.ts
│   │   ├── events-layer.ts
│   │   └── highlights-layer.ts
│   ├── view-state.ts
│   └── interactions.ts
├── data/
│   ├── api/
│   ├── adapters/
│   ├── selectors/
│   └── polling/
├── domain/
│   ├── events.ts
│   ├── defcon.ts
│   ├── countries.ts
│   └── filters.ts
├── store/
│   ├── app-store.ts
│   └── playback-store.ts
├── styles/
│   ├── tokens.css
│   ├── crt.css
│   └── app.css
└── assets/
    ├── geometry/
    ├── fonts/
    └── audio/
```

### Core React Components

**`App`**

- owns top-level layout
- initializes shared providers
- coordinates map shell, side panels, ticker, and controls

**`MapView`**

- owns the `DeckGL` canvas
- reads derived layer data from store/selectors
- manages viewport state and pointer interactions

**`TimelineControls`**

- controls play/pause, speed, and active date range
- updates playback state only
- does not own raw event data

**`CountryPanel`**

- displays derived stats for the currently hovered or selected country
- reads normalized, already-shaped data

**`DefconIndicator`**

- displays the current global DEFCON level
- reads a precomputed or memoized aggregate state

### Client State Boundaries

Separate state by responsibility:

**UI state**

- active panel
- hover target
- selected country
- selected event
- audio enabled

**Map state**

- viewport (`latitude`, `longitude`, `zoom`, `bearing`, `pitch`)
- hover pick info
- interaction lock state if needed during playback

**Filter state**

- event types
- severity
- region
- time range

**Playback state**

- current cursor timestamp
- playback speed
- playing/paused

**Remote data state**

- latest event feed
- country aggregates
- global aggregates
- loading/error timestamps

Keep remote server data separate from local UI state.

### State Management Recommendation

For this app, either of these is appropriate:

- **Zustand** if you want a simple lightweight store with selectors
- **`useReducer` + context** if you want to stay minimal early

My recommendation is **Zustand** because map state, playback state, and filter state are shared across many components but do not justify a heavier framework.

---

## Map Rendering Details

### Recommended Layers

**Countries Layer**

- `GeoJsonLayer`
- fill with near-black landmass color
- cyan stroke with subtle glow styling
- support hover and selected-country highlighting

**Events Layer**

- `ScatterplotLayer` for MVP
- event size based on severity or fatalities bucket
- color based on event category
- opacity fades with age

**Selection / Highlight Layer**

- separate overlay layer for hovered/selected country
- do not mutate the base countries layer for every interaction if avoidable

**Optional Labels Layer**

- `TextLayer` only for major labels or specific zoom thresholds
- avoid dense labels in MVP

### Projection

The visual requirement remains:

- **flat 2D projection**
- **not a globe**

Recommended approach:

- use a Web Mercator-style flat projection for familiarity and implementation simplicity
- if exact cartographic fidelity is less important than visual consistency, keep it visually DEFCON-styled and stable across screen sizes

The product cares more about recognizable geography than precision cartography.

### Interaction Model

Support these interactions in MVP:

- hover country to preview stats
- click country to lock selection
- hover marker to preview event
- click marker to open detail card
- zoom and pan with smooth transitions
- click ticker item to center the map on the event

The map should emit typed interaction events into app state rather than own business logic directly.

---

## Data Architecture

### Source Strategy

Keep the existing source direction:

- **ACLED** for higher-quality structured conflict data
- **GDELT** for higher-frequency monitoring and alerting

But the client should not consume raw source payloads directly.

### Backend Responsibilities

Cloudflare Workers should act as a normalization and aggregation layer, not just a thin proxy.

**Workers should handle:**

- source authentication and request signing
- source-specific fetch logic
- normalization into one internal event schema
- deduplication and source labeling
- confidence scoring and verification labeling
- aggregation by country and time bucket
- caching and stale-while-revalidate behavior

**Workers KV should store:**

- latest normalized event snapshots
- recent country aggregates
- precomputed global summary
- small historical buckets used by timeline playback

**Cron jobs should handle:**

- periodic ACLED refresh
- frequent GDELT polling
- rebuilding aggregate snapshots

### Canonical Internal Event Shape

The application should define one internal event model regardless of source:

```ts
type ConflictEvent = {
  id: string;
  source: "acled" | "gdelt" | "ucdp" | "reliefweb";
  sourceId: string;
  occurredAt: string;
  reportedAt: string;
  countryCode: string;
  countryName: string;
  locationName: string | null;
  latitude: number;
  longitude: number;
  category: "battle" | "explosion" | "protest" | "civilian" | "strategic";
  fatalities: number | null;
  civilianImpact: boolean;
  actors: string[];
  confidence: "high" | "medium" | "low";
  verification: "verified" | "partially_verified" | "unconfirmed";
};
```

The client should consume a stable shape like this and not care which upstream source produced it.

### Aggregation Strategy

Precompute wherever possible.

The browser should not recalculate every metric from raw events on every scrub or filter change.

Recommended aggregates:

- global event counts by time bucket
- global fatalities by time bucket
- country event totals by time bucket
- country fatalities by time bucket
- country actor counts by time bucket
- latest significant events for ticker

This reduces client work and makes playback much smoother.

---

## DEFCON Score Computation

The DEFCON number is core product logic and should live in the domain layer, not inside view components.

### Recommendation

- define a deterministic scoring module in shared TypeScript
- unit test it independently from the UI
- keep the weighting transparent and documented
- compute on normalized aggregate data, not ad hoc raw payloads

### Calculation Model

The current concept remains valid:

```text
DEFCON Score =
  (Deadliness × 0.25) +
  (Danger × 0.25) +
  (Diffusion × 0.25) +
  (Fragmentation × 0.25)
```

But implementation should use:

- bounded normalization functions
- explicit time windows
- clear handling for missing or delayed data
- versioned scoring logic if the methodology evolves

### Practical Implementation

Expose the score as:

- current numeric score
- mapped DEFCON level (`1-5`)
- previous score for trend comparison
- breakdown per factor for transparency

That supports both the UI and future methodology notes.

---

## Styling and Visual System

### Aesthetic Direction

The visual direction is still based on the 2006 DEFCON game and 1983 WarGames:

- flat 2D vector world
- jet black landmasses
- electric blue oceans/background field
- glowing cyan borders
- restrained terminal-like UI chrome
- CRT scanline and subtle flicker overlays
- monospace display typography

### Color Palette

| Element | Color |
|---------|-------|
| Background | `#000000` |
| Landmass | `#0a0a0a` |
| Ocean / Map field | `#001122` |
| Borders | `#00ffff` |
| DEFCON 1 | `#ff0000` |
| DEFCON 2 | `#ff6600` |
| DEFCON 3 | `#ffcc00` |
| DEFCON 4 | `#00ff00` |
| DEFCON 5 | `#0066ff` |
| Primary text | `#00ff00` |

### Typography

```css
font-family: "VT323", "Share Tech Mono", monospace;
```

### Effects

Keep visual effects in CSS and lightweight overlays:

- scanlines
- subtle flicker
- glow around text and borders
- restrained pulse on event markers

Avoid heavy DOM effects that compete with map performance.

---

## Audio

Audio is optional for MVP and should be isolated from core map rendering.

### Recommendation

- keep audio behind explicit user control
- lazy-load audio code after initial render
- treat ambient loop and alert sounds as progressive enhancement

### Library Choice

- **Howler.js** is the simplest practical option for playback control
- **Tone.js** is only worth adding if procedural synthesis is a deliberate product feature

For MVP, pre-produced ambient audio plus lightweight alert sounds is enough.

---

## Performance Strategy

### Core Principle

Start with GPU-backed rendering, not SVG-first fallback planning.

That removes an avoidable migration later and better matches the expected interaction model.

### Performance Tactics

- render markers through `deck.gl`, not DOM nodes
- pre-aggregate server-side for playback and stats
- keep React components out of high-frequency render paths
- avoid storing huge raw event collections in component-local state
- memoize derived selectors where appropriate
- debounce non-critical UI updates, not core pointer interactions

### Expected Limits

This architecture should comfortably support:

- thousands of visible markers
- smooth zoom/pan
- animated filter changes
- timeline scrubbing over bucketed historical data

If the dataset grows substantially beyond MVP, the first optimization should be more aggressive aggregation and bucketing, not a full frontend rewrite.

---

## Deployment Architecture

### Frontend

- build with Vite
- deploy static assets to Cloudflare Pages

### Backend

- deploy Worker API endpoints separately
- expose normalized event and aggregate endpoints to the client

### Suggested API Surface

```text
GET /api/summary
GET /api/events?from=...&to=...&types=...
GET /api/countries/:code
GET /api/ticker
GET /api/timeline?bucket=hour
```

Keep the API optimized for client needs, not source parity.

---

## Migration Recommendation

The current repository already contains a plain JavaScript D3 prototype. Treat that as a proof of concept, not the base architecture.

Recommended migration path:

1. Create a new React + TypeScript app shell with Vite.
2. Move DEFCON scoring logic into typed domain modules.
3. Introduce a typed Worker-backed data adapter layer.
4. Rebuild the map as `deck.gl` layers using custom country geometry.
5. Re-implement the ticker, panels, and timeline as React components.
6. Add CRT styling and audio only after the core data and interaction model are stable.

This keeps the visual identity while replacing the fragile parts of the architecture.

---

## Final Recommendation

For this product, the best implementation choice is:

**React + TypeScript + deck.gl + Cloudflare Workers**

That stack best matches:

- the amount of shared UI state
- the map-heavy interaction model
- the need for smooth rendering under changing datasets
- the requirement to preserve a custom DEFCON aesthetic instead of relying on a standard basemap

The original D3/SVG direction is still useful as a prototype reference, but it should not be treated as the production architecture.
