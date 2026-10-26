/**
 * NEON HOLLOW 🎃 JACK-O'-CARVER STUDIO
 * Interactive Canvas Pumpkin Carver with custom blade sizes, freehand carving,
 * stencil stamps, flickering inner candle light engine, undo history, and PNG export.
 */

class PumpkinCarver {
  constructor() {
    this.canvas = document.getElementById('pumpkin-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Offscreen mask canvas for carved holes
    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = 600;
    this.maskCanvas.height = 600;
    this.maskCtx = this.maskCanvas.getContext('2d');

    // Base pumpkin image
    this.pumpkinImg = new Image();
    this.pumpkinImg.src = 'assets/pumpkin-base.jpg';
    this.isImgLoaded = false;

    // Carving settings
    this.currentTool = 'knife'; // 'knife', 'gouge', 'eraser'
    this.bladeSize = 16;
    this.candleColor = '#ff7a00';
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    // Undo history stack
    this.history = [];
    this.maxHistory = 15;

    // Candle flicker phase
    this.flickerTimer = 0;

    this.init();
  }

  init() {
    this.pumpkinImg.onload = () => {
      this.isImgLoaded = true;
      this.saveHistoryState();
      this.render();
    };

    this.bindEvents();
    this.startFlickerLoop();
  }

  bindEvents() {
    // Canvas pointer events
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      const pos = getPos(e);
      this.lastX = pos.x;
      this.lastY = pos.y;
      this.carveAt(pos.x, pos.y);
      if (window.NeonAudio) window.NeonAudio.playSquelch();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDrawing) return;
      const pos = getPos(e);
      this.carveLine(this.lastX, this.lastY, pos.x, pos.y);
      this.lastX = pos.x;
      this.lastY = pos.y;
    });

    window.addEventListener('mouseup', () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.saveHistoryState();
      }
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.isDrawing = true;
      const pos = getPos(touch);
      this.lastX = pos.x;
      this.lastY = pos.y;
      this.carveAt(pos.x, pos.y);
      if (window.NeonAudio) window.NeonAudio.playSquelch();
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.isDrawing) return;
      const touch = e.touches[0];
      const pos = getPos(touch);
      this.carveLine(this.lastX, this.lastY, pos.x, pos.y);
      this.lastX = pos.x;
      this.lastY = pos.y;
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.saveHistoryState();
      }
    });

    // Tool Buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTool = btn.dataset.tool;
        const toolLabel = document.getElementById('current-tool-label');
        if (toolLabel) toolLabel.textContent = btn.title || this.currentTool;
      });
    });

    // Blade size slider
    const sizeSlider = document.getElementById('carve-size');
    const sizeDisplay = document.getElementById('blade-size-display');
    if (sizeSlider && sizeDisplay) {
      sizeSlider.addEventListener('input', (e) => {
        this.bladeSize = parseInt(e.target.value, 10);
        sizeDisplay.textContent = `${this.bladeSize}px`;
      });
    }

    // Flame color buttons
    document.querySelectorAll('.flame-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.flame-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.candleColor = btn.dataset.color;
        const glowLabel = document.getElementById('current-glow-label');
        if (glowLabel) glowLabel.textContent = btn.title;
        this.render();
      });
    });

    // Stencils
    document.querySelectorAll('.stencil-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyStencil(btn.dataset.stencil);
        if (window.NeonAudio) window.NeonAudio.playMagicChime();
      });
    });

    // Undo & Reset
    const undoBtn = document.getElementById('btn-undo-carve');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

    const resetBtn = document.getElementById('btn-reset-pumpkin');
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetPumpkin());

    const saveBtn = document.getElementById('btn-save-pumpkin');
    if (saveBtn) saveBtn.addEventListener('click', () => this.savePumpkinImage());
  }

  carveAt(x, y) {
    this.maskCtx.save();
    if (this.currentTool === 'eraser') {
      this.maskCtx.globalCompositeOperation = 'destination-out';
    } else {
      this.maskCtx.globalCompositeOperation = 'source-over';
      this.maskCtx.fillStyle = '#ffffff';
    }

    const radius = this.currentTool === 'gouge' ? this.bladeSize * 1.5 : this.bladeSize / 2;
    this.maskCtx.beginPath();
    this.maskCtx.arc(x, y, radius, 0, Math.PI * 2);
    this.maskCtx.fill();
    this.maskCtx.restore();

    this.render();
  }

  carveLine(x1, y1, x2, y2) {
    this.maskCtx.save();
    if (this.currentTool === 'eraser') {
      this.maskCtx.globalCompositeOperation = 'destination-out';
    } else {
      this.maskCtx.globalCompositeOperation = 'source-over';
      this.maskCtx.strokeStyle = '#ffffff';
      this.maskCtx.fillStyle = '#ffffff';
    }

    const width = this.currentTool === 'gouge' ? this.bladeSize * 2 : this.bladeSize;
    this.maskCtx.lineWidth = width;
    this.maskCtx.lineCap = 'round';
    this.maskCtx.lineJoin = 'round';

    this.maskCtx.beginPath();
    this.maskCtx.moveTo(x1, y1);
    this.maskCtx.lineTo(x2, y2);
    this.maskCtx.stroke();
    this.maskCtx.restore();

    this.render();
  }

  applyStencil(type) {
    const ctx = this.maskCtx;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';

    const cx = 300;
    const cy = 340;

    switch (type) {
      case 'evil-triangles':
        // Left Eye Triangle
        ctx.beginPath();
        ctx.moveTo(cx - 70, cy - 80);
        ctx.lineTo(cx - 30, cy - 30);
        ctx.lineTo(cx - 110, cy - 30);
        ctx.closePath();
        ctx.fill();

        // Right Eye Triangle
        ctx.beginPath();
        ctx.moveTo(cx + 70, cy - 80);
        ctx.lineTo(cx + 110, cy - 30);
        ctx.lineTo(cx + 30, cy - 30);
        ctx.closePath();
        ctx.fill();

        // Nose Triangle
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx + 25, cy + 25);
        ctx.lineTo(cx - 25, cy + 25);
        ctx.closePath();
        ctx.fill();

        // Menacing Jagged Grin
        ctx.beginPath();
        ctx.moveTo(cx - 120, cy + 50);
        ctx.lineTo(cx - 90, cy + 90);
        ctx.lineTo(cx - 60, cy + 55);
        ctx.lineTo(cx - 30, cy + 95);
        ctx.lineTo(cx, cy + 55);
        ctx.lineTo(cx + 30, cy + 95);
        ctx.lineTo(cx + 60, cy + 55);
        ctx.lineTo(cx + 90, cy + 90);
        ctx.lineTo(cx + 120, cy + 50);
        ctx.lineTo(cx + 80, cy + 120);
        ctx.lineTo(cx, cy + 130);
        ctx.lineTo(cx - 80, cy + 120);
        ctx.closePath();
        ctx.fill();
        break;

      case 'wicked-smile':
        // Slanted eyes
        ctx.beginPath();
        ctx.ellipse(cx - 70, cy - 60, 45, 18, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(cx + 70, cy - 60, 45, 18, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Smirk mouth with fangs
        ctx.beginPath();
        ctx.arc(cx, cy + 40, 110, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.lineTo(cx + 90, cy + 120);
        ctx.lineTo(cx + 50, cy + 85);
        ctx.lineTo(cx, cy + 125);
        ctx.lineTo(cx - 50, cy + 85);
        ctx.lineTo(cx - 90, cy + 120);
        ctx.closePath();
        ctx.fill();
        break;

      case 'vamp-fangs':
        // Angry brow eyes
        ctx.beginPath();
        ctx.moveTo(cx - 100, cy - 80);
        ctx.lineTo(cx - 30, cy - 50);
        ctx.lineTo(cx - 40, cy - 35);
        ctx.lineTo(cx - 95, cy - 55);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx + 100, cy - 80);
        ctx.lineTo(cx + 30, cy - 50);
        ctx.lineTo(cx + 40, cy - 35);
        ctx.lineTo(cx + 95, cy - 55);
        ctx.closePath();
        ctx.fill();

        // Fanged mouth
        ctx.beginPath();
        ctx.arc(cx, cy + 50, 90, 0.2 * Math.PI, 0.8 * Math.PI);
        // Left fang
        ctx.lineTo(cx - 50, cy + 135);
        ctx.lineTo(cx - 30, cy + 90);
        // Right fang
        ctx.lineTo(cx + 30, cy + 90);
        ctx.lineTo(cx + 50, cy + 135);
        ctx.closePath();
        ctx.fill();
        break;

      case 'spooky-bat':
        // Bat stencil
        ctx.beginPath();
        ctx.arc(cx, cy - 10, 16, 0, Math.PI * 2);
        // Wings
        ctx.moveTo(cx - 15, cy - 10);
        ctx.quadraticCurveTo(cx - 80, cy - 70, cx - 130, cy - 20);
        ctx.quadraticCurveTo(cx - 90, cy + 30, cx - 50, cy + 10);
        ctx.quadraticCurveTo(cx - 30, cy + 35, cx - 10, cy + 10);

        ctx.moveTo(cx + 15, cy - 10);
        ctx.quadraticCurveTo(cx + 80, cy - 70, cx + 130, cy - 20);
        ctx.quadraticCurveTo(cx + 90, cy + 30, cx + 50, cy + 10);
        ctx.quadraticCurveTo(cx + 30, cy + 35, cx + 10, cy + 10);
        ctx.fill();
        break;

      case 'screaming-ghoul':
        // Elongated hollow eyes
        ctx.beginPath();
        ctx.ellipse(cx - 55, cy - 70, 22, 45, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 55, cy - 70, 22, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // O-shaped gaping mouth
        ctx.beginPath();
        ctx.ellipse(cx, cy + 60, 45, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'black-cat':
        // Cat head silhouette & pointed ears
        ctx.beginPath();
        ctx.arc(cx, cy, 65, 0, Math.PI * 2);
        // Left ear
        ctx.moveTo(cx - 50, cy - 35);
        ctx.lineTo(cx - 70, cy - 105);
        ctx.lineTo(cx - 15, cy - 60);
        // Right ear
        ctx.moveTo(cx + 50, cy - 35);
        ctx.lineTo(cx + 70, cy - 105);
        ctx.lineTo(cx + 15, cy - 60);
        ctx.fill();
        break;
    }

    ctx.restore();
    this.saveHistoryState();
    this.render();
  }

  saveHistoryState() {
    if (this.history.length >= this.maxHistory) {
      this.history.shift();
    }
    const snap = this.maskCtx.getImageData(0, 0, 600, 600);
    this.history.push(snap);
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      const prev = this.history[this.history.length - 1];
      this.maskCtx.putImageData(prev, 0, 0);
      this.render();
      if (window.NeonAudio) window.NeonAudio.playSquelch();
    }
  }

  resetPumpkin() {
    this.maskCtx.clearRect(0, 0, 600, 600);
    this.history = [];
    this.saveHistoryState();
    this.render();
    if (window.NeonAudio) window.NeonAudio.playGhost();
  }

  startFlickerLoop() {
    const loop = () => {
      this.flickerTimer += 0.05;
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  render() {
    if (!this.isImgLoaded) return;
    const ctx = this.ctx;
    const width = 600;
    const height = 600;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw base pumpkin image
    ctx.drawImage(this.pumpkinImg, 0, 0, width, height);

    // 2. Prepare glowing candle light for carved holes
    // Dynamic flicker intensity
    const flicker = 0.85 + Math.sin(this.flickerTimer * 4) * 0.1 + Math.cos(this.flickerTimer * 9) * 0.05;

    // Create a temporary compositing canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tCtx = tempCanvas.getContext('2d');

    // Inner glowing candle background on temp canvas
    const candleGradient = tCtx.createRadialGradient(300, 340, 10, 300, 340, 220);
    candleGradient.addColorStop(0, '#ffffff');
    candleGradient.addColorStop(0.3, this.candleColor);
    candleGradient.addColorStop(0.7, this.adjustAlpha(this.candleColor, 0.7));
    candleGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

    tCtx.fillStyle = candleGradient;
    tCtx.fillRect(0, 0, width, height);

    // Mask with carved holes
    tCtx.globalCompositeOperation = 'destination-in';
    tCtx.drawImage(this.maskCanvas, 0, 0);

    // 3. Composite carved glowing holes onto pumpkin with bloom
    ctx.save();
    ctx.shadowColor = this.candleColor;
    ctx.shadowBlur = 25 * flicker;
    ctx.drawImage(tempCanvas, 0, 0);

    // Draw secondary inner highlight for depth
    ctx.shadowBlur = 10 * flicker;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
  }

  adjustAlpha(hex, alpha) {
    return hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
  }

  savePumpkinImage() {
    const link = document.createElement('a');
    link.download = `jack-o-lantern-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
    if (window.NeonAudio) window.NeonAudio.playMagicChime();
  }
}

// Global instance
window.JackOCarver = new PumpkinCarver();
