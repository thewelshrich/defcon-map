# DEFCON Map

A DEFCON-style real-time global conflict visualization. Cold War aesthetics meet real-world data.

---

## Concept

An artistic/educational visualization that displays global conflict data in the style of the 2006 game DEFCON. Flat 2D map, CRT effects, synth audio, and a single "global threat level" indicator.

**Not a game.** An awareness tool.

---

## Research Summary

### Data Sources

| Source | Quality | Update Frequency | Cost |
|--------|---------|------------------|------|
| **ACLED** | ⭐⭐⭐⭐⭐ | Weekly | Free (non-commercial) |
| **GDELT** | ⭐⭐⭐ | 15 minutes | Free |
| **UCDP** | ⭐⭐⭐⭐⭐ | Monthly | Free |
| **ReliefWeb** | ⭐⭐⭐⭐ | Real-time | Free |

**Recommended:** ACLED for quality baseline + GDELT for real-time alerts

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Map** | D3.js + SVG (flat projection) |
| **Effects** | CSS (CRT scanlines, glow, flicker) |
| **Animations** | GSAP for trajectories, CSS for loops |
| **Audio** | Howler.js + royalty-free synth (Pixabay) or Tone.js (procedural) |
| **Backend** | Cloudflare Workers (API proxy, caching) |
| **Hosting** | Cloudflare Pages (unlimited bandwidth free) |

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

### Features

- ✅ Flat 2D world map (Mercator projection)
- ✅ CRT/scanline effects
- ✅ Glowing vector borders
- ✅ Real-time conflict markers
- ✅ DEFCON level indicator (1-5)
- ✅ Country conflict stats
- ✅ Timeline playback (historical)
- ✅ News ticker feed
- ✅ Ambient synth audio
- ✅ Mobile-responsive

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

## Project Structure

```
defcon-map/
├── README.md
├── docs/
│   ├── data-sources.md
│   ├── technical-architecture.md
│   ├── features.md
│   └── ethics.md
├── research/
│   └── (raw research notes)
└── src/
    ├── (implementation)
```

---

## Map Module Usage

The map is built with D3.js v7 and provides a DEFCON-style visualization.

### Quick Start

```bash
# Start development server
npm run dev

# Open http://localhost:8080
```

### API Reference

```javascript
// Initialize the map
DEFCONMap.init();

// Add event markers
DEFCONMap.addMarker(lat, lng, type, data);

// Types: 'default', 'alert', 'warning', 'safe'
DEFCONMap.addMarker(51.5074, -0.1278, 'warning', { name: 'London' });

// Clear all markers
DEFCONMap.clearAllMarkers();

// Zoom to location
DEFCONMap.zoomTo(40.7128, -74.0060, 4); // NYC, zoom level 4
```

### Demo Mode

Add `?demo` to URL to see sample markers:
```
http://localhost:8080?demo
```

### Module Exports (ES6)

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

1. [ ] Prototype with GDELT data (free, immediate)
2. [ ] Build DEFCON level algorithm
3. [ ] Create retro UI mockup
4. [ ] Test with r/dataisbeautiful post
5. [ ] Apply for ACLED API access
6. [ ] Develop ethical guidelines
7. [ ] Launch MVP

---

## License

MIT (code) / CC-BY (data — check individual source requirements)

---

*Research compiled: March 3, 2026*
