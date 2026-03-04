# GDELT BigQuery Queries

## Zero-Cost Strategy

- **Free tier:** 1TB query processing per month
- **Our usage:** ~2GB per weekly query = ~8GB/month (0.8% of allowance)
- **Update cadence:** Weekly (every Sunday)

---

## Optimized Query (Minimal Scan)

```sql
-- Scan last 30 days of material conflicts
-- Estimated data scanned: ~1-2GB
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
FROM `gdelt-bq.gdeltv2.events`
WHERE 
  SQLDATE >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND QuadClass = 4
  AND Actor1CountryCode != Actor2CountryCode
  AND Actor1CountryCode IS NOT NULL
  AND Actor2CountryCode IS NOT NULL
  AND ActionGeo_Lat IS NOT NULL
ORDER BY GoldsteinScale ASC
LIMIT 1000
```

---

## Query for Specific Countries

```sql
-- Ukraine-Russia conflicts only
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
FROM `gdelt-bq.gdeltv2.events`
WHERE 
  SQLDATE >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
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
FROM `gdelt-bq.gdeltv2.events`
WHERE 
  SQLDATE >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
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

| Query Type | Days Scanned | Est. GB |
|------------|--------------|---------|
| Full table scan | 365+ | 50GB |
| 90 days | 90 | 12GB |
| 30 days | 30 | 4GB |
| 7 days | 7 | 1GB |

**Recommendation:** Query 30 days weekly = 4GB × 4 = 16GB/month

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
