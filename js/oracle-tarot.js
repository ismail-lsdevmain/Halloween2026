/**
 * NEON HOLLOW 🎃 THE HAUNTED ORACLE & SPIRIT SANCTUM
 * 3D Tarot card drawing with perspective flips and lore readings,
 * plus interactive Ouija board with smooth gliding planchette physics.
 */

class HauntedOracle {
  constructor() {
    this.tarotCards = [
      {
        arcana: 'XIII',
        name: 'The Grim Reaper',
        icon: '💀',
        reading: 'Demise of a painful past chapter opens the gateway for unearthly rebirth.'
      },
      {
        arcana: 'IX',
        name: 'The Hollow Pumpkin',
        icon: '🎃',
        reading: 'A solitary lantern burns brightly amidst deceit; trust the inner flame.'
      },
      {
        arcana: 'XVI',
        name: 'The Cursed Manor',
        icon: '🏰',
        reading: 'Foundations built on secrets shall shake; prepare for sudden revelation.'
      },
      {
        arcana: 'XVIII',
        name: 'The Blood Moon',
        icon: '🌕',
        reading: 'Illusions peak under nocturnal skies. What lurks in shadow is not as it appears.'
      },
      {
        arcana: 'I',
        name: 'The Hexing Familiar',
        icon: '🐈‍⬛',
        reading: 'Subtle intuition and nine lives of luck shall shield you from unseen perils.'
      },
      {
        arcana: 'XV',
        name: 'The Banshee',
        icon: '👻',
        reading: 'An ominous echo urges you to speak the truth before midnight tolls.'
      },
      {
        arcana: 'IV',
        name: 'The Crypt Warden',
        icon: '⚰️',
        reading: 'Boundaries must be fortified. Do not disturb relics meant to remain buried.'
      },
      {
        arcana: 'VII',
        name: 'The Cyber-Witch',
        icon: '🧙‍♀️',
        reading: 'Arcane technology and forbidden alchemy align in your favor this eve.'
      },
      {
        arcana: 'X',
        name: 'The Vampire Lord',
        icon: '🧛',
        reading: 'Immortality of ambition. Protect your vital energy from seductive leeches.'
      },
      {
        arcana: 'VIII',
        name: 'The Lycan Howl',
        icon: '🐺',
        reading: 'Untamed instincts awaken. Channel the beast within rather than denying it.'
      },
      {
        arcana: '0',
        name: 'The Cosmic Eye',
        icon: '👁️',
        reading: 'A journey into the unknown void begins. Trust fate and step boldly.'
      },
      {
        arcana: 'XXI',
        name: 'The Phantom Web',
        icon: '🕸️',
        reading: 'A grand cosmic tapestry completes. You are bound to a miraculous outcome.'
      }
    ];

    this.isPlanchetteMoving = false;
    this.init();
  }

  init() {
    this.bindEvents();
    // Default: draw cards
    this.drawTarotCards();
  }

  bindEvents() {
    // Oracle Sub-view Navigation
    const tarotBtn = document.getElementById('subtab-btn-tarot');
    const ouijaBtn = document.getElementById('subtab-btn-ouija');
    const tarotView = document.getElementById('view-tarot');
    const ouijaView = document.getElementById('view-ouija');

    if (tarotBtn && ouijaBtn) {
      tarotBtn.addEventListener('click', () => {
        tarotBtn.classList.add('active');
        ouijaBtn.classList.remove('active');
        tarotView.classList.add('active');
        ouijaView.classList.remove('active');
      });

      ouijaBtn.addEventListener('click', () => {
        ouijaBtn.classList.add('active');
        tarotBtn.classList.remove('active');
        ouijaView.classList.add('active');
        tarotView.classList.remove('active');
      });
    }

    // Draw Tarot button
    const drawBtn = document.getElementById('btn-draw-tarot');
    if (drawBtn) {
      drawBtn.addEventListener('click', () => this.drawTarotCards());
    }

    // Individual Tarot Card click flip
    document.querySelectorAll('.tarot-card-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        wrapper.classList.toggle('flipped');
        if (window.NeonAudio) window.NeonAudio.playSquelch();
      });
    });

    // Ouija Ask
    const askOuijaBtn = document.getElementById('btn-ask-ouija');
    const ouijaInput = document.getElementById('ouija-question-input');
    if (askOuijaBtn && ouijaInput) {
      askOuijaBtn.addEventListener('click', () => {
        const q = ouijaInput.value.trim();
        if (q) this.askSpirits(q);
      });
      ouijaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = ouijaInput.value.trim();
          if (q) this.askSpirits(q);
        }
      });
    }

    // Ouija Quick Questions
    document.querySelectorAll('.quick-q-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (ouijaInput) ouijaInput.value = btn.dataset.q;
        this.askSpirits(btn.dataset.q);
      });
    });
  }

  drawTarotCards() {
    const wrappers = document.querySelectorAll('.tarot-card-wrapper');
    // First, unflip all cards
    wrappers.forEach(w => w.classList.remove('flipped'));

    if (window.NeonAudio) window.NeonAudio.playMusicBox();

    // Pick 3 unique cards
    const shuffled = [...this.tarotCards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    setTimeout(() => {
      selected.forEach((card, idx) => {
        const arcanaEl = document.getElementById(`card-${idx}-arcana`);
        const iconEl = document.getElementById(`card-${idx}-icon`);
        const nameEl = document.getElementById(`card-${idx}-name`);
        const readingEl = document.getElementById(`card-${idx}-reading`);

        if (arcanaEl) arcanaEl.textContent = card.arcana;
        if (iconEl) iconEl.textContent = card.icon;
        if (nameEl) nameEl.textContent = card.name;
        if (readingEl) readingEl.textContent = card.reading;
      });

      // Cascade flip
      wrappers.forEach((w, i) => {
        setTimeout(() => {
          w.classList.add('flipped');
          if (window.NeonAudio) window.NeonAudio.playChains();
        }, i * 350 + 200);
      });
    }, 450);
  }

  // Spirit Board Planchette Animation
  async askSpirits(question) {
    if (this.isPlanchetteMoving) return;
    this.isPlanchetteMoving = true;

    const board = document.getElementById('ouija-wood-board');
    const planchette = document.getElementById('ouija-planchette');
    const readout = document.getElementById('ouija-readout-text');
    if (!board || !planchette || !readout) return;

    readout.textContent = "Communing with the spirit realm...";
    if (window.NeonAudio) window.NeonAudio.playGhost();

    // Pick response
    const answers = [
      "YES",
      "NO",
      "BEWARE",
      "RUN",
      "WATCH",
      "SOON",
      "NEVER",
      "ALWAYS",
      "BEHIND YOU",
      "HAUNTED"
    ];

    let chosenAnswer = answers[Math.floor(Math.random() * answers.length)];
    const qLower = question.toLowerCase();
    if (qLower.includes('survive')) {
      chosenAnswer = Math.random() > 0.5 ? "YES" : "RUN";
    } else if (qLower.includes('behind')) {
      chosenAnswer = "LOOK CLOSER";
    } else if (qLower.includes('dark')) {
      chosenAnswer = "EYES OF DREAD";
    }

    const boardRect = board.getBoundingClientRect();

    // If answer is YES or NO
    if (chosenAnswer === 'YES' || chosenAnswer === 'NO') {
      const targetWord = document.getElementById(`ouija-${chosenAnswer.toLowerCase()}`);
      if (targetWord) {
        await this.moveToElement(planchette, board, targetWord);
        await this.sleep(800);
      }
    } else {
      // Spell letter by letter
      const chars = chosenAnswer.replace(/[^A-Z0-9]/g, '').split('');
      for (const char of chars) {
        const letterSpan = Array.from(board.querySelectorAll('.board-arc-row span, .board-numbers-row span'))
          .find(el => el.textContent.trim().toUpperCase() === char);

        if (letterSpan) {
          await this.moveToElement(planchette, board, letterSpan);
          letterSpan.classList.add('lit');
          if (window.NeonAudio) window.NeonAudio.playSquelch();
          await this.sleep(450);
          letterSpan.classList.remove('lit');
        }
      }
    }

    // Finally glide to GOODBYE
    const goodbyeEl = document.getElementById('ouija-goodbye');
    if (goodbyeEl) {
      await this.moveToElement(planchette, board, goodbyeEl);
      await this.sleep(600);
    }

    // Return to center
    planchette.style.top = '50%';
    planchette.style.left = '50%';

    readout.innerHTML = `Spirits whisper: <strong style="color: var(--accent-primary); letter-spacing: 2px;">"${chosenAnswer}"</strong>`;
    if (window.NeonAudio) window.NeonAudio.playOrgan();

    this.isPlanchetteMoving = false;
  }

  moveToElement(planchette, board, targetEl) {
    return new Promise(resolve => {
      const boardRect = board.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const targetX = targetRect.left + targetRect.width / 2 - boardRect.left;
      const targetY = targetRect.top + targetRect.height / 2 - boardRect.top;

      const pctX = (targetX / boardRect.width) * 100;
      const pctY = (targetY / boardRect.height) * 100;

      planchette.style.left = `${pctX}%`;
      planchette.style.top = `${pctY}%`;

      setTimeout(resolve, 600);
    });
  }

  sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
}

// Global instance
window.SanctumOracle = new HauntedOracle();
