/**
 * NEON HOLLOW 🎃 GRAVEYARD BASH: CRYPT SLAYER
 * Whack-a-Ghoul arcade mini-game with dynamic combos, score multipliers,
 * cursed bombs, high-score persistence, and animated creature popups.
 */

class GraveyardGame {
  constructor() {
    this.score = 0;
    this.timeLeft = 30;
    this.combo = 1;
    this.streakCount = 0;
    this.isPlaying = false;
    this.gameTimerInterval = null;
    this.spawnTimerInterval = null;
    this.highScore = parseInt(localStorage.getItem('neon_hollow_highscore') || '0', 10);

    this.creatures = [
      { type: 'ghost', icon: '👻', points: 100, duration: 1200 },
      { type: 'pumpkin', icon: '🎃', points: 150, duration: 1100 },
      { type: 'bat', icon: '🦇', points: 250, duration: 800 },
      { type: 'candy', icon: '🍬', points: 300, duration: 1000 },
      { type: 'skull', icon: '💣', points: -150, duration: 1300 }
    ];

    this.init();
  }

  init() {
    this.updateHighScoreUI();
    this.bindEvents();
  }

  updateHighScoreUI() {
    const el = document.getElementById('game-highscore');
    if (el) el.textContent = this.highScore;
  }

  bindEvents() {
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (!this.isPlaying) this.startGame();
      });
    }

    // Creature Click / Whack
    document.querySelectorAll('.tombstone-plot').forEach(plot => {
      plot.addEventListener('click', (e) => {
        if (!this.isPlaying) return;
        const creatureEl = plot.querySelector('.creature');
        if (creatureEl && creatureEl.classList.contains('popped') && !creatureEl.classList.contains('whacked')) {
          this.whack(creatureEl, plot);
        }
      });
    });
  }

  startGame() {
    this.isPlaying = true;
    this.score = 0;
    this.timeLeft = 30;
    this.combo = 1;
    this.streakCount = 0;

    this.updateDashboard();

    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = '⚔️ HUNT IN PROGRESS';
    }

    if (window.NeonAudio) window.NeonAudio.playHowl();

    // Game loop timers
    this.gameTimerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateDashboard();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    // Spawn loop
    this.spawnTimerInterval = setInterval(() => {
      this.spawnRandomCreature();
    }, 650);
  }

  spawnRandomCreature() {
    if (!this.isPlaying) return;

    // Pick an unoccupied plot
    const plots = Array.from(document.querySelectorAll('.tombstone-plot'));
    const freePlots = plots.filter(p => !p.querySelector('.creature').classList.contains('popped'));
    if (freePlots.length === 0) return;

    const randomPlot = freePlots[Math.floor(Math.random() * freePlots.length)];
    const creatureEl = randomPlot.querySelector('.creature');

    // Pick creature type (skulls are 18% chance)
    const roll = Math.random();
    let def;
    if (roll < 0.18) def = this.creatures.find(c => c.type === 'skull');
    else if (roll < 0.35) def = this.creatures.find(c => c.type === 'candy');
    else if (roll < 0.55) def = this.creatures.find(c => c.type === 'bat');
    else if (roll < 0.75) def = this.creatures.find(c => c.type === 'pumpkin');
    else def = this.creatures.find(c => c.type === 'ghost');

    creatureEl.textContent = def.icon;
    creatureEl.dataset.type = def.type;
    creatureEl.dataset.points = def.points;
    creatureEl.classList.remove('whacked');
    creatureEl.classList.add('popped');

    // Timeout to hide
    setTimeout(() => {
      if (creatureEl.classList.contains('popped') && !creatureEl.classList.contains('whacked')) {
        creatureEl.classList.remove('popped');
      }
    }, def.duration);
  }

  whack(creatureEl, plot) {
    const points = parseInt(creatureEl.dataset.points, 10);
    const type = creatureEl.dataset.type;

    creatureEl.classList.add('whacked');

    if (type === 'skull') {
      // Cursed bomb penalty!
      this.combo = 1;
      this.streakCount = 0;
      this.score = Math.max(0, this.score + points);
      this.showFloatingText(plot, `${points}`, '#ff0055');
      if (window.NeonAudio) window.NeonAudio.playJumpscare();
    } else {
      // Hit!
      this.streakCount++;
      if (this.streakCount >= 10) this.combo = 5;
      else if (this.streakCount >= 6) this.combo = 3;
      else if (this.streakCount >= 3) this.combo = 2;
      else this.combo = 1;

      const earned = points * this.combo;
      this.score += earned;

      const comboText = this.combo > 1 ? ` (+${earned} x${this.combo}!)` : ` (+${earned})`;
      this.showFloatingText(plot, comboText, '#00ff88');

      if (type === 'candy') {
        if (window.NeonAudio) window.NeonAudio.playMagicChime();
      } else {
        if (window.NeonAudio) window.NeonAudio.playBonk();
      }
    }

    this.updateDashboard();

    setTimeout(() => {
      creatureEl.classList.remove('popped');
      creatureEl.classList.remove('whacked');
    }, 250);
  }

  showFloatingText(plot, text, color) {
    const floating = document.createElement('div');
    floating.textContent = text;
    floating.style.position = 'absolute';
    floating.style.top = '40%';
    floating.style.left = '50%';
    floating.style.transform = 'translate(-50%, -50%)';
    floating.style.fontFamily = 'var(--font-mono)';
    floating.style.fontWeight = 'bold';
    floating.style.fontSize = '1.25rem';
    floating.style.color = color;
    floating.style.pointerEvents = 'none';
    floating.style.zIndex = '20';
    floating.style.transition = 'all 0.6s ease-out';
    floating.style.textShadow = `0 0 10px ${color}`;

    plot.appendChild(floating);

    requestAnimationFrame(() => {
      floating.style.top = '10%';
      floating.style.opacity = '0';
    });

    setTimeout(() => floating.remove(), 600);
  }

  updateDashboard() {
    const scoreEl = document.getElementById('game-score');
    const timerEl = document.getElementById('game-timer');
    const comboEl = document.getElementById('game-combo');

    if (scoreEl) scoreEl.textContent = this.score;
    if (timerEl) timerEl.textContent = `${this.timeLeft}s`;
    if (comboEl) comboEl.textContent = `x${this.combo}`;
  }

  endGame() {
    this.isPlaying = false;
    clearInterval(this.gameTimerInterval);
    clearInterval(this.spawnTimerInterval);

    // Hide all creatures
    document.querySelectorAll('.creature').forEach(c => {
      c.classList.remove('popped');
      c.classList.remove('whacked');
    });

    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = '⚔️ PLAY AGAIN';
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('neon_hollow_highscore', this.highScore);
      this.updateHighScoreUI();
      if (window.SanctumAtmosphere) window.SanctumAtmosphere.triggerLightning();
      alert(`🎉 NEW HIGH SCORE! You purged the crypt with ${this.score} points!`);
    } else {
      if (window.NeonAudio) window.NeonAudio.playOrgan();
      alert(`🦇 Game Over! Final Score: ${this.score} points. High Score: ${this.highScore}`);
    }
  }
}

// Global instance
window.CryptSlayerGame = new GraveyardGame();
