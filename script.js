// ==================== STATE & AUDIO ====================
let currentStage = 1;
let stars = 0;
let soundEnabled = true;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
}

function playTone(type) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.09); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.18); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.38);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(175, now + 0.12);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'triangle';
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.setValueAtTime(freq, now + idx * 0.11);
        g.gain.setValueAtTime(0.18, now + idx * 0.11);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.32);
        o.start(now + idx * 0.11);
        o.stop(now + idx * 0.11 + 0.32);
      });
    }
  } catch (e) {
    // Ignore audio context restrictions
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('soundToggleBtn');
  btn.textContent = soundEnabled ? '🔊' : '🔇';
  if (soundEnabled) playTone('click');
}

function addStars(amount) {
  stars += amount;
  document.getElementById('starCount').textContent = stars;
}

// ==================== STAGE NAVIGATION & VIDEO ====================
function pauseAllVideos() {
  for (let i = 1; i <= 4; i++) {
    const vid = document.getElementById(`video-${i}`);
    if (vid && !vid.paused) {
      vid.pause();
    }
  }
}

function goToStage(stageNum) {
  playTone('click');
  pauseAllVideos();
  currentStage = stageNum;

  document.querySelectorAll('.stage-section').forEach((sec, idx) => {
    sec.classList.toggle('active', idx + 1 === stageNum);
  });

  document.querySelectorAll('.stage-btn').forEach((btn) => {
    const s = Number(btn.getAttribute('data-stage'));
    btn.classList.toggle('active', s === stageNum);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function markStageCompleted(stageNum) {
  const btn = document.querySelector(`.stage-btn[data-stage="${stageNum}"]`);
  if (btn) btn.classList.add('completed');
}

function playStageVideo(stageNum) {
  pauseAllVideos();
  const vid = document.getElementById(`video-${stageNum}`);
  if (vid) {
    vid.play().catch(() => {});
  }
}

function replayStageVideo(stageNum) {
  pauseAllVideos();
  const vid = document.getElementById(`video-${stageNum}`);
  if (vid) {
    vid.currentTime = 0;
    vid.play().catch(() => {});
  }
}

// ==================== STAGE 1: TOOL SELECTION ====================
const explorerToolsData = {
  lupa: {
    correct: true,
    title: '🔍 ჭკვიანი ლუპა',
    msg: 'შესანიშნავია! ლუპით ყველაზე პატარა ჭიანჭველასა და ხოჭოს მატლსაც ახლოდან დავაკვირდებით!'
  },
  telescope: {
    correct: false,
    title: '🔭 ტელესკოპი',
    msg: 'ჰაჰა! ტელესკოპი ცაში ვარსკვლავებისა და პლანეტების საყურებლადაა — მიწის ქვეშ ის არ გამოგვადგება!'
  },
  shovel: {
    correct: true,
    title: 'ნიჩაბი',
    msg: 'სწორია! პატარა ნიჩბით მიწას ფრთხილად გავაფხვიერებთ ისე, რომ ბინადრებს სახლები არ დავუზიანოთ.'
  },
  detector: {
    correct: true,
    title: '📡 მიწისქვეშა დეტექტორი',
    msg: 'ბითი: „სუპერ! დეტექტორით ღრმა სოროებსა და მიწისქვეშა მოძრაობას უცებ ვიპოვით!“'
  },
  diary: {
    correct: true,
    title: '📓 საველე დღიური',
    msg: 'ეკო: „ძალიან კარგია! დღიურში ჩავინიშნავთ, ვინ სად ცხოვრობს და როგორი მიწა მოსწონს!“'
  },
  fins: {
    correct: false,
    title: '🤿 საცურაო აღჭურვილობა',
    msg: 'არასწორია! საცურაო აღჭურვილობა ზღვაში საყვინთაოდაა საჭირო, ჩვენ კი ნიადაგის გამოსაკვლევად მივდივართ!'
  },
  flashlight: {
    correct: true,
    title: '🔦 ფარანი სოროებისთვის',
    msg: 'ყოჩაღ! მიწის ქვეშ მზის სხივები ვერ აღწევს, ამიტომ ფარანი ბნელ გვირაბებს გაგვინათებს!'
  },
  horn: {
    correct: false,
    title: '📢 ხმამაღალი საყვირი',
    msg: 'არა! ტყესა და მინდორში ხმაური არ შეიძლება — საყვირი ნიადაგის ბინადრებს შეაშინებს და დააფრთხობს!'
  },
  gloves: {
    correct: true,
    title: '🧤 დამცავი ხელთათმანი',
    msg: 'ზუსტია! ნამდვილ მკვლევარს მიწასა და ფოთლებთან სამუშაოდ დამცავი ხელთათმანი აუცილებლად სჭირდება!'
  }
};

let pickedCorrectTools = new Set();
let stage1BonusAwarded = false;

function selectExplorerTool(btnEl, toolKey) {
  const tool = explorerToolsData[toolKey];
  if (!tool) return;

  const badge = btnEl.querySelector('.tool-badge');
  const speech = document.getElementById('stage1Speech');

  if (tool.correct) {
    if (!pickedCorrectTools.has(toolKey)) {
      pickedCorrectTools.add(toolKey);
      btnEl.classList.add('correct-tool');
      if (badge) badge.textContent = '✅';
      playTone('success');
      addStars(1);
      document.getElementById('toolsPickedCount').textContent = pickedCorrectTools.size;

      if (pickedCorrectTools.size === 6 && !stage1BonusAwarded) {
        stage1BonusAwarded = true;
        markStageCompleted(1);
        playTone('fanfare');
        speech.innerHTML =
          '🎉 <strong>ყოჩაღ!</strong> ზურგჩანთაში ექვსივე საჭირო ხელსაწყო ჩაალაგე! ახლა მზად ხარ — გადავიდეთ მე-2 ეტაპზე!';
      } else {
        speech.innerHTML = `✅ <strong>${tool.title}:</strong> ${tool.msg}`;
      }
    } else {
      playTone('click');
      speech.innerHTML = `✅ <strong>${tool.title}</strong> უკვე ზურგჩანთაშია! ${tool.msg}`;
    }
  } else {
    playTone('error');
    btnEl.classList.remove('wrong-tool');
    void btnEl.offsetWidth;
    btnEl.classList.add('wrong-tool');
    if (badge) badge.textContent = '❌';
    speech.innerHTML = `❌ <strong>${tool.title}:</strong> ${tool.msg}`;
  }
}

// ==================== STAGE 2: SOIL SCANNER ====================
const scannerCreatures = [
  {
    emoji: '🪱',
    iconHtml: '<img src="ჭიაყელა.jpg" alt="ჭიაყელა" class="worm-discovery-icon" />',
    title: 'ჭიაყელა (წვიმის ჭია)',
    text: 'ეკო: „ეს ჭიაყელაა! ის ნიადაგში პატარა გვირაბებს თხრის, მიწას აფხვიერებს და მცენარეებს სუნთქვაში ეხმარება.“'
  },
  {
    emoji: '🐌',
    title: 'ლოკოკინა',
    text: 'ბითი: „ჩემმა სკანერმა ლოკოკინა დააფიქსირა! მას ზურგზე საკუთარი სახლი — ნიჟარა აკიდია და ნესტიანი ფოთლები უყვარს.“'
  },
  {
    emoji: '🐜',
    title: 'ჭიანჭველა',
    text: 'ეკო: „ჭიანჭველები ნიადაგის ქვეშ ნამდვილ მრავალსართულიან ქალაქებსა და დერეფნებს აშენებენ!“'
  },
  {
    emoji: '🐛',
    title: 'ხოჭოს მატლი',
    text: 'ბითი: „ეს ხოჭოს მატლია! ის მიწის ქვეშ, ფესვებთან და ხის ქერქთან იზრდება, სანამ ზრდასრულ ხოჭოდ გადაიქცევა.“'
  },
  {
    emoji: '🐾',
    iconHtml: '<img src="თხუნელა.png" alt="თხუნელა" class="worm-discovery-icon" />',
    title: 'თხუნელა',
    text: 'ეკო: „ვაა, თხუნელა! ის მიწისქვეშა ცხოველია და თავისი ძლიერი წინა თათებით გრძელ სოროებს თხრის.“'
  },
  {
    emoji: '🐛',
    iconHtml: `<svg viewBox="0 0 64 40" width="36" height="26" aria-hidden="true">
      <g stroke="#5d4037" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="24" x2="9" y2="34"/><line x1="15" y1="24" x2="14" y2="34"/>
        <line x1="22" y1="23" x2="20" y2="33"/><line x1="25" y1="23" x2="24" y2="33"/>
        <line x1="32" y1="22" x2="30" y2="32"/><line x1="35" y1="22" x2="34" y2="32"/>
        <line x1="42" y1="23" x2="40" y2="33"/><line x1="45" y1="23" x2="44" y2="33"/>
        <line x1="51" y1="24" x2="50" y2="34"/><line x1="54" y1="24" x2="55" y2="34"/>
      </g>
      <circle cx="13" cy="20" r="6" fill="#bf360c"/>
      <circle cx="22" cy="18" r="6.5" fill="#d84315"/>
      <circle cx="32" cy="17" r="6.5" fill="#e64a19"/>
      <circle cx="42" cy="18" r="6.5" fill="#d84315"/>
      <circle cx="51" cy="19" r="7" fill="#bf360c"/>
      <path d="M56 15 Q61 9 63 11" fill="none" stroke="#bf360c" stroke-width="2" stroke-linecap="round"/>
      <path d="M57 18 Q62 15 63 18" fill="none" stroke="#bf360c" stroke-width="2" stroke-linecap="round"/>
      <circle cx="53.5" cy="17.5" r="1.5" fill="#fff"/>
    </svg>`,
    title: 'მრავალფეხა',
    text: 'ბითი: „სკანერმა მრავალფეხა აღმოაჩინა! მას უამრავი პატარა ფეხი აქვს და ნესტიანი ფოთლებისა და ქვების ქვეშ სწრაფად დაცოცავს.“'
  },
  {
    emoji: '🦗',
    title: 'მიწის კალია / კოკორი',
    text: 'ეკო: „ეს მიწის კალიაა, რომელსაც მახრას ან კოკორსაც ეძახიან! მისი ძლიერი წინა ფეხები ნიჩბებს ჰგავს და მიწის გათხრაში ეხმარება.“'
  },
  {
    emoji: '🐍',
    title: 'მიწის მცოცავი გველი',
    text: 'ბითი: „შეხედე, მიწის მცოცავი გველი! ის უფეხოდ, სხეულის კლაკვნით სრიალებს ბალახსა და მიწის ნაპრალებში.“'
  },
  {
    emoji: '🐭',
    title: 'მინდვრის თაგვი',
    text: 'ეკო: „ეს პატარა მინდვრის თაგვია! ის მიწის ქვეშ თბილ სოროს იწყობს და ზამთრისთვის მარცვლებს აგროვებს.“'
  },
  {
    emoji: '🕷️',
    title: 'მიწის ობობა',
    text: 'ბითი: „ჩემმა სკანერმა მიწის ობობა დააფიქსირა! ის ლოკოკინასავით ნიადაგის ზედაპირზე, ფოთლებსა და ქვებს შორის ბინადრობს.“'
  }
];

let discoveredSet = new Set();
let creatureToDiarySlot = {};

function moveScannerLens(e) {
  const scene = document.getElementById('scannerScene');
  const lens = document.getElementById('scannerLens');
  const rect = scene.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  lens.style.left = `${x}px`;
  lens.style.top = `${y}px`;
}

function showCreatureInInfoCard(index) {
  const data = scannerCreatures[index];
  const iconEl = document.getElementById('discoveryIcon');
  if (data.iconHtml) {
    iconEl.innerHTML = data.iconHtml;
  } else {
    iconEl.textContent = data.emoji;
  }
  document.getElementById('discoveryTitle').textContent = data.title;
  document.getElementById('discoveryText').textContent = data.text;

  document.querySelectorAll('#diaryEntriesList .diary-line').forEach((lineEl) => {
    lineEl.classList.remove('active-entry');
  });
  const slotIdx = creatureToDiarySlot[index];
  if (slotIdx !== undefined) {
    const activeLine = document.querySelector(`#diaryEntriesList .diary-line[data-slot="${slotIdx}"]`);
    if (activeLine) activeLine.classList.add('active-entry');
  }
}

function writeCreatureToDiary(index, slotIdx) {
  const data = scannerCreatures[index];
  const lineEl = document.querySelector(`#diaryEntriesList .diary-line[data-slot="${slotIdx}"]`);
  if (!lineEl) return;

  let smallIconHtml = data.emoji;
  if (index === 0) {
    smallIconHtml = '<img src="ჭიაყელა.jpg" alt="ჭიაყელა" class="worm-inline-icon" />';
  } else if (index === 4) {
    smallIconHtml = '<img src="თხუნელა.png" alt="თხუნელა" class="worm-inline-icon" />';
  } else if (data.iconHtml) {
    smallIconHtml = data.iconHtml;
  }

  lineEl.classList.add('filled', 'just-written');
  lineEl.innerHTML = `
    <span class="line-num">${slotIdx + 1}.</span>
    <span class="diary-entry-icon">${smallIconHtml}</span>
    <span class="diary-entry-name">${data.title}</span>
    <span class="diary-entry-check">✅</span>
  `;
  lineEl.onclick = () => {
    playTone('click');
    showCreatureInInfoCard(index);
  };
}

function discoverCreature(spotEl, index) {
  if (!discoveredSet.has(index)) {
    const slotIdx = discoveredSet.size;
    discoveredSet.add(index);
    creatureToDiarySlot[index] = slotIdx;

    spotEl.classList.add('discovered');
    writeCreatureToDiary(index, slotIdx);
    showCreatureInInfoCard(index);

    playTone('success');
    addStars(1);
    document.getElementById('foundCount').textContent = discoveredSet.size;

    if (discoveredSet.size === scannerCreatures.length) {
      markStageCompleted(2);
      playTone('fanfare');
      document.getElementById('discoveryTitle').textContent =
        '🎉 ყოჩაღ! შენ ათივე ბინადარი აღმოაჩინე და საველე დღიურიც ბოლომდე შეავსე!';
    }
  } else {
    playTone('click');
    showCreatureInInfoCard(index);
  }
}

// ==================== STAGE 3: UNDERGROUND CITY PLACEMENT (VISUAL ONLY) ====================
let selectedCityAnimal = null;
let placedCityAnimals = new Set();

const cityAnimalInfo = {
  snail: {
    zone: 'surface',
    visualHtml: '🐌'
  },
  spider: {
    zone: 'surface',
    visualHtml: '🕷️'
  },
  ants: {
    zone: 'roots',
    visualHtml: '🐜'
  },
  worm: {
    zone: 'roots',
    visualHtml: '<img src="ჭიაყელა.jpg" alt="ჭიაყელა" class="worm-token-img" />'
  },
  larva: {
    zone: 'roots',
    visualHtml: '🐛'
  },
  mouse: {
    zone: 'deep',
    visualHtml: '🐭'
  },
  mole: {
    zone: 'deep',
    visualHtml: '<img src="თხუნელა.png" alt="თხუნელა" class="worm-token-img" />'
  }
};

function selectCityAnimal(tokenEl, animalKey) {
  if (placedCityAnimals.has(animalKey)) return;
  playTone('click');
  selectedCityAnimal = animalKey;

  document.querySelectorAll('.animal-token').forEach((el) => el.classList.remove('selected'));
  tokenEl.classList.add('selected');
}

function dragCityAnimal(e, animalKey) {
  if (placedCityAnimals.has(animalKey)) {
    e.preventDefault();
    return;
  }
  selectedCityAnimal = animalKey;
  e.dataTransfer.setData('text/plain', animalKey);
  document.querySelectorAll('.animal-token').forEach((el) => {
    el.classList.toggle('selected', el.getAttribute('data-animal') === animalKey);
  });
}

function allowCityDrop(e, zoneEl) {
  e.preventDefault();
  zoneEl.classList.add('drag-over');
}

function leaveCityDrop(zoneEl) {
  zoneEl.classList.remove('drag-over');
}

function dropOnCityZone(e, zoneEl, zoneKey) {
  e.preventDefault();
  zoneEl.classList.remove('drag-over');
  const draggedKey = e.dataTransfer.getData('text/plain') || selectedCityAnimal;
  if (draggedKey) {
    selectedCityAnimal = draggedKey;
    placeInCityZone(zoneEl, zoneKey);
  }
}

function placeInCityZone(zoneEl, zoneKey) {
  if (!selectedCityAnimal) {
    playTone('error');
    return;
  }

  const animalKey = selectedCityAnimal;
  if (placedCityAnimals.has(animalKey)) return;

  const info = cityAnimalInfo[animalKey];
  if (info && info.zone === zoneKey) {
    playTone('success');
    placedCityAnimals.add(animalKey);

    const badgesBox = document.getElementById(`zoneBadges-${zoneKey}`);
    if (badgesBox) {
      const pill = document.createElement('div');
      pill.className = 'placed-animal-pill';
      pill.innerHTML = info.visualHtml;
      badgesBox.appendChild(pill);
    }

    const tokenEl = document.querySelector(`.animal-token[data-animal="${animalKey}"]`);
    if (tokenEl) {
      tokenEl.classList.remove('selected');
      tokenEl.classList.add('placed');
    }

    selectedCityAnimal = null;
    addStars(1);
    document.getElementById('cityPlacedCount').textContent = placedCityAnimals.size;

    if (placedCityAnimals.size === 7) {
      markStageCompleted(3);
      playTone('fanfare');
    }
  } else {
    playTone('error');
    zoneEl.classList.remove('wrong-shake');
    void zoneEl.offsetWidth;
    zoneEl.classList.add('wrong-shake');
  }
}

// ==================== STAGE 4: WEATHER & SOIL MOISTURE SIMULATOR ====================
const simCreaturesInfo = {
  black_beetle: {
    name: 'შავი მიწის ხოჭო',
    msg: '☀️ <strong>ეკო:</strong> „შავ მიწის ხოჭოებს მზიანი ამინდი, მშრალი და ფხვიერი მიწა მოსწონთ!“'
  },
  field_beetle: {
    name: 'მინდვრის ხოჭო',
    msg: '☀️ <strong>ბითი:</strong> „მინდვრის ხოჭოც მშრალ და თბილ ნიადაგზე გამოდის სასეირნოდ!“'
  },
  ants_dry: {
    name: '🐜 ჭიანჭველა',
    msg: '☀️ <strong>ეკო:</strong> „მზიან ამინდში ჭიანჭველები მშრალ და ფხვიერ მიწაზე აქტიურად აგროვებენ საკვებს!“'
  },
  snail_moist: {
    name: '🐌 ლოკოკინა',
    msg: '🌧️ <strong>ეკო:</strong> „წვიმის შემდეგ, როცა გარემო გრილი და ნესტიანია, ლოკოკინები სველ ფოთლებზე გამოდიან!“'
  },
  worm_moist: {
    name: 'წვიმის ჭია (ჭიაყელა)',
    msg: '🌧️ <strong>ბითი:</strong> „წვიმის ჭიებს სუნთქვისა და მოძრაობისთვის აუცილებლად გრილი და ნესტიანი მიწა სჭირდებათ!“'
  },
  hedgehog_moist: {
    name: '🦔 ზღარბი',
    msg: '🌧️ <strong>ეკო:</strong> „ზღარბსაც გრილი, ნესტიანი და ფოთლებით დაფარული ტყისპირა გარემო ურჩევნია!“'
  },
  mouse_moist: {
    name: '🐭 მინდვრის თაგვი',
    msg: '🌧️ <strong>ბითი:</strong> „მინდვრის თაგვიც გრილ და ნესტიან გარემოში, თავის ბალახოვან სოროში გრძნობს თავს მყუდროდ!“'
  }
};

let observedSimCreatures = new Set();

function setWeatherMode(mode) {
  playTone('click');
  const scene = document.getElementById('weatherSimScene');
  const btnDry = document.getElementById('btnWeatherDry');
  const btnMoist = document.getElementById('btnWeatherMoist');
  const pill = document.getElementById('weatherStatePill');
  const feedback = document.getElementById('sortFeedbackText');

  if (mode === 'dry') {
    scene.classList.remove('mode-moist');
    scene.classList.add('mode-dry');
    btnDry.classList.add('active');
    btnMoist.classList.remove('active');
    pill.textContent = '☀️ მიწა მშრალი და ფხვიერია — დააწკაპუნე გამოჩენილ ბინადრებს!';
    feedback.innerHTML =
      '☀️ ჩართულია <strong>მზიანი ამინდი</strong>! ნახე, ვინ გამოვიდა მშრალ და ფხვიერ მიწაზე — დააწკაპუნე მათ!';
  } else {
    scene.classList.remove('mode-dry');
    scene.classList.add('mode-moist');
    btnMoist.classList.add('active');
    btnDry.classList.remove('active');
    pill.textContent = '🌧️ გარემო გრილი და ნესტიანია — დააწკაპუნე გამოჩენილ ბინადრებს!';
    feedback.innerHTML =
      '🌧️ ჩართულია <strong>წვიმიანი ამინდი</strong>! წვიმის ჭიები, ლოკოკინა, თაგვი და ზღარბი გამოჩნდნენ — დააწკაპუნე მათ!';
  }
}

function observeSimCreature(btnEl, creatureId) {
  const info = simCreaturesInfo[creatureId];
  if (!info) return;

  const checkEl = btnEl.querySelector('.sim-c-check');
  const feedback = document.getElementById('sortFeedbackText');
  feedback.innerHTML = info.msg;

  if (!observedSimCreatures.has(creatureId)) {
    observedSimCreatures.add(creatureId);
    btnEl.classList.add('observed');
    if (checkEl) checkEl.textContent = '✅';
    playTone('success');
    addStars(1);
    document.getElementById('sortedCount').textContent = observedSimCreatures.size;

    if (observedSimCreatures.size === 7) {
      markStageCompleted(4);
      playTone('fanfare');
      feedback.innerHTML =
        '🎉 <strong>ყოჩაღ!</strong> შენ ორივე ამინდი გამოცადე და შვიდივე ბინადარს დააკვირდი მშრალ და ნესტიან გარემოში!';
    }
  } else {
    playTone('click');
  }
}

// ==================== STAGE 5: QUIZ ====================
const quizQuestions = [
  {
    q: '1. საიდან არიან ეკო და ბითი?',
    options: [
      'ფუსფუსა სახელოსნოდან',
      'კოსმოსიდან',
      'ზღვიდან'
    ],
    correct: 0,
    explanation: 'სწორია! ეკო და ბითი ფუსფუსა სახელოსნოდან არიან.'
  },
  {
    q: '2. რომელი ბინადარი ამოძვრა მიწიდან მინდორში?',
    options: [
      'კურდღელი',
      'ჭიაყელა',
      'ციყვი'
    ],
    correct: 1,
    explanation: 'ყოჩაღ! მიწიდან ჭიაყელა ამოძვრა.'
  },
  {
    q: '3. რას შეადარა ეკომ მიწისქვეშა სამყარო?',
    options: [
      'ნამდვილ ქალაქს',
      'უღრან ტყეს',
      'მაღალ მთას'
    ],
    correct: 0,
    explanation: 'ზუსტია! ეკომ თქვა: „ვაა, აქ ნამდვილი ქალაქია!“'
  },
  {
    q: '4. ვინ ცხოვრობს ნიადაგში?',
    options: [
      'მხოლოდ ფრინველები',
      'მწერები, ქვეწარმავლები და ცხოველები',
      'მხოლოდ თევზები'
    ],
    correct: 1,
    explanation: 'ყოჩაღ! ნიადაგში მწერები, ქვეწარმავლები და ცხოველები ცხოვრობენ.'
  },
  {
    q: '5. როგორი მიწა მოსწონთ ხოჭოებს?',
    options: [
      'მშრალი და ფხვიერი',
      'ჭაობიანი',
      'ყინულიანი'
    ],
    correct: 0,
    explanation: 'სწორია! ხოჭოებს მშრალი და ფხვიერი მიწა მოსწონთ.'
  },
  {
    q: '6. ვის ურჩევნია გრილი და ნესტიანი გარემო?',
    options: [
      'წვიმის ჭიებს, ლოკოკინებს, თაგვებსა და ზღარბებს',
      'მხოლოდ ხოჭოებს',
      'არცერთს'
    ],
    correct: 0,
    explanation: 'ბრავო! მათ გრილი და ნესტიანი გარემო ურჩევნიათ!'
  }
];

let currentQuizIdx = 0;

function renderQuizQuestion() {
  const quizContainer = document.getElementById('quizContainer');
  const certCard = document.getElementById('certificateCard');

  if (currentQuizIdx >= quizQuestions.length) {
    quizContainer.style.display = 'none';
    certCard.classList.add('visible');
    document.getElementById('finalStarScore').textContent = stars;
    markStageCompleted(5);
    playTone('fanfare');
    return;
  }

  quizContainer.style.display = 'block';
  certCard.classList.remove('visible');

  const item = quizQuestions[currentQuizIdx];
  document.getElementById('quizProgressText').textContent =
    `შეკითხვა ${currentQuizIdx + 1} / ${quizQuestions.length}`;
  document.getElementById('quizQuestionTitle').textContent = item.q;

  const optsBox = document.getElementById('quizOptionsBox');
  optsBox.innerHTML = '';

  item.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.textContent = optText;
    btn.onclick = () => checkQuizAnswer(btn, idx, item);
    optsBox.appendChild(btn);
  });
}

function checkQuizAnswer(btnEl, chosenIdx, item) {
  if (chosenIdx === item.correct) {
    playTone('success');
    btnEl.classList.add('correct');
    addStars(2);
    document.getElementById('quizHelperText').innerHTML = `🌟 ${item.explanation}`;

    document.querySelectorAll('.quiz-opt-btn').forEach((b) => (b.disabled = true));
    setTimeout(() => {
      currentQuizIdx++;
      renderQuizQuestion();
    }, 1100);
  } else {
    playTone('error');
    btnEl.classList.add('wrong');
    btnEl.disabled = true;
    document.getElementById('quizHelperText').innerHTML =
      '🤔 სცადე კიდევ ერთხელ! გაიხსენე რა გვითხრეს ეკომ და ბითიმ ვიდეოში.';
  }
}

function restartAdventure() {
  currentQuizIdx = 0;
  renderQuizQuestion();
  goToStage(1);
}

// ==================== INIT DECORATIONS & APP ====================
function initDecorParticles() {
  const container = document.getElementById('bgDecor');
  if (!container) return;
  for (let i = 0; i < 16; i++) {
    const dot = document.createElement('div');
    dot.className = 'glow-dot';
    const size = 14 + Math.random() * 28;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${Math.random() * 96}%`;
    dot.style.top = `${35 + Math.random() * 60}%`;
    dot.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(dot);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initDecorParticles();
  renderQuizQuestion();
});
