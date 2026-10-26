/**
 * NEON HOLLOW 🎃 MAIN APPLICATION CONTROLLER
 * Tab router, Halloween countdown timer, theme mood selector,
 * soundboard triggers, and sanctum initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Tab Navigation Routing
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.sanctum-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      if (window.NeonAudio) {
        window.NeonAudio.playSquelch();
      }
    });
  });

  // 2. Sanctum Theme / Mood Selector
  const themeSelector = document.getElementById('theme-selector');
  if (themeSelector) {
    themeSelector.addEventListener('change', (e) => {
      const selected = e.target.value;
      document.body.className = selected;
      if (window.NeonAudio) window.NeonAudio.playGhost();
      if (window.SanctumAtmosphere) window.SanctumAtmosphere.triggerLightning();
    });
  }

  // 3. Halloween Countdown Timer
  function initHalloweenCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    function update() {
      const now = new Date();
      let year = now.getFullYear();
      let target = new Date(year, 9, 31, 23, 59, 59); // Oct 31, 23:59:59 (Month is 0-indexed)

      if (now.getTime() > target.getTime()) {
        target = new Date(year + 1, 9, 31, 23, 59, 59);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }
  initHalloweenCountdown();

  // 4. Ambient Sound Switch
  const ambientBtn = document.getElementById('btn-ambient-sound');
  const speakerIcon = document.getElementById('speaker-icon');
  if (ambientBtn) {
    ambientBtn.addEventListener('click', () => {
      if (window.NeonAudio) {
        const isPlaying = window.NeonAudio.toggleAmbient();
        if (speakerIcon) speakerIcon.textContent = isPlaying ? '🔊' : '🔇';
        ambientBtn.classList.toggle('active', isPlaying);
      }
    });
  }

  // 5. Summon Lightning Button
  const lightningBtn = document.getElementById('btn-summon-lightning');
  if (lightningBtn) {
    lightningBtn.addEventListener('click', () => {
      if (window.SanctumAtmosphere) {
        window.SanctumAtmosphere.triggerLightning();
      }
    });
  }

  // 6. Crypt Soundboard SFX Pads
  const sfxPads = document.querySelectorAll('.sfx-pad');
  sfxPads.forEach(pad => {
    pad.addEventListener('click', () => {
      const sound = pad.dataset.sound;
      pad.classList.add('playing');
      setTimeout(() => pad.classList.remove('playing'), 500);

      if (!window.NeonAudio) return;

      switch (sound) {
        case 'lightning':
          if (window.SanctumAtmosphere) window.SanctumAtmosphere.triggerLightning();
          break;
        case 'howl':
          window.NeonAudio.playHowl();
          break;
        case 'ghost':
          window.NeonAudio.playGhost();
          break;
        case 'witch':
          window.NeonAudio.playWitch();
          break;
        case 'door':
          window.NeonAudio.playDoor();
          break;
        case 'chains':
          window.NeonAudio.playChains();
          break;
        case 'organ':
          window.NeonAudio.playOrgan();
          break;
        case 'heartbeat':
          window.NeonAudio.playHeartbeat();
          break;
        case 'bats':
          window.NeonAudio.playBats();
          break;
        case 'bones':
          window.NeonAudio.playBones();
          break;
        case 'musicbox':
          window.NeonAudio.playMusicBox();
          break;
        case 'jumpscare':
          window.NeonAudio.playJumpscare();
          break;
      }
    });
  });

  // 7. Easter Egg: Brand Pumpkin Click
  const brandPumpkin = document.getElementById('brand-pumpkin');
  if (brandPumpkin) {
    brandPumpkin.addEventListener('click', () => {
      if (window.NeonAudio) window.NeonAudio.playWitch();
      if (window.SanctumAtmosphere) window.SanctumAtmosphere.triggerLightning();
    });
  }
});
