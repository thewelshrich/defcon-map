/**
 * DEFCON Map Audio System
 * Web Audio API-based ambient drone and alert sounds
 */

// Audio context and state
let audioContext = null;
let masterGain = null;
let ambientOscillators = [];
let ambientGains = [];
let isAmbientPlaying = false;
let isMuted = false;
let currentVolume = 0.3;

/**
 * Initialize the audio system
 * Must be called after user interaction (browser autoplay policy)
 */
function initAudio() {
  if (audioContext) return;
  
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create master gain for volume control
  masterGain = audioContext.createGain();
  masterGain.gain.value = currentVolume;
  masterGain.connect(audioContext.destination);
  
  console.log('[Audio] System initialized');
}

/**
 * Create ambient drone using multiple oscillators for richer sound
 */
function createAmbientDrone() {
  if (!audioContext) {
    console.warn('[Audio] Context not initialized');
    return;
  }
  
  // Clean up existing oscillators
  stopAmbient();
  
  // Base frequencies for ominous drone
  const frequencies = [
    { freq: 55, type: 'sine', gain: 0.15 },      // Low A - foundation
    { freq: 82.5, type: 'sine', gain: 0.08 },    // E - fifth
    { freq: 110, type: 'triangle', gain: 0.05 }, // A octave - shimmer
    { freq: 55.5, type: 'sine', gain: 0.1 },     // Slight detune for movement
  ];
  
  frequencies.forEach((config, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = config.type;
    osc.frequency.value = config.freq;
    
    // Add slow LFO modulation for movement
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.1 + (index * 0.05); // Slightly different rates
    lfoGain.gain.value = config.freq * 0.01;    // Subtle pitch wobble
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    
    gain.gain.value = config.gain;
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    
    ambientOscillators.push(osc, lfo);
    ambientGains.push(gain, lfoGain);
  });
  
  isAmbientPlaying = true;
  console.log('[Audio] Ambient drone started');
}

/**
 * Start playing ambient background
 */
function playAmbient() {
  if (!audioContext) {
    initAudio();
  }
  
  // Resume context if suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  if (!isAmbientPlaying) {
    createAmbientDrone();
  }
  
  // Update UI
  updateAudioButton();
}

/**
 * Stop ambient drone
 */
function stopAmbient() {
  ambientOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {}
  });
  
  ambientGains.forEach(gain => {
    try {
      gain.disconnect();
    } catch (e) {}
  });
  
  ambientOscillators = [];
  ambientGains = [];
  isAmbientPlaying = false;
  
  updateAudioButton();
  console.log('[Audio] Ambient stopped');
}

/**
 * Toggle ambient on/off
 */
function toggleAmbient() {
  if (isAmbientPlaying) {
    stopAmbient();
  } else {
    playAmbient();
  }
}

/**
 * Play alert sound for new events
 * @param {string} type - Alert type: 'critical', 'warning', 'info'
 */
function playAlert(type = 'critical') {
  if (!audioContext || isMuted) return;
  
  // Resume context if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  const now = audioContext.currentTime;
  
  // Different sounds for different alert types
  const configs = {
    critical: {
      freq: 880,
      duration: 0.15,
      attack: 0.01,
      decay: 0.14,
      gain: 0.4,
      repeats: 3
    },
    warning: {
      freq: 660,
      duration: 0.2,
      attack: 0.02,
      decay: 0.18,
      gain: 0.3,
      repeats: 2
    },
    info: {
      freq: 440,
      duration: 0.1,
      attack: 0.01,
      decay: 0.09,
      gain: 0.2,
      repeats: 1
    }
  };
  
  const config = configs[type] || configs.info;
  
  // Play repeated blips
  for (let i = 0; i < config.repeats; i++) {
    const startTime = now + (i * (config.duration + 0.05));
    playBlip(startTime, config);
  }
  
  console.log(`[Audio] Alert played: ${type}`);
}

/**
 * Play a single blip sound
 */
function playBlip(startTime, config) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.value = config.freq;
  
  // ADSR envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(config.gain, startTime + config.attack);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + config.attack + config.decay);
  
  osc.connect(gain);
  gain.connect(masterGain);
  
  osc.start(startTime);
  osc.stop(startTime + config.duration + 0.1);
}

/**
 * Set master volume
 * @param {number} level - Volume level from 0 to 1
 */
function setVolume(level) {
  currentVolume = Math.max(0, Math.min(1, level));
  
  if (masterGain) {
    masterGain.gain.value = isMuted ? 0 : currentVolume;
  }
  
  // Update volume slider if exists
  const slider = document.getElementById('audio-volume-slider');
  if (slider) {
    slider.value = currentVolume;
  }
  
  console.log(`[Audio] Volume set to: ${currentVolume}`);
}

/**
 * Mute all audio
 */
function mute() {
  isMuted = true;
  if (masterGain) {
    masterGain.gain.value = 0;
  }
  updateAudioButton();
  console.log('[Audio] Muted');
}

/**
 * Unmute audio
 */
function unmute() {
  isMuted = false;
  if (masterGain) {
    masterGain.gain.value = currentVolume;
  }
  updateAudioButton();
  console.log('[Audio] Unmuted');
}

/**
 * Toggle mute state
 */
function toggleMute() {
  if (isMuted) {
    unmute();
  } else {
    mute();
  }
}

/**
 * Update audio control button UI
 */
function updateAudioButton() {
  const btn = document.getElementById('audio-toggle-btn');
  if (!btn) return;
  
  if (isMuted) {
    btn.classList.add('muted');
    btn.innerHTML = '🔇';
    btn.title = 'Audio muted - Click to unmute';
  } else if (isAmbientPlaying) {
    btn.classList.remove('muted');
    btn.innerHTML = '🔊';
    btn.title = 'Audio playing - Click to mute';
  } else {
    btn.classList.remove('muted');
    btn.innerHTML = '🔈';
    btn.title = 'Audio off - Click to start';
  }
}

/**
 * Create audio control UI and add to page
 */
function createAudioControls() {
  // Check if controls already exist
  if (document.getElementById('audio-controls')) return;
  
  const container = document.createElement('div');
  container.id = 'audio-controls';
  container.className = 'audio-controls';
  
  container.innerHTML = `
    <button id="audio-toggle-btn" class="audio-btn" title="Toggle audio">
      🔈
    </button>
    <div class="audio-panel hidden">
      <div class="audio-panel-content">
        <label class="audio-label">
          <input type="range" id="audio-volume-slider" 
                 min="0" max="1" step="0.05" value="${currentVolume}"
                 class="volume-slider">
          <span>Volume</span>
        </label>
        <button id="audio-ambient-btn" class="audio-btn-small">
          🎵 Ambient
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  // Wire up events
  const toggleBtn = document.getElementById('audio-toggle-btn');
  const panel = container.querySelector('.audio-panel');
  const volumeSlider = document.getElementById('audio-volume-slider');
  const ambientBtn = document.getElementById('audio-ambient-btn');
  
  // Main button - click to toggle mute, right-click or long press for panel
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (!audioContext) {
      initAudio();
      playAmbient();
    } else if (isMuted) {
      unmute();
    } else {
      mute();
    }
  });
  
  // Show panel on hover/focus
  toggleBtn.addEventListener('mouseenter', () => {
    panel.classList.remove('hidden');
  });
  
  container.addEventListener('mouseleave', () => {
    panel.classList.add('hidden');
  });
  
  // Volume slider
  volumeSlider.addEventListener('input', (e) => {
    setVolume(parseFloat(e.target.value));
  });
  
  // Ambient toggle
  ambientBtn.addEventListener('click', () => {
    toggleAmbient();
    ambientBtn.textContent = isAmbientPlaying ? '⏹️ Stop' : '🎵 Ambient';
  });
  
  console.log('[Audio] Controls created');
}

/**
 * Get current audio state
 */
function getAudioState() {
  return {
    initialized: !!audioContext,
    playing: isAmbientPlaying,
    muted: isMuted,
    volume: currentVolume
  };
}

// Auto-initialize controls when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createAudioControls);
} else {
  createAudioControls();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initAudio,
    playAmbient,
    stopAmbient,
    toggleAmbient,
    playAlert,
    setVolume,
    mute,
    unmute,
    toggleMute,
    getAudioState,
    createAudioControls
  };
}
