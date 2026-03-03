# DEFCON Map - Technical Architecture

## Aesthetic Direction

Based on the 2006 DEFCON game and 1983 WarGames movie:

- **Flat 2D vector map** — NOT a globe
- **Jet black landmasses** with glowing borders
- **Electric blue oceans**
- **White/cyan glowing territory lines**
- **Minimalist icons** for events
- **CRT scanline effects**
- **Monospace terminal fonts**

### Color Palette

| Element | Color |
|---------|-------|
| Background | `#000000` |
| Landmass | `#0a0a0a` |
| Ocean | `#001122` |
| Borders | `#00ffff` (glow) |
| DEFCON 1 | `#ff0000` |
| DEFCON 2 | `#ff6600` |
| DEFCON 3 | `#ffcc00` |
| DEFCON 4 | `#00ff00` |
| DEFCON 5 | `#0066ff` |
| Text | `#00ff00` (terminal green) |

### Typography

```css
font-family: "VT323", "Share Tech Mono", monospace;
```

---

## Tech Stack

### Frontend

| Layer | Technology | Why |
|-------|------------|-----|
| **Map** | D3.js + SVG | Full control over DEFCON aesthetic |
| **Projection** | d3.geo.mercator() | Flat 2D map |
| **Effects** | CSS | CRT scanlines, glow, flicker |
| **Animations** | GSAP | Missile trajectories, arcs |
| **Audio** | Howler.js | Background synth, alerts |

### Backend

| Layer | Technology | Why |
|-------|------------|-----|
| **API Proxy** | Cloudflare Workers | Hide API keys, caching |
| **Storage** | Workers KV | Edge caching |
| **Scheduled** | Workers Cron | Data polling |

### Hosting

| Platform | Free Tier |
|----------|-----------|
| **Cloudflare Pages** | Unlimited bandwidth ✅ |
| **Cloudflare Workers** | 100K requests/day |

---

## CRT Effects (CSS)

### Scanlines

```css
.crt::before {
  content: " ";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 2px;
  pointer-events: none;
}
```

### Flicker

```css
@keyframes flicker {
  0% { opacity: 0.27861; }
  5% { opacity: 0.34769; }
  10% { opacity: 0.23604; }
  15% { opacity: 0.30143; }
  /* ... more keyframes */
}

.crt::after {
  animation: flicker 0.15s infinite;
}
```

### Glow

```css
.glow-text {
  text-shadow: 
    0 0 10px #00ff00,
    0 0 20px #00ff00,
    0 0 30px #00ff00;
}

.glow-border {
  box-shadow: 
    0 0 10px #00ffff,
    0 0 20px #00ffff;
}
```

---

## Radar Sweep Animation

```css
.radar {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(0, 255, 0, 0.2) 0%,
    transparent 70%
  );
  position: relative;
  overflow: hidden;
}

.radar-beam {
  width: 100%;
  height: 100%;
  background: conic-gradient(
    from 0deg,
    #00ff00 0deg,
    transparent 90deg
  );
  border-radius: 50%;
  animation: rotate 3s linear infinite;
  position: absolute;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## Map Implementation (D3.js)

```javascript
// Flat Mercator projection
const projection = d3.geo.mercator()
  .scale(150)
  .translate([width / 2, height / 2]);

const path = d3.geo.path()
  .projection(projection);

// Draw countries
svg.selectAll("path")
  .data(countries.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("fill", "#0a0a0a")
  .attr("stroke", "#00ffff")
  .attr("stroke-width", 0.5);

// Add glow filter
svg.append("defs")
  .append("filter")
  .attr("id", "glow")
  .call(filter => {
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "blur");
    filter.append("feMerge")
      .call(merge => {
        merge.append("feMergeNode").attr("in", "blur");
        merge.append("feMergeNode").attr("in", "SourceGraphic");
      });
  });
```

---

## Audio

### Background Synth

**Option A: Pre-recorded (Pixabay)**
- Search: "dark ambient", "drone", "cinematic synth"
- License: CC0 (no attribution)
- Implementation: Howler.js with `loop: true`

**Option B: Procedural (Tone.js)**
```javascript
const synth = new Tone.FMSynth({
  harmonicity: 3,
  modulationIndex: 10,
  envelope: { attack: 2, decay: 1, sustain: 0.5, release: 3 }
}).toDestination();

// Dark drone
synth.triggerAttack("C1");
```

### Alert Sounds

- Radar blips: Freesound.org (CC)
- Alarms: Mixkit (free)
- Generate procedural: Web Audio API oscillator

---

## Performance

### Thresholds

| Elements | Approach |
|----------|----------|
| < 5,000 | SVG (D3.js) |
| 5,000 - 10,000 | Canvas |
| > 10,000 | WebGL |

### Optimizations

- Downsample data (5000+ points visually redundant)
- Use Canvas for event markers
- Cache API responses in Workers KV
- Debounce zoom/pan events

---

## File Structure

```
src/
├── index.html
├── styles/
│   ├── main.css
│   ├── crt.css
│   └── map.css
├── js/
│   ├── app.js
│   ├── map.js
│   ├── data.js
│   └── audio.js
├── assets/
│   ├── fonts/
│   └── audio/
└── workers/
    └── api-proxy.js
```
