/**
 * NEON HOLLOW 🎃 PROCEDURAL WEB AUDIO SYNTHESIZER
 * Zero external audio files required! Synthesizes 100% pure spooky soundscapes
 * using Web Audio API oscillators, noise buffers, and biquad filters.
 */

class NeonAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.ambientNodes = [];
    this.isAmbientPlaying = false;
    this.vizBars = document.querySelectorAll('.audio-viz-bar .viz-bar');
    this.analyser = null;
    this.vizAnimFrame = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.startVisualizer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startVisualizer() {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const render = () => {
      this.vizAnimFrame = requestAnimationFrame(render);
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      this.vizBars.forEach((bar, index) => {
        const val = dataArray[index * 2] || 0;
        const scale = Math.max(0.2, (val / 255) * 6);
        bar.style.transform = `scaleY(${scale})`;
      });
    };
    render();
  }

  // Noise Buffer Helper
  createNoiseBuffer(duration = 2) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Toggle Ambient Wind & Drone
  toggleAmbient() {
    this.init();
    if (this.isAmbientPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  startAmbient() {
    this.init();
    if (this.isAmbientPlaying) return;

    // Ambient Wind (Filtered Pink/White Noise Sweep)
    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    // LFO for howling wind frequency oscillation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Eerie low drone oscillator
    const droneOsc = this.ctx.createOscillator();
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 2.5);

    noiseSource.connect(filter);
    filter.connect(this.ambientGain);

    droneOsc.connect(droneFilter);
    droneFilter.connect(this.ambientGain);

    this.ambientGain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
    droneOsc.start();

    this.ambientNodes = [noiseSource, lfo, droneOsc, this.ambientGain];
    this.isAmbientPlaying = true;
  }

  stopAmbient() {
    if (!this.isAmbientPlaying || !this.ambientGain) return;
    this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1);
    setTimeout(() => {
      this.ambientNodes.forEach(node => {
        try { node.stop(); } catch (e) {}
        try { node.disconnect(); } catch (e) {}
      });
      this.ambientNodes = [];
      this.isAmbientPlaying = false;
    }, 1000);
  }

  // 1. Thunder Crash SFX
  playThunder() {
    this.init();
    const now = this.ctx.currentTime;
    const duration = 2.8;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Distant rumble sub-oscillator
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(60, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + duration);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    sub.connect(subGain);
    subGain.connect(this.masterGain);

    noise.start(now);
    sub.start(now);
    noise.stop(now + duration);
    sub.stop(now + duration);
  }

  // 2. Werewolf Howl
  playHowl() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(200, now + 3.0);

    // Vibrato
    const vibrato = this.ctx.createOscillator();
    vibrato.frequency.setValueAtTime(5, now);
    const vGain = this.ctx.createGain();
    vGain.gain.setValueAtTime(12, now);
    vibrato.connect(vGain);
    vGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    vibrato.start(now);
    osc.start(now);
    vibrato.stop(now + 3.2);
    osc.stop(now + 3.2);
  }

  // 3. Ghostly Wail
  playGhost() {
    this.init();
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.linearRampToValueAtTime(680, now + 1.0);
    osc1.frequency.linearRampToValueAtTime(360, now + 2.5);

    osc2.frequency.setValueAtTime(444, now);
    osc2.frequency.linearRampToValueAtTime(686, now + 1.0);
    osc2.frequency.linearRampToValueAtTime(363, now + 2.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.6);
    osc2.stop(now + 2.6);
  }

  // 4. Witch Cackle
  playWitch() {
    this.init();
    const now = this.ctx.currentTime;
    const duration = 1.6;

    for (let i = 0; i < 7; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + (i * 0.18);

      osc.type = 'sawtooth';
      const baseFreq = 700 + Math.sin(i) * 150;
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.8, startTime + 0.15);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.17);
    }
  }

  // 5. Creaky Door
  playDoor() {
    this.init();
    const now = this.ctx.currentTime;
    const duration = 1.8;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.6);
    osc.frequency.linearRampToValueAtTime(95, now + 1.2);
    osc.frequency.linearRampToValueAtTime(70, now + duration);

    // Jitter
    const jitter = this.ctx.createOscillator();
    jitter.type = 'square';
    jitter.frequency.setValueAtTime(25, now);
    const jGain = this.ctx.createGain();
    jGain.gain.setValueAtTime(30, now);
    jitter.connect(jGain);
    jGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    jitter.start(now);
    osc.start(now);
    jitter.stop(now + duration);
    osc.stop(now + duration);
  }

  // 6. Phantom Chains
  playChains() {
    this.init();
    const now = this.ctx.currentTime;
    const freqs = [800, 1150, 1450, 2100, 2900];

    for (let step = 0; step < 4; step++) {
      const stepTime = now + (step * 0.22);
      freqs.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq + (Math.random() * 80 - 40), stepTime);

        gain.gain.setValueAtTime(0.08, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(stepTime);
        osc.stop(stepTime + 0.46);
      });
    }
  }

  // 7. Cathedral Organ (D Minor chord)
  playOrgan() {
    this.init();
    const now = this.ctx.currentTime;
    const chord = [146.83, 174.61, 220.00, 293.66]; // D3, F3, A3, D4

    chord.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.0);
    });
  }

  // 8. Haunted Heartbeat (Double Thump)
  playHeartbeat() {
    this.init();
    const now = this.ctx.currentTime;
    const beats = [0, 0.28];

    beats.forEach(delay => {
      const time = now + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.18);

      gain.gain.setValueAtTime(0.6, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.22);
    });
  }

  // 9. Bat Swarm
  playBats() {
    this.init();
    const now = this.ctx.currentTime;

    for (let i = 0; i < 10; i++) {
      const time = now + (i * 0.12) + (Math.random() * 0.05);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(3500 + Math.random() * 2500, time);
      osc.frequency.exponentialRampToValueAtTime(6500 + Math.random() * 2000, time + 0.08);

      gain.gain.setValueAtTime(0.09, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.1);
    }
  }

  // 10. Skeleton Bones
  playBones() {
    this.init();
    const now = this.ctx.currentTime;
    const hits = 5;

    for (let i = 0; i < hits; i++) {
      const time = now + (i * 0.14);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900 + Math.random() * 500, time);
      osc.frequency.exponentialRampToValueAtTime(250, time + 0.06);

      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.09);
    }
  }

  // 11. Creepy Music Box
  playMusicBox() {
    this.init();
    const now = this.ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.50, 987.77, 880.00];

    melody.forEach((freq, idx) => {
      const time = now + (idx * 0.35);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 1.2);
    });
  }

  // 12. Jump-Scare Sting
  playJumpscare() {
    this.init();
    const now = this.ctx.currentTime;

    // Dissonant Cluster: E, F, Bb, B
    const cluster = [329.63, 349.23, 466.16, 493.88, 659.25, 698.46];
    cluster.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.5);
    });

    // Harsh noise burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(0.5);
    const nFilter = this.ctx.createBiquadFilter();
    nFilter.type = 'highpass';
    nFilter.frequency.setValueAtTime(2500, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  // Interactive UI Blip / Squelch (for potion drops & carving)
  playSquelch() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + Math.random() * 100, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Bonk SFX for game whacks
  playBonk() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Potion Sparkle / Magic Chime
  playMagicChime() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98];

    notes.forEach((freq, i) => {
      const time = now + (i * 0.08);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.6);
    });
  }
}

// Global instance
window.NeonAudio = new NeonAudioEngine();
