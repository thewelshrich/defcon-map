/**
 * DEFCON Map - Data Fetching and Processing Layer
 * Uses GDELT API for conflict event data
 */

// Rate limiting configuration
const RATE_LIMIT = {
  minInterval: 1000, // 1 second between requests
  lastRequest: 0
};

// GDELT API endpoints
const GDELT_DOC_API = 'https://api.gdeltproject.org/api/v2/doc/doc';
const GDELT_GEO_API = 'https://api.gdeltproject.org/api/v2/geo/geo';

// Event type weights for DEFCON calculation
const EVENT_WEIGHTS = {
  battle: 3,
  explosion: 2,
  protest: 1,
  civilian: 2
};

/**
 * Rate limiter - ensures we don't exceed GDELT API limits
 */
async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - RATE_LIMIT.lastRequest;
  
  if (timeSinceLastRequest < RATE_LIMIT.minInterval) {
    await new Promise(resolve => 
      setTimeout(resolve, RATE_LIMIT.minInterval - timeSinceLastRequest)
    );
  }
  
  RATE_LIMIT.lastRequest = Date.now();
}

/**
 * Fetch recent conflict events from GDELT API
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<Array>} Array of standardized event objects
 */
async function fetchRecentConflicts(days = 7) {
  try {
    await rateLimit();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const formatDate = (date) => date.toISOString().split('T')[0].replace(/-/g, '');
    
    // Build query for conflict events
    const query = `(conflict OR war OR battle OR explosion OR attack OR protest OR violence) sourcelang:english`;
    const url = `${GDELT_DOC_API}?query=${encodeURIComponent(query)}&mode=artlist&format=json&maxrecords=250&startdatetime=${formatDate(startDate)}000000&enddatetime=${formatDate(endDate)}000000`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GDELT API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return parseGDELTResponse(data);
    
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    // Return mock data as fallback
    console.log('Falling back to mock data...');
    return getMockData();
  }
}

/**
 * Parse GDELT API response into standardized format
 * @param {Object} data - Raw GDELT API response
 * @returns {Array} Array of standardized event objects
 */
function parseGDELTResponse(data) {
  if (!data || !data.articles) {
    return [];
  }
  
  return data.articles.map((article, index) => {
    // Determine event type from title/content
    const text = (article.title + ' ' + (article.seendate || '')).toLowerCase();
    let type = 'civilian';
    
    if (text.includes('battle') || text.includes('war') || text.includes('combat')) {
      type = 'battle';
    } else if (text.includes('explosion') || text.includes('bomb') || text.includes('blast')) {
      type = 'explosion';
    } else if (text.includes('protest') || text.includes('demonstration') || text.includes('rally')) {
      type = 'protest';
    }
    
    // Extract location (simplified - in production would use GDELT's geo data)
    const locationMatch = text.match(/in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    const country = locationMatch ? locationMatch[1] : 'Unknown';
    
    return {
      id: `gdelt-${Date.now()}-${index}`,
      date: new Date(article.seendate || article.date),
      type: type,
      lat: article.lat || 0,
      lng: article.lng || 0,
      country: country,
      fatalities: extractFatalities(text),
      source: article.url || 'GDELT'
    };
  });
}

/**
 * Extract fatality count from text
 * @param {string} text - Text to search
 * @returns {number} Estimated fatality count
 */
function extractFatalities(text) {
  const patterns = [
    /(\d+)\s+(?:people|civilians|soldiers|killed|dead|deaths)/i,
    /(?:killed|dead).*?(\d+)/i,
    /(\d+)\s+(?:died|dies)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return 0;
}

/**
 * Calculate global DEFCON level based on events
 * @param {Array} events - Array of event objects
 * @returns {Object} DEFCON level and breakdown
 */
function calculateDEFCONLevel(events) {
  if (!events || events.length === 0) {
    return {
      level: 5,
      description: 'FADE OUT - Normal readiness',
      score: 0,
      breakdown: {
        totalEvents: 0,
        weightedScore: 0,
        totalFatalities: 0
      }
    };
  }
  
  // Calculate weighted score
  let weightedScore = 0;
  let totalFatalities = 0;
  
  const typeCounts = {
    battle: 0,
    explosion: 0,
    protest: 0,
    civilian: 0
  };
  
  events.forEach(event => {
    const weight = EVENT_WEIGHTS[event.type] || 1;
    weightedScore += weight;
    totalFatalities += event.fatalities || 0;
    typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
  });
  
  // Factor in fatalities ( logarithmic scale to prevent extreme values)
  const fatalityFactor = Math.log10(totalFatalities + 1) * 2;
  
  // Final score combines event weights and fatalities
  const finalScore = weightedScore + fatilityFactor;
  
  // Map to DEFCON level (1 = highest threat, 5 = lowest)
  let level;
  let description;
  
  if (finalScore >= 100) {
    level = 1;
    description = 'COCKED PISTOL - Maximum readiness';
  } else if (finalScore >= 50) {
    level = 2;
    description = 'FAST PACE - Armed forces ready';
  } else if (finalScore >= 25) {
    level = 3;
    description = 'ROUND HOUSE - Air force ready';
  } else if (finalScore >= 10) {
    level = 4;
    description = 'DOUBLE TAKE - Increased intelligence';
  } else {
    level = 5;
    description = 'FADE OUT - Normal readiness';
  }
  
  return {
    level,
    description,
    score: finalScore,
    breakdown: {
      totalEvents: events.length,
      weightedScore,
      totalFatalities,
      typeCounts
    }
  };
}

/**
 * Get statistics for a specific country
 * @param {string} countryCode - ISO country code or name
 * @param {Array} events - Array of event objects (optional, will fetch if not provided)
 * @returns {Promise<Object>} Country statistics
 */
async function getCountryStats(countryCode, events = null) {
  try {
    // Fetch events if not provided
    if (!events) {
      events = await fetchRecentConflicts(7);
    }
    
    // Filter events by country
    const countryEvents = events.filter(event => {
      const eventCountry = event.country.toLowerCase();
      const searchCountry = countryCode.toLowerCase();
      return eventCountry.includes(searchCountry) || searchCountry.includes(eventCountry);
    });
    
    // Calculate country-specific DEFCON
    const defcon = calculateDEFCONLevel(countryEvents);
    
    // Get type breakdown
    const typeBreakdown = {};
    countryEvents.forEach(event => {
      typeBreakdown[event.type] = (typeBreakdown[event.type] || 0) + 1;
    });
    
    return {
      country: countryCode,
      totalEvents: countryEvents.length,
      defconLevel: defcon.level,
      fatalities: countryEvents.reduce((sum, e) => sum + (e.fatalities || 0), 0),
      typeBreakdown,
      events: countryEvents,
      lastUpdated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error getting stats for ${countryCode}:`, error);
    return {
      country: countryCode,
      error: error.message,
      totalEvents: 0,
      defconLevel: 5
    };
  }
}

/**
 * Fetch geocoded events from GDELT Geo API
 * @param {string} query - Search query
 * @param {number} days - Days to look back
 * @returns {Promise<Array>} Array of geocoded events
 */
async function fetchGeoEvents(query = 'conflict', days = 7) {
  try {
    await rateLimit();
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const formatGeoDate = (date) => date.toISOString().split('T')[0].replace(/-/g, '');
    
    const url = `${GDELT_GEO_API}?query=${encodeURIComponent(query)}&mode=points&format=json&maxpoints=250&startdatetime=${formatGeoDate(startDate)}&enddatetime=${formatGeoDate(endDate)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GDELT Geo API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform geo data to our format
    if (data && data.points) {
      return data.points.map((point, index) => ({
        id: `geo-${Date.now()}-${index}`,
        date: new Date(point.date || Date.now()),
        type: determineEventType(point.name || ''),
        lat: point.lat || point.latitude || 0,
        lng: point.lng || point.longitude || 0,
        country: point.country || 'Unknown',
        fatalities: 0,
        source: 'GDELT Geo'
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error('Error fetching geo events:', error);
    return [];
  }
}

/**
 * Determine event type from text
 * @param {string} text - Text to analyze
 * @returns {string} Event type
 */
function determineEventType(text) {
  const lower = text.toLowerCase();
  
  if (/battle|war|combat|fighting/.test(lower)) return 'battle';
  if (/explosion|bomb|blast|detonat/.test(lower)) return 'explosion';
  if (/protest|demonstrat|rally|march/.test(lower)) return 'protest';
  
  return 'civilian';
}

/**
 * Generate mock data for testing
 * @returns {Array} Array of mock event objects
 */
function getMockData() {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  return [
    {
      id: `mock-${now}-1`,
      date: new Date(now - 1 * day),
      type: 'battle',
      lat: 33.2233,
      lng: 43.6793,
      country: 'Iraq',
      fatalities: 12,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-2`,
      date: new Date(now - 2 * day),
      type: 'explosion',
      lat: 34.5229,
      lng: 69.1778,
      country: 'Afghanistan',
      fatalities: 8,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-3`,
      date: new Date(now - 3 * day),
      type: 'protest',
      lat: 41.0082,
      lng: 28.9784,
      country: 'Turkey',
      fatalities: 0,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-4`,
      date: new Date(now - 1 * day),
      type: 'battle',
      lat: 48.3794,
      lng: 31.1656,
      country: 'Ukraine',
      fatalities: 25,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-5`,
      date: new Date(now - 4 * day),
      type: 'civilian',
      lat: 15.5527,
      lng: 48.5164,
      country: 'Yemen',
      fatalities: 5,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-6`,
      date: new Date(now - 2 * day),
      type: 'explosion',
      lat: 33.3152,
      lng: 44.3661,
      country: 'Iraq',
      fatalities: 15,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-7`,
      date: new Date(now - 5 * day),
      type: 'protest',
      lat: 35.6892,
      lng: 51.3890,
      country: 'Iran',
      fatalities: 2,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-8`,
      date: new Date(now - 3 * day),
      type: 'battle',
      lat: 12.8628,
      lng: 30.2176,
      country: 'Sudan',
      fatalities: 30,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-9`,
      date: new Date(now - 6 * day),
      type: 'explosion',
      lat: 36.2048,
      lng: 37.9292,
      country: 'Syria',
      fatalities: 20,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-10`,
      date: new Date(now - 1 * day),
      type: 'protest',
      lat: 23.6850,
      lng: 90.3563,
      country: 'Bangladesh',
      fatalities: 0,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-11`,
      date: new Date(now - 4 * day),
      type: 'battle',
      lat: -4.0383,
      lng: 39.6692,
      country: 'Somalia',
      fatalities: 18,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-12`,
      date: new Date(now - 7 * day),
      type: 'civilian',
      lat: 7.3697,
      lng: 12.3547,
      country: 'Cameroon',
      fatalities: 7,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-13`,
      date: new Date(now - 2 * day),
      type: 'explosion',
      lat: 19.4326,
      lng: -99.1332,
      country: 'Mexico',
      fatalities: 3,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-14`,
      date: new Date(now - 5 * day),
      type: 'battle',
      lat: 15.9389,
      lng: 97.9558,
      country: 'Myanmar',
      fatalities: 22,
      source: 'Mock Data'
    },
    {
      id: `mock-${now}-15`,
      date: new Date(now - 3 * day),
      type: 'protest',
      lat: -34.6037,
      lng: -58.3816,
      country: 'Argentina',
      fatalities: 0,
      source: 'Mock Data'
    }
  ];
}

// Export functions for use in other modules
export {
  fetchRecentConflicts,
  parseGDELTResponse,
  calculateDEFCONLevel,
  getCountryStats,
  fetchGeoEvents,
  getMockData,
  EVENT_WEIGHTS
};
