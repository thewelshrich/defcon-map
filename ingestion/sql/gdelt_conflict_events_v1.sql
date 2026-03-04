SELECT
  GLOBALEVENTID,
  SQLDATE,
  DATEADDED,
  EventCode,
  EventRootCode,
  EventBaseCode,
  QuadClass,
  GoldsteinScale,
  NumMentions,
  Actor1CountryCode,
  Actor2CountryCode,
  Actor1Name,
  Actor2Name,
  ActionGeo_CountryCode,
  ActionGeo_Type,
  ActionGeo_FullName,
  ActionGeo_Lat,
  ActionGeo_Long,
  SOURCEURL
FROM `gdelt-bq.gdeltv2.events_partitioned`
WHERE
  _PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
  AND QuadClass = 4
  AND (
    ActionGeo_CountryCode IS NOT NULL
    OR Actor1CountryCode IS NOT NULL
    OR Actor2CountryCode IS NOT NULL
  )
  AND ActionGeo_Lat IS NOT NULL
  AND ActionGeo_Long IS NOT NULL
ORDER BY DATEADDED DESC, NumMentions DESC
