/**
 * Simple test for data.js functions
 * Run with: node --experimental-modules src/js/data.test.js
 */

import {
  fetchRecentConflicts,
  calculateDEFCONLevel,
  getCountryStats,
  getMockData
} from './data.js';

// Test mock data
console.log('=== Testing Mock Data ===\n');

const mockEvents = getMockData();
console.log(`Generated ${mockEvents.length} mock events`);
console.log('Sample event:', JSON.stringify(mockEvents[0], null, 2));

// Test DEFCON calculation
console.log('\n=== Testing DEFCON Calculation ===\n');

const defcon = calculateDEFCONLevel(mockEvents);
console.log('DEFCON Level:', defcon.level);
console.log('Description:', defcon.description);
console.log('Score:', defcon.score.toFixed(2));
console.log('Breakdown:', JSON.stringify(defcon.breakdown, null, 2));

// Test country stats
console.log('\n=== Testing Country Stats ===\n');

async function testCountryStats() {
  const iraqStats = await getCountryStats('Iraq', mockEvents);
  console.log('Iraq Stats:', JSON.stringify(iraqStats, null, 2));
  
  const ukraineStats = await getCountryStats('Ukraine', mockEvents);
  console.log('\nUkraine Stats:', JSON.stringify(ukraineStats, null, 2));
}

testCountryStats();

// Test with empty data
console.log('\n=== Testing Empty Data ===\n');

const emptyDefcon = calculateDEFCONLevel([]);
console.log('Empty DEFCON:', JSON.stringify(emptyDefcon, null, 2));

console.log('\n=== All Tests Complete ===');
