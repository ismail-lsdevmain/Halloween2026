/**
 * NEON HOLLOW 🎃 THE WITCH'S ALCHEMICAL CAULDRON
 * Bubbling canvas liquid physics, drag-and-drop & click ingredient shelf,
 * secret recipe engine, arcane grimoire discovery, and magical spells.
 */

class PotionCauldron {
  constructor() {
    this.canvas = document.getElementById('cauldron-liquid-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.addedIngredients = [];
    this.liquidColor = '#00ff88'; // Default toxic green
    this.bubbles = [];
    this.steamParticles = [];
    this.swirlAngle = 0;
    this.swirlSpeed = 0.02;

    // Grimoire Recipes
    this.recipes = [
      {
        id: 'vampire',
        name: 'Elixir of the Vampire Monarch',
        ingredients: ['blood', 'bat'],
        desc: 'Grants nocturnal supersonic flight and an alluring blood-crimson gaze in total darkness.',
        color: '#ff0044',
        discovered: false
      },
      {
        id: 'phasewalk',
        name: 'Wraith Phasewalk Tonic',
        ingredients: ['ecto', 'shroom'],
        desc: 'Allows the drinker to dematerialize and float through solid tombstone gates into the nether realm.',
        color: '#00f7ff',
        discovered: false
      },
      {
        id: 'basilisk',
        name: 'Hex of the Basilisk Eye',
        ingredients: ['eye', 'venom'],
        desc: 'Transmutes the gaze of intruders into decorative gargoyle stone.',
        color: '#39ff14',
        discovered: false
      },
      {
        id: 'lich',
        name: 'Draught of the Crypt Lich',
        ingredients: ['bone', 'nightshade'],
        desc: 'Awakens an obedient troop of tap-dancing skeleton minions from the cemetery.',
        color: '#ffdd77',
        discovered: false
      },
      {
        id: 'bloodmoon',
        name: 'Celestial Bloodmoon Brew',
        ingredients: ['blood', 'ecto', 'bone'],
        desc: 'Eclipses the moon with deep scarlet radiance and triggers a joyful haunting.',
        color: '#b026ff',
        discovered: false
      },
      {
        id: 'oraclesight',
        name: 'Oracle\'s Witching Sight',
        ingredients: ['eye', 'shroom', 'bat'],
        desc: 'Reveals whispers from the astral dimension and unlocks hidden secrets.',
        color: '#ff7700',
        discovered: false
      }
    ];

    this.init();
  }

  init() {
    this.createBubbles(20);
    this.bindEvents();
    this.renderGrimoire();
    this.startBubbleLoop();
  }

  createBubbles(count) {
    this.bubbles = [];
    for (let i = 0; i < count; i++) {
      this.bubbles.push({
        x: 140 + Math.random() * 120,
        y: 170 + Math.random() * 60,
        radius: 3 + Math.random() * 9,
        vy: -0.4 - Math.random() * 0.8,
        popTimer: 0,
        maxLife: 80 + Math.random() * 60,
        life: 0
      });
    }
  }

  bindEvents() {
    // Ingredient click & drag
    document.querySelectorAll('.ingredient-card').forEach(card => {
      // Click to add
      card.addEventListener('click', () => {
        this.addIngredient(card.dataset.id, card.dataset.color, card.querySelector('.ing-name').textContent, card.querySelector('.ing-icon').textContent);
      });

      // Drag start
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
          id: card.dataset.id,
          color: card.dataset.color,
          name: card.querySelector('.ing-name').textContent,
          icon: card.querySelector('.ing-icon').textContent
        }));
      });
    });

    // Cauldron Dropzone
    const dropzone = document.getElementById('cauldron-dropzone');
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.filter = 'drop-shadow(0 0 25px var(--accent-toxic))';
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.style.filter = '';
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.filter = '';
        try {
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          this.addIngredient(data.id, data.color, data.name, data.icon);
        } catch (err) {}
      });
    }

    // Stir button
    const stirBtn = document.getElementById('btn-stir-brew');
    if (stirBtn) {
      stirBtn.addEventListener('click', () => {
        this.swirlSpeed = 0.12;
        setTimeout(() => { this.swirlSpeed = 0.02; }, 1200);
        if (window.NeonAudio) window.NeonAudio.playSquelch();
        this.spawnSteamBurst();
      });
    }

    // Transmute Brew
    const brewBtn = document.getElementById('btn-brew-spell');
    if (brewBtn) {
      brewBtn.addEventListener('click', () => this.transmuteSpell());
    }

    // Dump Cauldron
    const dumpBtn = document.getElementById('btn-dump-cauldron');
    if (dumpBtn) {
      dumpBtn.addEventListener('click', () => this.clearCauldron());
    }
  }

  addIngredient(id, color, name, icon) {
    if (this.addedIngredients.length >= 6) {
      alert("The cauldron is already overflowing with magic!");
      return;
    }

    this.addedIngredients.push({ id, color, name, icon });
    this.liquidColor = color;

    // Update glow
    const brewGlow = document.getElementById('brew-glow');
    if (brewGlow) {
      brewGlow.style.background = `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`;
    }

    // Sound & particles
    if (window.NeonAudio) window.NeonAudio.playSquelch();
    this.spawnSteamBurst(color);
    this.updateIngredientChips();
  }

  updateIngredientChips() {
    const list = document.getElementById('added-ingredients-list');
    if (!list) return;

    if (this.addedIngredients.length === 0) {
      list.innerHTML = '<span class="empty-hint">The brew is clear. Drop in ingredients!</span>';
      return;
    }

    list.innerHTML = this.addedIngredients.map(item => `
      <div class="ingredient-chip" style="border-color: ${item.color};">
        <span>${item.icon}</span>
        <span>${item.name}</span>
      </div>
    `).join('');
  }

  spawnSteamBurst(color = '#00ff88') {
    for (let i = 0; i < 18; i++) {
      this.steamParticles.push({
        x: 160 + Math.random() * 80,
        y: 160,
        vx: (Math.random() - 0.5) * 2,
        vy: -1.5 - Math.random() * 2,
        radius: 5 + Math.random() * 14,
        alpha: 0.8,
        color: color
      });
    }
  }

  transmuteSpell() {
    if (this.addedIngredients.length === 0) {
      alert("Add at least one arcane ingredient to brew a potion!");
      return;
    }

    const currentIds = this.addedIngredients.map(i => i.id).sort();

    // Check recipe matches
    const matched = this.recipes.find(r => {
      const rIds = [...r.ingredients].sort();
      return rIds.length === currentIds.length && rIds.every((val, idx) => val === currentIds[idx]);
    });

    const resultBox = document.getElementById('spell-result-box');
    const resultTitle = document.getElementById('spell-result-title');
    const resultDesc = document.getElementById('spell-result-desc');

    if (matched) {
      matched.discovered = true;
      this.liquidColor = matched.color;
      if (resultTitle) resultTitle.textContent = matched.name;
      if (resultDesc) resultDesc.textContent = matched.desc;
      if (window.NeonAudio) {
        window.NeonAudio.playMagicChime();
        window.NeonAudio.playWitch();
      }
    } else {
      // Chaotic Mystery Potion
      const chaoticNames = [
        "Volatile Goblin Fizz",
        "Ectoplasmic Slime Draught",
        "Chuckle of the Crypt Fiend",
        "Spooky Sparkle Tonic",
        "Poltergeist Tonic"
      ];
      const randomName = chaoticNames[Math.floor(Math.random() * chaoticNames.length)];
      if (resultTitle) resultTitle.textContent = randomName;
      if (resultDesc) resultDesc.textContent = "A swirling bubbling mystery concoction! It crackles with supernatural static electricity.";
      if (window.NeonAudio) window.NeonAudio.playMagicChime();
    }

    if (resultBox) {
      resultBox.classList.remove('hidden');
    }

    this.spawnSteamBurst(this.liquidColor);
    this.renderGrimoire();
  }

  clearCauldron() {
    this.addedIngredients = [];
    this.liquidColor = '#00ff88';
    this.updateIngredientChips();
    const resultBox = document.getElementById('spell-result-box');
    if (resultBox) resultBox.classList.add('hidden');
    const brewGlow = document.getElementById('brew-glow');
    if (brewGlow) brewGlow.style.background = 'radial-gradient(ellipse at center, rgba(0, 255, 136, 0.6) 0%, transparent 70%)';
    if (window.NeonAudio) window.NeonAudio.playSquelch();
  }

  renderGrimoire() {
    const list = document.getElementById('grimoire-list');
    const counter = document.getElementById('grimoire-counter');
    if (!list) return;

    const discoveredCount = this.recipes.filter(r => r.discovered).length;
    if (counter) counter.textContent = `${discoveredCount} / ${this.recipes.length} Discovered`;

    list.innerHTML = this.recipes.map(recipe => {
      if (recipe.discovered) {
        return `
          <div class="grimoire-entry unlocked">
            <span>✨ <strong>${recipe.name}</strong></span>
            <small style="color: ${recipe.color}; font-family: var(--font-mono);">MASTERED</small>
          </div>
        `;
      } else {
        return `
          <div class="grimoire-entry locked">
            <span>🔒 <em>Secret Spell (${recipe.ingredients.length} items)</em></span>
            <small>LOCKED</small>
          </div>
        `;
      }
    }).join('');
  }

  startBubbleLoop() {
    const loop = () => {
      this.renderCanvas();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  renderCanvas() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 400, 400);

    // Liquid surface center: x=200, y=170, radiusX=95, radiusY=35
    this.swirlAngle += this.swirlSpeed;

    // Draw glowing surface swirl
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(200, 168, 92, 34, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.liquidColor;
    ctx.globalAlpha = 0.65;
    ctx.shadowColor = this.liquidColor;
    ctx.shadowBlur = 20;
    ctx.fill();

    // Swirling inner rings
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(200, 168, 60, 20, this.swirlAngle, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();

    // Render & update bubbles
    this.bubbles.forEach(b => {
      b.y += b.vy;
      b.life++;

      if (b.life > b.maxLife || b.y < 145) {
        b.y = 185;
        b.x = 135 + Math.random() * 130;
        b.life = 0;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.strokeStyle = this.liquidColor;
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // Bubble highlight shine
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    });

    // Render & update steam particles
    for (let i = this.steamParticles.length - 1; i >= 0; i--) {
      const p = this.steamParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.015;
      p.radius += 0.3;

      if (p.alpha <= 0) {
        this.steamParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * 0.5;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();
    }
  }
}

// Global instance
window.AlchemicalCauldron = new PotionCauldron();
