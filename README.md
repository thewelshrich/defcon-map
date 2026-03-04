# DEFCON Map

A DEFCON-style real-time global conflict visualization. Cold War aesthetics meet real-world data.

---

## Concept

An artistic/educational visualization that displays global conflict data in the style of the 2006 game DEFCON. Flat 2D map, CRT effects, synth audio, and a single "global threat level" indicator.

**Not a game.** An awareness tool.

---

## Product Summary

### Data Sources

| Source | Quality | Update Frequency | Cost |
|--------|---------|------------------|------|
| **ACLED** | ⭐⭐⭐⭐⭐ | Weekly | Free (non-commercial) |
| **GDELT** | ⭐⭐⭐ | 15 minutes | Free |
| **UCDP** | ⭐⭐⭐⭐⭐ | Monthly | Free |
| **ReliefWeb** | ⭐⭐⭐⭐ | Real-time | Free |

**Recommended:** ACLED for quality baseline + GDELT for real-time alerts

### Recommended Architecture

| Layer | Technology |
|-------|------------|
| **Frontend app** | React 19 + TypeScript + Vite |
| **Map rendering** | deck.gl (WebGL) |
| **Geospatial utilities** | D3 (scales, normalization, transforms) |
| **Client state** | Zustand or React reducer-based state |
| **Client data** | TanStack Query |
| **Backend** | Cloudflare Workers + Workers KV + Cron |
| **Hosting** | Cloudflare Pages + Workers |

### DEFCON Level Calculation

Based on ACLED's Conflict Index methodology:

| Indicator | Weight | Measure |
|-----------|--------|---------|
| Deadliness | 25% | Fatalities per period |
| Danger | 25% | Civilian-targeted events |
| Diffusion | 25% | % of area with violence |
| Fragmentation | 25% | Number of armed groups |

**DEFCON Levels:**
- **1 (Critical)** — Multiple major conflicts, nuclear threats
- **2 (Severe)** — Major conflicts in 3+ regions
- **3 (Elevated)** — Active conflicts in 1-2 regions
- **4 (Guarded)** — Regional tensions, potential flashpoints
- **5 (Normal)** — Routine geopolitical friction

### Planned MVP

- Flat 2D world map
- CRT/scanline effects
- Glowing borders
- Real-time conflict markers
- DEFCON level indicator (1-5)
- Country conflict stats
- News ticker feed
- Responsive layout

### Viral Potential

**High.** Reasons:
- DEFCON aesthetic is iconic
- "89 seconds to midnight" messaging
- Reddit/HN sweet spot (data viz + geopolitics)
- News embed market (LiveUAMap proved this)

### Ethical Considerations

**This is the most important part.**

| ❌ Never | ✅ Always |
|----------|-----------|
| Gamify conflicts | Emphasize human cost |
| Celebrate escalations | Use serious tone |
| Allow betting/predictions | Link to humanitarian aid |
| Present as entertainment | Attribute all sources |
| Show "achievements" | Show civilian impact |

**Red lines:**
- Never celebrate escalations
- Never gamify civilian casualties
- Never allow betting for profit
- Never remove human context

---

## Repository Status

The repository now contains an active React 19 + TypeScript implementation alongside the original plain JavaScript prototype.

The React app is the primary implementation path. The legacy `js/` prototype is still useful as a visual reference, but it is no longer the architectural source of truth.

The intended production direction is documented in:

- [docs/technical-architecture.md](docs/technical-architecture.md)
- [docs/features.md](docs/features.md)
- [docs/data-sources.md](docs/data-sources.md)
- [docs/ethics.md](docs/ethics.md)

## Current Repository Structure

``` 
defcon-map/
├── README.md
├── docs/
│   ├── data-sources.md
│   ├── technical-architecture.md
│   ├── features.md
│   └── ethics.md
├── src/
│   ├── app/
│   ├── components/
│   ├── data/
│   ├── domain/
│   ├── map/
│   ├── store/
│   └── styles/
├── css/
├── js/
├── index.html
└── package.json
```

---

## Current Implementation

The current codebase includes:

- a React + deck.gl application under `src/`
- a D3-based browser prototype under `js/`

The React app is the current production-track implementation. The D3 version remains a visual experiment and reference surface.

### Quick Start

```bash
npm run dev

# Open the Vite dev URL shown in the terminal (typically http://localhost:5173)
```

### Legacy Prototype Capabilities

```javascript
DEFCONMap.init();
DEFCONMap.addMarker(lat, lng, type, data);
DEFCONMap.clearAllMarkers();
DEFCONMap.zoomTo(40.7128, -74.0060, 4);
```

### Legacy Prototype Demo Mode

Add `?demo` to the URL to render sample markers:

```
http://localhost:8080?demo
```

### Legacy Prototype Modules

```javascript
import { 
  initMap, 
  addEventMarker, 
  clearMarkers, 
  on, 
  setView 
} from './js/map.js';

// Initialize
initMap('map-container-id');

// Add marker
const markerId = addEventMarker(55.7558, 37.6173, 'alert', { name: 'Moscow' });

// Listen for events
on('country:click', (e) => console.log('Country:', e.detail.feature));
on('marker:click', (e) => console.log('Marker:', e.detail.marker));
```

---

## Next Steps

1. Expand the React app from shell components into full country and event detail views.
2. Move conflict normalization and aggregation into Cloudflare Workers.
3. Deepen the data model for filters, playback, and richer country summaries.
4. Add timeline controls, filters, and the remaining interaction surfaces.
5. Reconcile the remaining legacy prototype behavior or remove it once the React app fully supersedes it.

---

## License

MIT (code) / CC-BY (data — check individual source requirements)

---

*Research compiled: March 3, 2026*
