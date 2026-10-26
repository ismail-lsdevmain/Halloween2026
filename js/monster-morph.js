/**
 * NEON HOLLOW 🎃 MONSTER MORPH: HALLOWEEN PERSONA GENERATOR
 * Generates personalized Halloween Monster Identification Badges with stats,
 * custom archetypes, spooky titles, zodiac signs, and clipboard sharing.
 */

class MonsterMorphEngine {
  constructor() {
    this.titles = {
      vampire: [
        'Archduke of Midnight Terrors',
        'Eternal Blood Sovereign',
        'Count of Crimson Whispers',
        'High Arbiter of the Dark Coven'
      ],
      witch: [
        'Grand Alchemist of the Void',
        'Mistress of Quantum Hexes',
        'Brewmaster of Starlight Nightshades',
        'Seer of Binary Runes'
      ],
      ghoul: [
        'Supreme Warden of the Catacombs',
        'Chanter of Rattle-Bones',
        'Ancient Cryptwalker',
        'Keeper of Forgotten Tombs'
      ],
      pumpkin: [
        'Emperor of the Rotten Patch',
        'Igniter of Jack-O\'-Lantern Souls',
        'High Monarch of Autumn Dread',
        'Gourd of the Nether Abyss'
      ],
      phantom: [
        'Wraith of the Spectral Veil',
        'Echo of the Hollow Corridor',
        'Weaver of Frost Fog',
        'Poltergeist of the Lost Abbey'
      ],
      werewolf: [
        'Alpha of the Bloodmoon Pack',
        'Savage Stalker of the Silver Pines',
        'Howler of the Midnight Eclipse',
        'Beast of the Black Forest'
      ]
    };

    this.emojis = {
      vampire: '🧛',
      witch: '🧙‍♀️',
      ghoul: '💀',
      pumpkin: '🎃',
      phantom: '👻',
      werewolf: '🐺'
    };

    this.zodiacs = [
      'Scorpio of Doom',
      'Blood Aries',
      'Crypt Pisces',
      'Eclipse Gemini',
      'Nether Taurus',
      'Spectral Capricorn',
      'Abyssal Leo',
      'Wraith Sagittarius'
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.generatePass();
  }

  bindEvents() {
    const genBtn = document.getElementById('btn-generate-morph');
    if (genBtn) genBtn.addEventListener('click', () => this.generatePass());

    const randomBtn = document.getElementById('btn-random-morph');
    if (randomBtn) randomBtn.addEventListener('click', () => this.randomChaos());

    const copyBtn = document.getElementById('btn-copy-pass');
    if (copyBtn) copyBtn.addEventListener('click', () => this.copyPassToClipboard());
  }

  generatePass() {
    const nameInput = document.getElementById('morph-name');
    const archetypeSelect = document.getElementById('morph-archetype');
    const elementSelect = document.getElementById('morph-element');

    const rawName = (nameInput && nameInput.value.trim()) || 'Mortal Traveler';
    const archetype = archetypeSelect ? archetypeSelect.value : 'vampire';
    const element = elementSelect ? elementSelect.options[elementSelect.selectedIndex].text : 'Abyssal Void';

    // Random title for archetype
    const titlesList = this.titles[archetype] || this.titles.vampire;
    const title = titlesList[Math.floor(Math.random() * titlesList.length)];
    const emoji = this.emojis[archetype] || '🎃';
    const zodiac = this.zodiacs[Math.floor(Math.random() * this.zodiacs.length)];
    const idNum = 'HLW-' + Math.floor(1000 + Math.random() * 9000);

    // Random stats
    const spooky = Math.floor(75 + Math.random() * 25);
    const candy = Math.floor(60 + Math.random() * 39);
    const stealth = Math.floor(70 + Math.random() * 30);

    // Update DOM
    const nameEl = document.getElementById('pass-name');
    const titleEl = document.getElementById('pass-title');
    const speciesEl = document.getElementById('pass-species');
    const elementEl = document.getElementById('pass-element');
    const zodiacEl = document.getElementById('pass-zodiac');
    const idEl = document.getElementById('pass-id-num');
    const emojiEl = document.getElementById('pass-avatar-emoji');

    if (nameEl) nameEl.textContent = rawName;
    if (titleEl) titleEl.textContent = title;
    if (speciesEl) speciesEl.textContent = archetypeSelect ? archetypeSelect.options[archetypeSelect.selectedIndex].text.replace(/^.*?\s/, '') : archetype;
    if (elementEl) elementEl.textContent = element.replace(/^.*?\s/, '');
    if (zodiacEl) zodiacEl.textContent = zodiac;
    if (idEl) idEl.textContent = `ID #${idNum}`;
    if (emojiEl) emojiEl.textContent = emoji;

    // Progress Bars
    const spookyBar = document.getElementById('stat-spooky-bar');
    const spookyVal = document.getElementById('stat-spooky-val');
    const candyBar = document.getElementById('stat-candy-bar');
    const candyVal = document.getElementById('stat-candy-val');
    const stealthBar = document.getElementById('stat-stealth-bar');
    const stealthVal = document.getElementById('stat-stealth-val');

    if (spookyBar && spookyVal) {
      spookyBar.style.width = `${spooky}%`;
      spookyVal.textContent = `${spooky}%`;
    }
    if (candyBar && candyVal) {
      candyBar.style.width = `${candy}%`;
      candyVal.textContent = `${candy}%`;
    }
    if (stealthBar && stealthVal) {
      stealthBar.style.width = `${stealth}%`;
      stealthVal.textContent = `${stealth}%`;
    }

    if (window.NeonAudio) window.NeonAudio.playMagicChime();
  }

  randomChaos() {
    const randomNames = [
      'Lord Malakor the Vile',
      'Hex-Mistress Morgana',
      'Bartholomew Bloodthorn',
      'Lady Nyx of the Shadows',
      'Professor Ravenshade',
      'Grim-Eye Cornelius',
      'Ignis Pumpkin-Spine'
    ];

    const archetypes = Object.keys(this.titles);
    const randArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    const randName = randomNames[Math.floor(Math.random() * randomNames.length)];

    const nameInput = document.getElementById('morph-name');
    const archetypeSelect = document.getElementById('morph-archetype');
    const elementSelect = document.getElementById('morph-element');

    if (nameInput) nameInput.value = randName;
    if (archetypeSelect) archetypeSelect.value = randArchetype;
    if (elementSelect) elementSelect.selectedIndex = Math.floor(Math.random() * elementSelect.options.length);

    this.generatePass();
    if (window.NeonAudio) window.NeonAudio.playHowl();
  }

  copyPassToClipboard() {
    const name = document.getElementById('pass-name')?.textContent;
    const title = document.getElementById('pass-title')?.textContent;
    const species = document.getElementById('pass-species')?.textContent;
    const id = document.getElementById('pass-id-num')?.textContent;
    const spooky = document.getElementById('stat-spooky-val')?.textContent;

    const text = `🎃 OFFICIAL HALLOWEEN MONSTER PASS [${id}] 🎃\nIdentity: ${name}\nTitle: ${title}\nSpecies: ${species}\nSpookiness: ${spooky}\nAuthorized by Neon Hollow Sanctum.`;

    navigator.clipboard.writeText(text).then(() => {
      alert("🦇 Monster ID Pass copied to clipboard! Share your spooky identity!");
      if (window.NeonAudio) window.NeonAudio.playMagicChime();
    }).catch(() => {
      alert("Monster Pass summary:\n" + text);
    });
  }
}

// Global instance
window.SanctumMorph = new MonsterMorphEngine();
