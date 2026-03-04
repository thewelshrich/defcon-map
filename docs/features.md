# DEFCON Map - Features

## Core Features

### 1. Global DEFCON Indicator

Single number (1-5) representing global threat level.

**Calculation (ACLED-based):**

```
DEFCON Index = 
  (Deadliness × 0.25) + 
  (Danger × 0.25) + 
  (Diffusion × 0.25) + 
  (Fragmentation × 0.25)

Where:
- Deadliness = Fatalities per period (normalized)
- Danger = Civilian-targeted events (normalized)
- Diffusion = % of countries with active conflict
- Fragmentation = Number of active armed groups (normalized)
```

**Visual:**
- Large DEFCON number in corner
- Color-coded (red → blue)
- Trend indicator (↑ ↓ →)
- Last updated timestamp

---

### 2. Interactive World Map

- **Flat Mercator projection**
- **Glowing borders** between countries
- **Event markers** (pulsing dots)
- **Hover** for country stats
- **Click** for detailed view
- **Zoom/pan** with smooth transitions

---

### 3. Event Markers

| Type | Icon | Color |
|------|------|-------|
| Battle | ⚔️ | Red |
| Explosion | 💥 | Orange |
| Protest | ✊ | Yellow |
| Civilian targeting | 👥 | Dark red |
| Strategic development | 📋 | Blue |

**Animation:**
- Pulse on appear
- Fade over time (older events dimmer)
- Click for details

---

### 4. Country Stats Panel

On hover/click:

```
┌─────────────────────────────┐
│ UKRAINE                     │
│ ─────────────────────────── │
│ Events (7d):    127         │
│ Fatalities:     340         │
│ Civilians:      45          │
│ Trend:          ↑ +23%      │
│ Actors:         4 groups    │
│ Last event:     2h ago      │
└─────────────────────────────┘
```

---

### 5. Timeline Playback

- **Scrubber** at bottom
- **Play/pause** animation
- **Speed control** (1x, 2x, 4x)
- **Date range selector**
- **Key events markers** on timeline

**Use case:** Watch a conflict escalate over weeks/months

---

### 6. Filters

| Filter | Options |
|--------|---------|
| **Type** | All, Battles, Protests, Civilian, Explosions |
| **Time** | 24h, 7d, 30d, Custom |
| **Intensity** | All, Low, Medium, High, Critical |
| **Region** | Global, Continent, Country |

---

### 7. News Ticker

Scrolling feed at bottom:

```
▶ 14:32 — EXPLOSION reported near Kyiv, Ukraine (2 fatalities)
▶ 14:15 — PROTEST in Tehran, Iran (500+ participants)
▶ 13:58 — BATTLE ongoing in Donetsk region
```

- Click to zoom to location
- Severity color-coded
- Links to sources

---

### 8. Statistics Panel

```
┌─────────────────────────────────┐
│ GLOBAL STATISTICS               │
│ ─────────────────────────────── │
│ Active conflicts:    47         │
│ Events (24h):        312        │
│ Fatalities (24h):    890        │
│ Countries affected:  34         │
│ ─────────────────────────────── │
│ Trend vs last week:  ↑ +12%     │
└─────────────────────────────────┘
```

---

### 9. Audio

- **Ambient synth** (background)
- **Alert sounds** for new critical events
- **Mute toggle**
- **Volume control**

---

### 10. Responsive Design

- **Desktop:** Full map + side panels
- **Tablet:** Map + collapsible panels
- **Mobile:** Map + bottom sheet for details

---

## Future Features

### Phase 2

- [ ] Browser notifications for DEFCON changes
- [ ] Email alerts for watched regions
- [ ] Embeddable widget for news sites
- [ ] API for developers
- [ ] Historical comparison (year over year)

### Phase 3

- [ ] Prediction model (ML-based)
- [ ] "What if" scenario explorer
- [ ] Multilingual support
- [ ] Dark/light mode toggle

---

## MVP Scope

**Target launch scope:**

1. DEFCON indicator
2. Interactive map
3. Event markers (last 7 days)
4. Country hover stats
5. News ticker
6. CRT aesthetic
7. Ambient audio

**Post-launch:**

8. Timeline playback
9. Filters
10. Browser notifications
