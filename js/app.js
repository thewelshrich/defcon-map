/**
 * DEFCON Map - Main Application Entry Point
 * Initializes the map and sets up event handlers
 */

import { initMap, addEventMarker, clearMarkers, on, setView, getCountryAtPoint, CONFIG } from './map.js';

// Application state
const state = {
  markers: [],
  selectedCountry: null,
  initialized: false
};

/**
 * Initialize the application
 */
function init() {
  if (state.initialized) {
    console.warn('Map already initialized');
    return;
  }

  // Initialize map
  initMap('map', {
    // Override config here if needed
    projection: {
      scale: 150,
      center: [0, 20]
    }
  });

  // Set up event handlers
  setupEventHandlers();

  // Add demo markers if in demo mode
  if (new URLSearchParams(window.location.search).has('demo')) {
    addDemoMarkers();
  }

  state.initialized = true;
  console.log('DEFCON Map initialized');
}

/**
 * Set up event handlers for map interactions
 */
function setupEventHandlers() {
  // Country hover events
  on('country:hover', (event) => {
    const { feature } = event.detail;
    state.selectedCountry = feature;
    updateInfoPanel(feature);
  });

  on('country:leave', () => {
    state.selectedCountry = null;
    clearInfoPanel();
  });

  // Country click events
  on('country:click', (event) => {
    const { feature } = event.detail;
    console.log('Country clicked:', feature.properties?.name || feature.id);
    handleCountrySelect(feature);
  });

  // Marker click events
  on('marker:click', (event) => {
    const { marker } = event.detail;
    console.log('Marker clicked:', marker);
    handleMarkerSelect(marker);
  });
}

/**
 * Handle country selection
 */
function handleCountrySelect(feature) {
  const countryName = feature.properties?.name || feature.id || 'Unknown';
  
  // Example: Add a marker at country center
  // const center = d3.geoCentroid(feature);
  // addEventMarker(center[1], center[0], 'default', { country: countryName });
  
  // Emit custom event for external integrations
  window.dispatchEvent(new CustomEvent('defcon:country:selected', {
    detail: { feature, name: countryName }
  }));
}

/**
 * Handle marker selection
 */
function handleMarkerSelect(marker) {
  // Show marker info
  showMarkerInfo(marker);
  
  // Emit custom event
  window.dispatchEvent(new CustomEvent('defcon:marker:selected', {
    detail: { marker }
  }));
}

/**
 * Update the info panel with country data
 */
function updateInfoPanel(feature) {
  const panel = document.getElementById('info-panel');
  if (!panel) return;

  const name = feature.properties?.name || `Country ${feature.id}`;
  panel.innerHTML = `
    <div class="info-country">
      <h3>${name}</h3>
      <p class="info-id">ID: ${feature.id}</p>
    </div>
  `;
  panel.classList.add('visible');
}

/**
 * Clear the info panel
 */
function clearInfoPanel() {
  const panel = document.getElementById('info-panel');
  if (!panel) return;
  
  panel.classList.remove('visible');
  setTimeout(() => {
    if (!state.selectedCountry) {
      panel.innerHTML = '';
    }
  }, 300);
}

/**
 * Show marker information
 */
function showMarkerInfo(marker) {
  const panel = document.getElementById('info-panel');
  if (!panel) return;

  panel.innerHTML = `
    <div class="info-marker">
      <h3>Event Marker</h3>
      <p class="info-type">Type: ${marker.type}</p>
      <p class="info-coords">Location: ${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}</p>
      ${marker.data ? `<pre>${JSON.stringify(marker.data, null, 2)}</pre>` : ''}
    </div>
  `;
  panel.classList.add('visible');
}

/**
 * Add demo markers to showcase the map
 */
function addDemoMarkers() {
  // Major cities / strategic locations
  const demoLocations = [
    { lat: 51.5074, lng: -0.1278, type: 'safe', name: 'London' },
    { lat: 40.7128, lng: -74.0060, type: 'warning', name: 'New York' },
    { lat: 35.6762, lng: 139.6503, type: 'default', name: 'Tokyo' },
    { lat: 55.7558, lng: 37.6173, type: 'alert', name: 'Moscow' },
    { lat: -33.8688, lng: 151.2093, type: 'safe', name: 'Sydney' },
    { lat: 48.8566, lng: 2.3522, type: 'warning', name: 'Paris' },
    { lat: 39.9042, lng: 116.4074, type: 'default', name: 'Beijing' }
  ];

  demoLocations.forEach(loc => {
    const id = addEventMarker(loc.lat, loc.lng, loc.type, { name: loc.name });
    state.markers.push({ id, ...loc });
  });
}

/**
 * Clear all markers (public API)
 */
function clearAllMarkers() {
  clearMarkers();
  state.markers = [];
}

/**
 * Add a new event marker (public API)
 */
function addMarker(lat, lng, type = 'default', data = {}) {
  const id = addEventMarker(lat, lng, type, data);
  state.markers.push({ id, lat, lng, type, data });
  return id;
}

/**
 * Zoom to a specific location
 */
function zoomTo(lat, lng, zoomLevel = 4) {
  setView(lat, lng, zoomLevel);
}

// Expose API globally for console access / external scripts
window.DEFCONMap = {
  init,
  addMarker,
  clearAllMarkers,
  zoomTo,
  getCountryAtPoint,
  getState: () => ({ ...state })
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {
  init,
  addMarker,
  clearAllMarkers,
  zoomTo,
  state
};
