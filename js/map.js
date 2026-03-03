/**
 * DEFCON Map - D3.js v7 Implementation
 * A minimalist, glowing world map inspired by the DEFCON game
 */

// State management
let svg, g, countriesGroup, markersGroup;
let projection, path;
let zoom;
let width, height;
let countries = [];
let markers = [];
let currentTransform = { x: 0, y: 0, k: 1 };

// Configuration
const CONFIG = {
  projection: {
    scale: 150,
    center: [0, 20],
    translate: null // Set during init
  },
  colors: {
    background: '#0a0a0a',
    land: '#0a0a0a',
    border: '#00ffff',
    borderHover: '#00ffff',
    glow: '#00ffff',
    marker: {
      default: '#00ffff',
      alert: '#ff0000',
      warning: '#ffaa00',
      safe: '#00ff00'
    }
  },
  glow: {
    stdDeviation: 2,
    floodOpacity: 0.8
  },
  wrap: {
    enabled: true,
    copies: 3 // Center + left + right for infinite scroll feel
  }
};

/**
 * Initialize the map
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Optional configuration overrides
 */
export function initMap(containerId = 'map', options = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  // Merge options with config
  Object.assign(CONFIG, options);

  // Get dimensions
  width = container.clientWidth;
  height = container.clientHeight;
  CONFIG.projection.translate = [width / 2, height / 2];

  // Create SVG
  svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'defcon-map')
    .style('background', CONFIG.colors.background);

  // Add SVG filters for glow effects
  createGlowFilters();

  // Create main group for zoom/pan
  g = svg.append('g').attr('class', 'map-container');

  // Create groups for countries and markers
  countriesGroup = g.append('g').attr('class', 'countries');
  markersGroup = g.append('g').attr('class', 'markers');

  // Set up projection
  projection = d3.geoMercator()
    .scale(CONFIG.projection.scale)
    .center(CONFIG.projection.center)
    .translate(CONFIG.projection.translate);

  path = d3.geoPath().projection(projection);

  // Set up zoom behavior
  zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', handleZoom);

  svg.call(zoom);

  // Load and render countries
  loadCountries();

  // Handle window resize
  window.addEventListener('resize', debounce(handleResize, 250));

  // Set up wrap on pan
  if (CONFIG.wrap.enabled) {
    svg.on('mousemove.wrap', handleWrap);
  }
}

/**
 * Create SVG glow filters
 */
function createGlowFilters() {
  const defs = svg.append('defs');

  // Main glow filter for borders
  const filter = defs.append('filter')
    .attr('id', 'glow')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filter.append('feGaussianBlur')
    .attr('stdDeviation', CONFIG.glow.stdDeviation)
    .attr('result', 'coloredBlur');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  // Stronger glow for hover
  const filterHover = defs.append('filter')
    .attr('id', 'glow-strong')
    .attr('x', '-50%')
    .attr('y', '-50%')
    .attr('width', '200%')
    .attr('height', '200%');

  filterHover.append('feGaussianBlur')
    .attr('stdDeviation', CONFIG.glow.stdDeviation * 2)
    .attr('result', 'coloredBlur');

  const feMergeHover = filterHover.append('feMerge');
  feMergeHover.append('feMergeNode').attr('in', 'coloredBlur');
  feMergeHover.append('feMergeNode').attr('in', 'SourceGraphic');

  // Pulse animation for markers
  defs.append('style').text(`
    @keyframes marker-pulse {
      0%, 100% { opacity: 1; r: 4px; }
      50% { opacity: 0.5; r: 8px; }
    }
    .marker-pulse {
      animation: marker-pulse 1.5s ease-in-out infinite;
    }
    @keyframes marker-ring {
      0% { r: 4px; opacity: 0.8; }
      100% { r: 20px; opacity: 0; }
    }
    .marker-ring {
      animation: marker-ring 2s ease-out infinite;
    }
  `);
}

/**
 * Load country data from CDN
 */
async function loadCountries() {
  try {
    // Using world-atlas TopoJSON
    const worldUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    const world = await d3.json(worldUrl);

    // Convert TopoJSON to GeoJSON
    countries = topojson.feature(world, world.objects.countries).features;

    renderCountries();
  } catch (error) {
    console.error('Failed to load country data:', error);
  }
}

/**
 * Render countries on the map
 */
function renderCountries() {
  if (!CONFIG.wrap.enabled) {
    renderCountrySet(countriesGroup, countries, 0);
    return;
  }

  // Render 3 copies for wrapping effect
  const worldWidth = width * 2; // Approximate world width at this projection
  for (let i = -1; i <= 1; i++) {
    const group = countriesGroup.append('g')
      .attr('class', `countries-copy-${i}`)
      .attr('transform', `translate(${i * worldWidth}, 0)`);
    renderCountrySet(group, countries, i * worldWidth);
  }
}

/**
 * Render a set of countries
 * @param {d3.selection} group - D3 selection to append to
 * @param {Array} data - Country features
 * @param {number} offsetX - Horizontal offset
 */
function renderCountrySet(group, data, offsetX) {
  group.selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'country')
    .attr('fill', CONFIG.colors.land)
    .attr('stroke', CONFIG.colors.border)
    .attr('stroke-width', 0.5)
    .attr('filter', 'url(#glow)')
    .style('cursor', 'pointer')
    .on('mouseover', handleCountryHover)
    .on('mouseout', handleCountryLeave)
    .on('click', handleCountryClick);
}

/**
 * Handle country hover
 */
function handleCountryHover(event, d) {
  d3.select(this)
    .transition()
    .duration(150)
    .attr('stroke-width', 2)
    .attr('filter', 'url(#glow-strong)');

  // Emit custom event for external handlers
  svg.node().dispatchEvent(new CustomEvent('country:hover', {
    detail: { feature: d, event }
  }));
}

/**
 * Handle country leave
 */
function handleCountryLeave(event, d) {
  d3.select(this)
    .transition()
    .duration(150)
    .attr('stroke-width', 0.5)
    .attr('filter', 'url(#glow)');

  svg.node().dispatchEvent(new CustomEvent('country:leave', {
    detail: { feature: d, event }
  }));
}

/**
 * Handle country click
 */
function handleCountryClick(event, d) {
  svg.node().dispatchEvent(new CustomEvent('country:click', {
    detail: { feature: d, event }
  }));
}

/**
 * Handle zoom events
 */
function handleZoom(event) {
  const { x, y, k } = event.transform;
  currentTransform = { x, y, k };
  g.attr('transform', event.transform);
}

/**
 * Handle wrapping for infinite scroll feel
 */
function handleWrap(event) {
  if (!CONFIG.wrap.enabled) return;

  // The wrapping is visual - we have 3 copies
  // This could be enhanced to actually shift copies as user pans
}

/**
 * Handle window resize
 */
function handleResize() {
  const container = svg.node().parentNode;
  width = container.clientWidth;
  height = container.clientHeight;

  svg.attr('width', width).attr('height', height);

  CONFIG.projection.translate = [width / 2, height / 2];
  projection.translate(CONFIG.projection.translate);

  // Re-render countries
  countriesGroup.selectAll('*').remove();
  renderCountries();

  // Re-render markers
  updateMarkerPositions();
}

/**
 * Add an event marker to the map
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} type - Marker type: 'default', 'alert', 'warning', 'safe'
 * @param {Object} data - Additional data to attach
 * @returns {string} Marker ID
 */
export function addEventMarker(lat, lng, type = 'default', data = {}) {
  const id = `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const color = CONFIG.colors.marker[type] || CONFIG.colors.marker.default;

  const marker = {
    id,
    lat,
    lng,
    type,
    color,
    data,
    element: null
  };

  markers.push(marker);
  renderMarker(marker);

  return id;
}

/**
 * Render a single marker
 */
function renderMarker(marker) {
  const [x, y] = projection([marker.lng, marker.lat]);

  if (x === null || y === null) return;

  const group = markersGroup.append('g')
    .attr('class', `marker marker-${marker.type}`)
    .attr('data-id', marker.id)
    .attr('transform', `translate(${x}, ${y})`);

  // Outer expanding ring
  group.append('circle')
    .attr('r', 4)
    .attr('fill', 'none')
    .attr('stroke', marker.color)
    .attr('stroke-width', 2)
    .attr('class', 'marker-ring')
    .attr('filter', 'url(#glow)');

  // Inner pulsing dot
  group.append('circle')
    .attr('r', 4)
    .attr('fill', marker.color)
    .attr('class', 'marker-pulse')
    .attr('filter', 'url(#glow)');

  // Click handler
  group.on('click', (event) => {
    event.stopPropagation();
    svg.node().dispatchEvent(new CustomEvent('marker:click', {
      detail: { marker, event }
    }));
  });

  marker.element = group;
}

/**
 * Update marker positions after projection change
 */
function updateMarkerPositions() {
  markers.forEach(marker => {
    if (marker.element) {
      const [x, y] = projection([marker.lng, marker.lat]);
      if (x !== null && y !== null) {
        marker.element.attr('transform', `translate(${x}, ${y})`);
      }
    }
  });
}

/**
 * Remove a specific marker
 * @param {string} markerId - ID of marker to remove
 */
export function removeMarker(markerId) {
  const index = markers.findIndex(m => m.id === markerId);
  if (index !== -1) {
    const marker = markers[index];
    if (marker.element) {
      marker.element.remove();
    }
    markers.splice(index, 1);
  }
}

/**
 * Clear all markers from the map
 */
export function clearMarkers() {
  markersGroup.selectAll('*').remove();
  markers = [];
}

/**
 * Get all current markers
 * @returns {Array} Array of marker objects
 */
export function getMarkers() {
  return [...markers];
}

/**
 * Set map view to specific coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoomLevel - Zoom level (optional)
 */
export function setView(lat, lng, zoomLevel) {
  const [x, y] = projection([lng, lat]);
  if (x === null || y === null) return;

  const transform = d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(zoomLevel || currentTransform.k)
    .translate(-x, -y);

  svg.transition()
    .duration(750)
    .call(zoom.transform, transform);
}

/**
 * Get country at a point
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Object|null} Country feature or null
 */
export function getCountryAtPoint(x, y) {
  const [lng, lat] = projection.invert([x, y]);
  if (!lng || !lat) return null;

  // Find country containing this point
  return countries.find(country => {
    if (!country.geometry) return false;
    return d3.geoContains(country, [lng, lat]);
  });
}

/**
 * Subscribe to map events
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export function on(event, callback) {
  svg.node().addEventListener(event, callback);
}

/**
 * Unsubscribe from map events
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export function off(event, callback) {
  svg.node().removeEventListener(event, callback);
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export configuration for external modification
export { CONFIG };
