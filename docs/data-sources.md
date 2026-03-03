# DEFCON Map - Data Sources

## Primary Recommendation: ACLED + GDELT

### ACLED (Armed Conflict Location & Event Data Project)

**URL:** https://acleddata.com/
**API Docs:** https://acleddata.com/acled-api-documentation

| Aspect | Details |
|--------|---------|
| **Access** | Free registration required |
| **Format** | JSON, CSV, XML |
| **Updates** | Weekly (daily for Ukraine) |
| **Coverage** | Global |
| **Historical** | Yes, extensive archives |
| **Free tier** | Academic/research: free; Commercial: paid |

**Event Types:**
- Battles
- Violence against civilians
- Explosions/Remote violence
- Riots
- Protests
- Strategic developments

**Key Fields:**
```
event_date, event_type, sub_event_type, actor1, actor2, 
country, location, latitude, longitude, fatalities, notes
```

**Attribution:** Required

---

### GDELT Project

**URL:** https://www.gdeltproject.org/

| Aspect | Details |
|--------|---------|
| **Access** | Free, open |
| **Format** | JSON, CSV (via BigQuery) |
| **Updates** | Every 15 minutes |
| **Coverage** | Global, 100+ languages |
| **Historical** | Back to 1979 |

**Quad Classes:**
1. Verbal Cooperation
2. Material Cooperation
3. Verbal Conflict
4. Material Conflict ← Use for DEFCON alerts

**Pros:** Real-time, massive scale
**Cons:** Noisier data (automated extraction)

---

### UCDP (Uppsala Conflict Data Program)

**URL:** https://ucdp.uu.se/

| Aspect | Details |
|--------|---------|
| **Access** | Free, token required |
| **Format** | JSON |
| **Updates** | Annual/Monthly |
| **Historical** | Back to 1946 |

Best for long-term historical analysis and normalization.

---

### ReliefWeb API

**URL:** https://reliefweb.int/help/api

| Aspect | Details |
|--------|---------|
| **Access** | Free, no registration |
| **Format** | JSON |
| **Updates** | Real-time |
| **Focus** | Humanitarian crises |

Good for displacement and humanitarian context.

---

## ⚠️ Social Media Warning

**Twitter/X API explicitly PROHIBITS** monitoring "sensitive events" including protests.

Use aggregated datasets (GDELT) instead of direct social media APIs.

---

## Data Architecture

```
┌─────────────────┐     ┌─────────────────┐
│     ACLED       │     │     GDELT       │
│  (Weekly sync)  │     │ (15min polling) │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │  Cloudflare │
              │   Workers   │
              │  (API proxy)│
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  Workers KV │
              │  (caching)  │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │   Frontend  │
              │  (D3.js)    │
              └─────────────┘
```

---

## Implementation Notes

1. **Background job:** Daily ACLED fetch → Workers KV
2. **Real-time:** GDELT polling every 15 min
3. **Caching:** 1-hour TTL in Workers KV
4. **Rate limits:** Proxy through Workers to avoid client limits
