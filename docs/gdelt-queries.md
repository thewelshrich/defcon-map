# GDELT BigQuery Queries

## Zero-Cost Strategy

- **Free tier:** 1TB query processing per month
- **Our usage:** ~2GB per weekly query = ~8GB/month (0.8% of allowance)
- **Update cadence:** Weekly (every Sunday)

---

## Optimized Query (Minimal Scan)

**⚠️ IMPORTANT:** Use `events_partitioned` table, not `events`. The partitioned table enables `_PARTITIONDATE` filtering which reduces scan from 65GB to 398MB.

```sql
-- Scan last 30 days of material conflicts
-- Data scanned: ~398MB (0.04% of 1TB free tier)
SELECT 
  GLOBALEVENTID,
  SQLDATE,
  Actor1CountryCode as attacker_country,
  Actor2CountryCode as target_country,
  EventCode,
  GoldsteinScale,
  NumMentions,
  Actor1Geo_Lat as attacker_lat,
  Actor1Geo_Long as attacker_lng,
  ActionGeo_Lat as event_lat,
  ActionGeo_Long as event_lng
FROM `gdelt-bq.gdeltv2.events_partitioned`
WHERE 
  _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND QuadClass = 4
  AND Actor1CountryCode != Actor2CountryCode
  AND Actor1CountryCode IS NOT NULL
  AND Actor2CountryCode IS NOT NULL
  AND ActionGeo_Lat IS NOT NULL
ORDER BY GoldsteinScale ASC, SQLDATE DESC
LIMIT 1000
```

---

## Query for Specific Countries

```sql
-- Ukraine-Russia conflicts only
-- Uses partitioned table for minimal scan
SELECT 
  GLOBALEVENTID,
  SQLDATE,
  Actor1CountryCode as attacker_country,
  Actor2CountryCode as target_country,
  EventCode,
  GoldsteinScale,
  NumMentions,
  Actor1Geo_Lat as attacker_lat,
  Actor1Geo_Long as attacker_lng,
  ActionGeo_Lat as event_lat,
  ActionGeo_Long as event_lng
FROM `gdelt-bq.gdeltv2.events_partitioned`
WHERE 
  _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  AND QuadClass = 4
  AND (
    (Actor1CountryCode = 'RUS' AND Actor2CountryCode = 'UKR') OR
    (Actor1CountryCode = 'UKR' AND Actor2CountryCode = 'RUS')
  )
  AND ActionGeo_Lat IS NOT NULL
ORDER BY SQLDATE DESC
LIMIT 500
```

---

## Query for Middle East

```sql
-- Middle East conflicts (ISR, IRN, LBN, SYR, PSE, IRQ, YEM)
-- Uses partitioned table for minimal scan
SELECT 
  GLOBALEVENTID,
  SQLDATE,
  Actor1CountryCode as attacker_country,
  Actor2CountryCode as target_country,
  EventCode,
  GoldsteinScale,
  NumMentions,
  Actor1Geo_Lat as attacker_lat,
  Actor1Geo_Long as attacker_lng,
  ActionGeo_Lat as event_lat,
  ActionGeo_Long as event_lng
FROM `gdelt-bq.gdeltv2.events_partitioned`
WHERE 
  _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND QuadClass = 4
  AND Actor1CountryCode IN ('ISR', 'IRN', 'LBN', 'SYR', 'IRQ', 'YEM')
  AND Actor2CountryCode != Actor1CountryCode
  AND Actor2CountryCode IS NOT NULL
  AND ActionGeo_Lat IS NOT NULL
ORDER BY GoldsteinScale ASC
LIMIT 500
```

---

## CAMEO Event Codes Reference

| Code | Type |
|------|------|
| 17 | Coerce |
| 18 | Assault |
| 19 | Fight (unconventional violence) |
| 20 | Mass violence |
| 18* | Attack |
| 19* | Unconventional attack |

---

## QuadClass Reference

| Class | Meaning |
|-------|---------|
| 1 | Verbal Cooperation |
| 2 | Material Cooperation |
| 3 | Verbal Conflict |
| **4** | **Material Conflict** ← Use this |

---

## Country Codes

| Code | Country |
|------|---------|
| USA | United States |
| RUS | Russia |
| UKR | Ukraine |
| ISR | Israel |
| IRN | Iran |
| CHN | China |
| GBR | United Kingdom |
| FRA | France |
| DEU | Germany |
| LBN | Lebanon |
| SYR | Syria |
| IRQ | Iraq |
| YEM | Yemen |
| PSE | Palestine |
| QAT | Qatar |
| TUR | Turkey |
| SAU | Saudi Arabia |
| IND | India |
| PAK | Pakistan |
| AFG | Afghanistan |

---

## Cost Estimation

| Query Type | Table | Days Scanned | Est. GB |
|------------|-------|--------------|---------|
| `events` (no partition) | events | 30 | **65GB** ❌ |
| `events_partitioned` | events_partitioned | 30 | **398MB** ✅ |
| `events_partitioned` | events_partitioned | 7 | ~100MB |
| `events_partitioned` | events_partitioned | 90 | ~1.2GB |

**Recommendation:** Query `events_partitioned` weekly = 398MB × 4 = 1.6GB/month (0.16% of free tier)

You could run this query 2,500 times per month and still be free.

---

## Export Format

After running query in BigQuery:
1. Click **SAVE RESULTS**
2. Choose **JSON**
3. Download file
4. Save to `data/conflicts.json` in this repo
5. Update `lastUpdated` field
6. Commit and push

---

## Automation (Future)

Could automate with GitHub Actions:
```yaml
# .github/workflows/update-conflicts.yml
# Run weekly to fetch new data
# Requires GCP service account with BigQuery access
```

For now: manual weekly updates.
