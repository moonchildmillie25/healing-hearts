// companion.js
// Handles companion UI injection, pure level calculation, mood controls and bond persistence
(function () {
  'use strict';

  // Pure function: calculates level and progress percent from bondStrength (0-100)
  function calculateCompanionLevel(bondStrength) {
    const clamped = Math.max(0, Math.min(100, Number(bondStrength) || 0));
    // Levels 1..10 where each 10 points = one level
    const level = Math.min(10, Math.max(1, Math.floor(clamped / 10) + 1));
    const progressPercent = (clamped % 10) / 10 * 100;
    return { level, progressPercent };
  }

  // Expose for testing if needed
  window.calculateCompanionLevel = calculateCompanionLevel;

  function getStoredNumber(key, fallback = 0) {
    const v = localStorage.getItem(key);
    return v === null ? fallback : Number(v);
  }

  function setStored(key, value) {
    localStorage.setItem(key, String(value));
  }

  function clamp(n, a = 0, b = 100) { return Math.max(a, Math.min(b, n)); }

  function createStatusElements(previewEl) {
    // Only create once
    if (document.getElementById('companion-status')) return;

    const status = document.createElement('div');
    status.id = 'companion-status';
    status.className = 'companion-status';
    status.innerHTML = `
      <div class="companion-level">Level <span id="companion-level">1</span></div>
      <div class="companion-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div class="companion-progress" id="companion-progress" style="width:0%"></div>
      </div>
      <div class="companion-bond">Bond Strength: <span id="companion-bond">0</span>%</div>
      <div class="companion-settings">
        <label for="companion-mood">Companion Mood</label>
        <div class="companion-mood-controls" id="companion-mood-controls">
          <button class="mood-btn" data-mood="happy">😊</button>
          <button class="mood-btn" data-mood="calm">🙂</button>
          <button class="mood-btn" data-mood="neutral">😐</button>
          <button class="mood-btn" data-mood="sad">😢</button>
          <button class="mood-btn" data-mood="angry">😤</button>
        </div>
      </div>
    `;

    // Insert after the preview container
    const container = previewEl.parentElement;
    container.parentElement.insertBefore(status, container.nextSibling);
  }

  function updateCompanionUI({ bond, mood }) {
    const emoji = document.getElementById('companion-emoji');
    const levelText = document.getElementById('companion-level');
    const progress = document.getElementById('companion-progress');
    const bondText = document.getElementById('companion-bond');
    const preview = document.getElementById('companion-preview');

    if (!preview || !emoji || !levelText || !progress || !bondText) return;

    const { level, progressPercent } = calculateCompanionLevel(bond);
    levelText.textContent = level;
    progress.style.width = progressPercent + '%';
    bondText.textContent = String(clamp(Math.round(bond))) ;

    // Visual cue: scale emoji based on bond strength and apply mood class
    const scale = 1 + clamp(bond) / 200; // scale 1..1.5
    emoji.style.transform = `scale(${scale})`;

    // glow intensity based on bond
    const glowAlpha = 0.06 + clamp(bond) / 200; // 0.06..0.56
    emoji.style.boxShadow = `0 12px 32px rgba(0,0,0,${glowAlpha})`;

    // Set mood class on preview
    preview.classList.remove('mood-happy','mood-calm','mood-neutral','mood-sad','mood-angry');
    preview.classList.add('mood-' + (mood || 'neutral'));

    // Update selected state on mood buttons
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.mood === mood);
    });
  }

  function setCompanionMood(newMood) {
    const prevMood = localStorage.getItem('companionMood') || 'neutral';
    localStorage.setItem('companionMood', newMood);

    // Small bond adjustments when user sets moods (positive moods increase bond a bit)
    let bond = getStoredNumber('companionBond', 0);
    const moodDelta = {
      happy: 5,
      calm: 2,
      neutral: 0,
      sad: -2,
      angry: -3
    };
    bond = clamp(bond + (moodDelta[newMood] || 0));
    setStored('companionBond', bond);
    updateCompanionUI({ bond, mood: newMood });
  }

  function attachMoodListeners() {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest && e.target.closest('.mood-btn');
      if (!btn) return;
      const mood = btn.dataset.mood;
      if (!mood) return;
      setCompanionMood(mood);
    });
  }

  function init() {
    const preview = document.getElementById('companion-preview');
    if (!preview) return; // nothing to do

    // clean up potential visual artifacts (explicitly hide ::before/::after via inline style)
    preview.style.boxShadow = 'none';
    preview.style.border = 'none';

    // ensure inner emoji exists
    if (!preview.querySelector('.companion-inner')) {
      preview.innerHTML = `<div class="companion-inner"><div id="companion-emoji" class="companion-emoji">💗</div></div>`;
    }

    createStatusElements(preview);
    attachMoodListeners();

    // load stored state
    const bond = getStoredNumber('companionBond', 0);
    const mood = localStorage.getItem('companionMood') || 'neutral';

    // initial UI update
    updateCompanionUI({ bond, mood });

    // expose some helpers to window for debugging
    window.setCompanionMood = setCompanionMood;
    window.updateCompanionUI = updateCompanionUI;
    window.getCompanionState = function () {
      return { bond: getStoredNumber('companionBond', 0), mood: localStorage.getItem('companionMood') || 'neutral' };
    };
  }

  // Wait for DOM
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
