/**
 * NEON HOLLOW 🎃 BACKGROUND CANVAS ATMOSPHERE
 * Flying bats with wing flap physics, rising glowing embers, interactive mouse reaction,
 * and dynamic screen-shaking lightning flashes.
 */

class BackgroundAtmosphere {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.bats = [];
    this.embers = [];
    this.mouseX = -9999;
    this.mouseY = -9999;

    this.initCanvas();
    this.createBats(16);
    this.createEmbers(45);

    window.addEventListener('resize', () => this.initCanvas());
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createBats(count) {
    this.bats = [];
    for (let i = 0; i < count; i++) {
      this.bats.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.7),
        vx: 1.5 + Math.random() * 2.5,
        vy: (Math.random() - 0.5) * 1.5,
        scale: 0.5 + Math.random() * 0.7,
        flapSpeed: 0.15 + Math.random() * 0.1,
        flapPhase: Math.random() * Math.PI * 2,
        swoopOffset: Math.random() * 100
      });
    }
  }

  createEmbers(count) {
    this.embers = [];
    for (let i = 0; i < count; i++) {
      this.embers.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vy: -0.5 - Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.6,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.7,
        pulse: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.4 ? 'orange' : 'purple'
      });
    }
  }

  // Draw Bat silhouette with flapping wings
  drawBat(bat) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(bat.x, bat.y);
    ctx.scale(bat.scale, bat.scale);

    // Mouse evasion
    const dx = bat.x - this.mouseX;
    const dy = bat.y - this.mouseY;
    const dist = Math.hypot(dx, dy);
    if (dist < 120) {
      bat.vx += (dx / dist) * 0.5;
      bat.vy += (dy / dist) * 0.5;
    }

    const wingFlap = Math.sin(bat.flapPhase);

    ctx.fillStyle = '#0a0314';
    ctx.shadowColor = 'rgba(157, 78, 221, 0.4)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    // Body & head
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    // Ears
    ctx.moveTo(-2, -3);
    ctx.lineTo(-4, -8);
    ctx.lineTo(-1, -4);
    ctx.moveTo(2, -3);
    ctx.lineTo(4, -8);
    ctx.lineTo(1, -4);

    // Left Wing
    ctx.moveTo(-2, 0);
    ctx.quadraticCurveTo(-14, -12 * wingFlap, -22, -2 * wingFlap);
    ctx.quadraticCurveTo(-16, 8 * wingFlap, -10, 3);
    ctx.quadraticCurveTo(-6, 7 * wingFlap, -2, 2);

    // Right Wing
    ctx.moveTo(2, 0);
    ctx.quadraticCurveTo(14, -12 * wingFlap, 22, -2 * wingFlap);
    ctx.quadraticCurveTo(16, 8 * wingFlap, 10, 3);
    ctx.quadraticCurveTo(6, 7 * wingFlap, 2, 2);

    ctx.fill();
    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Embers
    this.embers.forEach(ember => {
      ember.y += ember.vy;
      ember.x += ember.vx + Math.sin(ember.pulse) * 0.4;
      ember.pulse += 0.04;

      if (ember.y < -10) {
        ember.y = this.height + 10;
        ember.x = Math.random() * this.width;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);

      const color = ember.hue === 'orange' ? 'rgba(255, 120, 0, ' : 'rgba(180, 70, 255, ';
      const glow = color + (ember.alpha * (0.6 + Math.sin(ember.pulse) * 0.4)) + ')';

      this.ctx.fillStyle = glow;
      this.ctx.shadowColor = ember.hue === 'orange' ? '#ff6b00' : '#b026ff';
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.restore();
    });

    // 2. Draw Bats
    this.bats.forEach(bat => {
      bat.flapPhase += bat.flapSpeed;
      bat.x += bat.vx;
      bat.y += bat.vy + Math.sin(bat.flapPhase * 0.5) * 0.8;

      // Dampen velocity
      bat.vx = bat.vx * 0.98 + 0.04;
      bat.vy = bat.vy * 0.98;

      if (bat.x > this.width + 50) {
        bat.x = -50;
        bat.y = Math.random() * (this.height * 0.7);
        bat.vx = 1.5 + Math.random() * 2.5;
      }

      this.drawBat(bat);
    });

    requestAnimationFrame(this.animate);
  }

  // Trigger screen-illuminating lightning flash
  triggerLightning() {
    const overlay = document.getElementById('lightning-overlay');
    const pageWrapper = document.querySelector('.page-wrapper');
    if (!overlay) return;

    if (window.NeonAudio) {
      window.NeonAudio.playThunder();
    }

    // Double flash pattern
    overlay.classList.add('strike');
    if (pageWrapper) pageWrapper.style.transform = `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 6}px)`;

    setTimeout(() => {
      overlay.classList.remove('strike');
      if (pageWrapper) pageWrapper.style.transform = 'translate(0, 0)';

      setTimeout(() => {
        overlay.classList.add('strike');
        if (pageWrapper) pageWrapper.style.transform = `translate(${(Math.random() - 0.5) * 6}px, ${(Math.random() - 0.5) * 5}px)`;

        setTimeout(() => {
          overlay.classList.remove('strike');
          if (pageWrapper) pageWrapper.style.transform = 'translate(0, 0)';
        }, 120);
      }, 70);
    }, 90);
  }
}

// Global instance
window.SanctumAtmosphere = new BackgroundAtmosphere();
