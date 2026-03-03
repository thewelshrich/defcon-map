# DEFCON Map - Data Module

Data fetching and processing layer for the DEFCON map project.

## Features

- **GDELT API Integration**: Fetches real-time conflict data from GDELT Doc and Geo APIs
- **Rate Limiting**: Built-in protection against API rate limits
- **DEFCON Calculation**: Calculates global threat level (1-5) based on events
- **Country Statistics**: Get conflict statistics for specific countries
- **Mock Data**: Test data for development without API access
- **Error Handling**: Graceful fallback to mock data on API failures

## Usage

### Import

```javascript
import {
  fetchRecentConflicts,
  calculateDEFCONLevel,
  getCountryStats,
  getMockData
} from './data.js';
```

### Fetch Recent Conflicts

```javascript
// Get conflicts from last 7 days
const events = await fetchRecentConflicts(7);

// Events are returned in standardized format:
// {
//   id: string,
//   date: Date,
//   type: 'battle' | 'explosion' | 'protest' | 'civilian',
//   lat: number,
//   lng: number,
//   country: string,
//   fatalities: number,
//   source: string
// }
```

### Calculate DEFCON Level

```javascript
const events = await fetchRecentConflicts(7);
const defcon = calculateDEFCONLevel(events);

console.log(`DEFCON ${defcon.level}: ${defcon.description}`);
console.log(`Score: ${defcon.score}`);
console.log(`Total events: ${defcon.breakdown.totalEvents}`);
```

### Get Country Statistics

```javascript
// Get stats for a specific country
const iraqStats = await getCountryStats('Iraq');
console.log(`${iraqStats.totalEvents} events in Iraq`);
console.log(`DEFCON Level: ${iraqStats.defconLevel}`);
```

### Use Mock Data

```javascript
// For testing without API access
const mockEvents = getMockData();
const defcon = calculateDEFCONLevel(mockEvents);
```

## DEFCON Levels

| Level | Name | Description | Trigger |
|-------|------|-------------|---------|
| 1 | COCKED PISTOL | Maximum readiness | Score ≥ 100 |
| 2 | FAST PACE | Armed forces ready | Score ≥ 50 |
| 3 | ROUND HOUSE | Air force ready | Score ≥ 25 |
| 4 | DOUBLE TAKE | Increased intelligence | Score ≥ 10 |
| 5 | FADE OUT | Normal readiness | Score < 10 |

## Scoring System

The DEFCON score is calculated using:

1. **Event Weights**:
   - Battle: 3 points
   - Explosion: 2 points
   - Civilian: 2 points
   - Protest: 1 point

2. **Fatality Factor**: `log10(fatalities + 1) × 2`

3. **Final Score**: `sum(event weights) + fatality factor`

## GDELT API Notes

- **Free to use**: No authentication required
- **Rate limits**: Enforced by the module (1 second between requests)
- **Endpoints used**:
  - Doc API: For article-based conflict reports
  - Geo API: For geocoded events with coordinates
- **Fallback**: Automatically falls back to mock data on errors

## Testing

```bash
node --experimental-modules src/js/data.test.js
```

## Error Handling

The module includes comprehensive error handling:

- API failures → Falls back to mock data
- Invalid responses → Returns empty arrays
- Network errors → Logged and handled gracefully
- Rate limiting → Automatic delays between requests

## Future Enhancements

- [ ] Cache API responses
- [ ] Add WebSocket support for real-time updates
- [ ] Implement more sophisticated DEFCON calculation
- [ ] Add support for historical data analysis
- [ ] Integrate additional data sources (ACLED, etc.)
