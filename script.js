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
  stars = Math.min(5, stars + amount);
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

let completedStagesSet = new Set();

function markStageCompleted(stageNum) {
  const btn = document.querySelector(`.stage-btn[data-stage="${stageNum}"]`);
  if (btn) btn.classList.add('completed');
  if (!completedStagesSet.has(stageNum)) {
    completedStagesSet.add(stageNum);
    addStars(1);
  }
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
    title: '🔍 ლუპა',
    msg: 'შესანიშნავია! ლუპით პატარა ჭიანჭველასა და ხოჭოს მატლს ახლოდან დავაკვირდებით ისე, რომ ხელით არ შევეხოთ!'
  },
  telescope: {
    correct: false,
    title: '🔭 ტელესკოპი',
    msg: 'ჰაჰა! ტელესკოპი ცაში ვარსკვლავებისა და პლანეტების საყურებლადაა — ნიადაგის კვლევაში ის არ გამოგვადგება!'
  },
  shovel: {
    correct: true,
    title: 'პატარა ნიჩაბი',
    msg: 'სწორია! პატარა ნიჩბით მიწასა და ფოთლებს ფრთხილად გადავწევთ ისე, რომ ბინადრებს სახლები არ დავუზიანოთ.'
  },
  camera: {
    correct: true,
    title: '📷 ფოტოაპარატი',
    msg: 'ბითი: „შესანიშნავია! ფოტოაპარატით ბინადრებს შორიდან გადავუღებთ სურათებს ისე, რომ არ შევაწუხოთ და არ დავაფრთხოთ!“'
  },
  diary: {
    correct: true,
    title: '📓 საველე დღიური',
    msg: 'ეკო: „ძალიან კარგია! საველე დღიურში ჩავინიშნავთ, რომელი ბინადარი სად ცხოვრობს და როგორი გარემო უხდება!“'
  },
  fins: {
    correct: false,
    title: '🤿 საცურაო აღჭურვილობა',
    msg: 'არასწორია! საცურაო აღჭურვილობა წყალში საცურაოდაა, ჩვენ კი ნიადაგის გამოსაკვლევად მივდივართ!'
  },
  ruler: {
    correct: true,
    title: '📏 სახაზავი',
    msg: 'ყოჩაღ! სახაზავით ნაკვალევისა და პატარა ბინადრების ზომას გავზომავთ და საველე დღიურში ჩავინიშნავთ!'
  },
  horn: {
    correct: false,
    title: '📢 ხმამაღალი საყვირი',
    msg: 'არა! ბუნებაში ხმაური არ შეიძლება — საყვირი ნიადაგის ბინადრებს შეაშინებს და დააფრთხობს!'
  },
  gloves: {
    correct: true,
    title: '🧤 დამცავი ხელთათმანი',
    msg: 'ზუსტია! ხელთათმანი ხელებს მიწისა და ეკლიანი მცენარეებისგან იცავს — თუმცა ბინადრებს მაინც ფრთხილად ვეპყრობით!'
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
    text: 'ეკო: „ეს ჭიაყელაა! ის ნიადაგში გვირაბებს თხრის, მიწას აფხვიერებს და ფესვებამდე ჰაერსა და წყალს ატარებს — ასე მცენარეებს ზრდაში ეხმარება.“'
  },
  {
    emoji: '🐌',
    title: 'ლოკოკინა',
    text: 'ბითი: „ლოკოკინას ზურგზე დამცავი ნიჟარა აკიდია. ის ნესტიან ფოთლებზე ცოცავს და მცენარეებითა და ჩამოცვენილი ფოთლებით იკვებება.“'
  },
  {
    emoji: '🐜',
    title: 'ჭიანჭველა',
    text: 'ეკო: „ჭიანჭველები ფხვიერ ნიადაგში გვირაბებსა და საწყობებს თხრიან, მიწას აფხვიერებენ და ტყესა თუ მინდორს ნარჩენებისგან ასუფთავებენ.“'
  },
  {
    emoji: '🐛',
    title: 'ხოჭოს მატლი',
    text: 'ბითი: „ეს ხოჭოს მატლია! ის მიწის ქვეშ, ფესვებთან და დამპალ მცენარეულ ნარჩენებში იზრდება, სანამ ზრდასრულ ხოჭოდ გადაიქცევა.“'
  },
  {
    emoji: '🐾',
    iconHtml: '<img src="თხუნელა.png" alt="თხუნელა" class="worm-discovery-icon" />',
    title: 'თხუნელა',
    text: 'ეკო: „თხუნელა მიწისქვეშა ძუძუმწოვარია! ნიჩბებივით ძლიერი წინა თათებით ღრმა სოროებს თხრის და მიწის მავნებელი მწერებით იკვებება.“'
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
    text: 'ბითი: „მრავალფეხას უამრავი პატარა ფეხი აქვს. ის ტენიანი ფოთლებისა და ქვების ქვეშ ცხოვრობს და ჩამოცვენილი ფოთლების ნიადაგად ქცევაში ეხმარება.“'
  },
  {
    emoji: '🐞',
    iconHtml: '<img src="ხოჭო.png" alt="მინდვრის ხოჭო" class="worm-discovery-icon" />',
    title: 'მინდვრის ხოჭო',
    text: 'ეკო: „მინდვრის ხოჭოს მკვრივი ჯავშანი გამოშრობისგან იცავს. ის მიწის ზედაპირზე სწრაფად დარბის და მცენარის მავნებლებს ანადგურებს.“'
  },
  {
    emoji: '🦎',
    title: 'ხვლიკი',
    text: 'ბითი: „ხვლიკი ქვეწარმავალია! მზიან ამინდში თბილ მიწაზე და ქვებზე თბება, საფრთხისას კი ბალახსა და მიწის ნაპრალებში იმალება.“'
  },
  {
    emoji: '🐭',
    title: 'მინდვრის თაგვი',
    text: 'ეკო: „მინდვრის თაგვი მიწის ქვეშ გრილ სოროს თხრის, შიგნით რბილ ბალახს აფენს და ზამთრისთვის მარცვლებსა და თესლებს აგროვებს.“'
  },
  {
    emoji: '🦔',
    title: 'ზღარბი',
    text: 'ბითი: „ზღარბი ბუჩქების ძირას და ჩამოცვენილ ფოთლებში იწყობს ბუდეს, ხოლო საღამოობით ნიადაგზე მწერებს, ჭიებსა და ლოკოკინებს ეძებს.“'
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
  } else if (index === 6) {
    smallIconHtml = '<img src="ხოჭო.png" alt="მინდვრის ხოჭო" class="worm-inline-icon" />';
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

// ==================== STAGE 3: UNDERGROUND CITY PLACEMENT ====================
let selectedCityAnimal = null;
let placedCityAnimals = new Set();

const cityAnimalInfo = {
  snail: {
    zones: ['surface'],
    name: 'ლოკოკინა',
    visualHtml: '🐌',
    note: '🍂 <strong>ლოკოკინა (ზედაპირი და ფოთლები):</strong> მიწას ვერ თხრის — სველ ფოთლებსა და ხავსზე ცოცავს და მცენარეებით იკვებება.',
    wrongMsg: '🤔 <strong>ლოკოკინას</strong> ნიჟარით მიწის თხრა არ შეუძლია — ის ზედაპირზე, ფოთლების საფარში დააბრუნე!'
  },
  hedgehog: {
    zones: ['surface'],
    name: 'ზღარბი',
    visualHtml: '🦔',
    note: '🍂 <strong>ზღარბი (ზედაპირი და ფოთლები):</strong> ბუჩქების ძირას და ჩამოცვენილ ფოთლებში იწყობს ბუდეს, ზედაპირზე კი მწერებსა და ჭიებს ეძებს.',
    wrongMsg: '🤔 <strong>ზღარბი</strong> ღრმა გვირაბებს არ თხრის — ის ფოთლების საფარში და ბუჩქების ძირას ბინადრობს!'
  },
  beetle: {
    zones: ['surface'],
    name: 'მინდვრის ხოჭო',
    visualHtml: '<img src="ხოჭო.png" alt="მინდვრის ხოჭო" class="worm-token-img" />',
    note: '🍂 <strong>მინდვრის ხოჭო (ზედაპირი და ფოთლები):</strong> მიწის ზედაპირზე და ჩამოცვენილ ფოთლებში სწრაფად დარბის და მავნებელ მწერებზე ნადირობს.',
    wrongMsg: '🤔 <strong>მინდვრის ხოჭო</strong> მიწის ზედაპირზე და ფოთლებს შორის ცხოვრობს — სცადე პირველი ფენა!'
  },
  lizard: {
    zones: ['surface'],
    name: 'ხვლიკი',
    visualHtml: '🦎',
    note: '🍂 <strong>ხვლიკი (ზედაპირი და ფოთლები):</strong> ქვეწარმავალია — მზიან ზედაპირზე თბება, საფრთხისას კი ბალახსა და ფოთლებში იმალება.',
    wrongMsg: '🤔 <strong>ხვლიკი</strong> ღრმა მიწისქვეშა სოროს არ თხრის — ის ზედაპირზე, ფოთლებსა და მზიან ქვებთან ბინადრობს!'
  },
  ants: {
    zones: ['roots'],
    name: 'ჭიანჭველა',
    visualHtml: '🐜',
    note: '🌱 <strong>ჭიანჭველა (რბილი ნიადაგი და ფესვები):</strong> ფხვიერ ნიადაგში, მცენარის ფესვებს შორის აშენებს დერეფნებსა და კვერცხების საცავებს.',
    wrongMsg: '🤔 <strong>ჭიანჭველები</strong> ბუდეს რბილ ნიადაგსა და ფესვების ქსელში აშენებენ — სცადე შუა ფენა!'
  },
  worm: {
    zones: ['roots'],
    name: 'ჭიაყელა',
    visualHtml: '<img src="ჭიაყელა.jpg" alt="ჭიაყელა" class="worm-token-img" />',
    note: '🌱 <strong>ჭიაყელა (რბილი ნიადაგი და ფესვები):</strong> რბილი, მოქნილი სხეულით ფესვებთან თხრის გვირაბებს და მიწას აფხვიერებს.',
    wrongMsg: '🤔 <strong>ჭიაყელა</strong> ფესვებთან, რბილ ნიადაგში ცხოვრობს, სადაც მიწას აფხვიერებს — სცადე შუა ფენა!'
  },
  larva: {
    zones: ['roots'],
    name: 'ხოჭოს მატლი',
    visualHtml: '🐛',
    note: '🌱 <strong>ხოჭოს მატლი (რბილი ნიადაგი და ფესვები):</strong> მიწის ქვეშ, ფესვებთან იმალება და იზრდება, სანამ ზრდასრულ ხოჭოდ იქცევა.',
    wrongMsg: '🤔 <strong>ხოჭოს მატლი</strong> მცენარის ფესვებთან, რბილ ნიადაგში იზრდება — სცადე შუა ფენა!'
  },
  millipede: {
    zones: ['roots', 'surface'],
    name: 'მრავალფეხა',
    visualHtml: `<svg viewBox="0 0 64 40" width="32" height="22" aria-hidden="true">
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
    note: '🌱 <strong>მრავალფეხა (ფოთლები და ზედა რბილი ნიადაგი):</strong> ჩამოცვენილი ფოთლების ქვეშ და ფესვების ზედა ფენაში ცხოვრობს და მცენარეულ ნარჩენებს ამუშავებს.',
    wrongMsg: '🤔 <strong>მრავალფეხა</strong> ღრმა სოროში არ ცხოვრობს — ის ფოთლების ქვეშ ან ზედა რბილ ნიადაგში მოათავსე!'
  },
  mouse: {
    zones: ['deep'],
    name: 'მინდვრის თაგვი',
    visualHtml: '🐭',
    note: '🕳️ <strong>მინდვრის თაგვი (ღრმა სორო):</strong> მტაცებლებისა და სიცივისგან დასაცავად ღრმა სოროს თხრის და ბალახით მოფენილ ბუდეს იწყობს.',
    wrongMsg: '🤔 <strong>მინდვრის თაგვი</strong> უსაფრთხო, ბალახით მოფენილ ღრმა მიწისქვეშა სოროში ცხოვრობს!'
  },
  mole: {
    zones: ['deep'],
    name: 'თხუნელა',
    visualHtml: '<img src="თხუნელა.png" alt="თხუნელა" class="worm-token-img" />',
    note: '🕳️ <strong>თხუნელა (ღრმა სორო):</strong> ნიჩბებივით ძლიერი წინა თათებით ღრმა გვირაბებს თხრის და თითქმის მთელ ცხოვრებას მიწის ქვეშ ატარებს.',
    wrongMsg: '🤔 <strong>თხუნელას</strong> ძლიერი მთხრელი თათები ღრმა მიწისქვეშა სოროსთვის აქვს — სცადე მესამე ფენა!'
  },
  badger: {
    zones: ['deep'],
    name: 'მაჩვი',
    visualHtml: '🦡',
    note: '🕳️ <strong>მაჩვი (ღრმა სორო):</strong> ძლიერი ბრჭყალებით მიწის ქვეშ ღრმა, მრავალოთახიან სოროს თხრის, სადაც ოჯახთან ერთად ცხოვრობს.',
    wrongMsg: '🤔 <strong>მაჩვი</strong> ცნობილი მიწისქვეშა მთხრელია — ის ღრმა მიწისქვეშა სოროში დააბინავე!'
  },
  fox: {
    zones: ['deep'],
    name: 'მელა',
    visualHtml: '🦊',
    note: '🕳️ <strong>მელა (ღრმა სორო):</strong> ხის ფესვების ქვეშ და ფერდობებზე ღრმა მიწისქვეშა სოროს იწყობს, სადაც ლეკვებს ზრდის და ამინდისგან აფარებს თავს.',
    wrongMsg: '🤔 <strong>მელა</strong> თავშესაფარს ღრმა მიწისქვეშა სოროში იწყობს — სცადე მესამე ფენა!'
  }
};

function selectCityAnimal(tokenEl, animalKey) {
  if (placedCityAnimals.has(animalKey)) return;
  playTone('click');
  selectedCityAnimal = animalKey;

  document.querySelectorAll('.animal-token').forEach((el) => el.classList.remove('selected'));
  tokenEl.classList.add('selected');

  const info = cityAnimalInfo[animalKey];
  const feedback = document.getElementById('cityFeedbackText');
  if (info && feedback) {
    feedback.innerHTML = `არჩეულია: <strong>${info.name}</strong> — ახლა მოათავსე მის სართულზე (ზედაპირი, ფესვების ფენა ან ღრმა სორო)!`;
  }
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
  const feedback = document.getElementById('cityFeedbackText');
  const noteCard = document.getElementById('cityNoteCard');

  if (!selectedCityAnimal) {
    playTone('error');
    if (feedback) {
      feedback.innerHTML = '👆 ჯერ ზედა ზოლიდან აირჩიე ბინადარი, შემდეგ კი დააწკაპუნე მის სართულს!';
    }
    return;
  }

  const animalKey = selectedCityAnimal;
  if (placedCityAnimals.has(animalKey)) return;

  const info = cityAnimalInfo[animalKey];
  if (info && info.zones.includes(zoneKey)) {
    playTone('success');
    placedCityAnimals.add(animalKey);

    const badgesBox = document.getElementById(`zoneBadges-${zoneKey}`);
    if (badgesBox) {
      const pill = document.createElement('div');
      pill.className = 'placed-animal-pill';
      pill.style.cursor = 'pointer';
      pill.setAttribute('data-tooltip', info.name);
      pill.setAttribute('aria-label', info.name);
      pill.innerHTML = info.visualHtml;
      pill.onclick = (ev) => {
        ev.stopPropagation();
        playTone('click');
        if (feedback) feedback.innerHTML = info.note;
      };
      badgesBox.appendChild(pill);
    }

    const tokenEl = document.querySelector(`.animal-token[data-animal="${animalKey}"]`);
    if (tokenEl) {
      tokenEl.classList.remove('selected');
      tokenEl.classList.add('placed');
    }

    selectedCityAnimal = null;
    document.getElementById('cityPlacedCount').textContent = placedCityAnimals.size;

    if (noteCard) {
      noteCard.classList.remove('note-error');
      noteCard.classList.add('note-success');
    }
    if (feedback) feedback.innerHTML = info.note;

    const totalCityAnimals = Object.keys(cityAnimalInfo).length;
    if (placedCityAnimals.size === totalCityAnimals) {
      markStageCompleted(3);
      playTone('fanfare');
      if (feedback) {
        feedback.innerHTML = `${info.note} 🎉 <strong>ყოჩაღ! თორმეტივე ბინადარი თავის სართულზე დააბინავე!</strong>`;
      }
    }
  } else {
    playTone('error');
    zoneEl.classList.remove('wrong-shake');
    void zoneEl.offsetWidth;
    zoneEl.classList.add('wrong-shake');
    if (noteCard) {
      noteCard.classList.remove('note-success');
      noteCard.classList.add('note-error');
    }
    if (info && feedback) feedback.innerHTML = info.wrongMsg;
  }
}

// ==================== STAGE 4: HABITAT SORTING ("RETURN HOME") ====================
const simCreaturesInfo = {
  lizard_dry: {
    zone: 'dry',
    name: 'ხვლიკი',
    iconHtml: '🦎',
    note: '☀️ <strong>ხვლიკი:</strong> ქვეწარმავალია — სხეულის გასათბობად მზის სითბო სჭირდება, ამიტომ მზიან, მშრალ მიწასა და თბილ ქვებს ირჩევს.',
    wrongMsg: '🤔 <strong>ხვლიკს</strong> გასათბობად მზე და მშრალი ზედაპირი სჭირდება — ის მშრალ და ფხვიერ ნიადაგზე დააბრუნე!'
  },
  field_beetle: {
    zone: 'dry',
    name: 'მინდვრის ხოჭო',
    iconHtml: '<img src="ხოჭო.png" alt="მინდვრის ხოჭო" class="worm-photo-icon" />',
    note: '☀️ <strong>მინდვრის ხოჭო:</strong> მკვრივი ჯავშანი გამოშრობისგან იცავს, ამიტომ მზიან, მშრალ და ფხვიერ მიწაზე სწრაფად მოძრაობს და ნადირობს.',
    wrongMsg: '🤔 <strong>მინდვრის ხოჭოს</strong> მშრალი და ფხვიერი ზედაპირი ურჩევნია — სცადე მშრალი და ფხვიერი ნიადაგი!'
  },
  ants_dry: {
    zone: 'dry',
    name: 'ჭიანჭველა',
    iconHtml: '🐜',
    note: '☀️ <strong>ჭიანჭველა:</strong> მშრალ და ფხვიერ მიწაში იოლად თხრის გვირაბებს, რომ წვიმამ ბუდე არ დაუტბოროს, ზედაპირზე კი საკვებს აგროვებს.',
    wrongMsg: '🤔 <strong>ჭიანჭველებს</strong> სისველე გვირაბებს უტბორავს — მათ მშრალი და ფხვიერი ნიადაგი სჭირდებათ!'
  },
  cricket_dry: {
    zone: 'dry',
    name: 'მინდვრის ჭრიჭინა',
    iconHtml: '🦗',
    note: '☀️ <strong>მინდვრის ჭრიჭინა:</strong> მზიან მინდორში, მშრალ და ფხვიერ მიწაში თხრის პატარა სოროს და თბილ ამინდში ხმამაღლა ჭრიჭინებს.',
    wrongMsg: '🤔 <strong>მინდვრის ჭრიჭინა</strong> მზიან, მშრალ და ფხვიერ მიწაში იწყობს სოროს — სცადე მშრალი ზონა!'
  },
  tortoise_dry: {
    zone: 'dry',
    name: 'ხმელეთის კუ',
    iconHtml: '🐢',
    note: '☀️ <strong>ხმელეთის კუ:</strong> მზიანი, მშრალი მიწის ქვეწარმავალია — მზეზე თბება, კვერცხების დასადებად და გამოსაზამთრებლად კი ფხვიერ მიწას თხრის.',
    wrongMsg: '🤔 <strong>ხმელეთის კუს</strong> მზე და მშრალი, ფხვიერი მიწა სჭირდება — ის მშრალ ნიადაგზე დააბრუნე!'
  },
  worm_moist: {
    zone: 'moist',
    name: 'წვიმის ჭია',
    iconHtml: '<img src="ჭიაყელა.jpg" alt="წვიმის ჭია" class="worm-photo-icon" />',
    note: '🌧️ <strong>წვიმის ჭია (ჭიაყელა):</strong> კანით სუნთქავს, ამიტომ კანი სულ ტენიანი უნდა ჰქონდეს — სიცხეში ღრმა, გრილ და ნესტიან მიწაში ჩადის.',
    wrongMsg: '🤔 <strong>წვიმის ჭიას</strong> მშრალ მიწაში კანი გამოუშრება და ვერ ისუნთქებს — გრილ და ნესტიან გარემოში გადაიყვანე!'
  },
  snail_moist: {
    zone: 'moist',
    name: 'ლოკოკინა',
    iconHtml: '🐌',
    note: '🌧️ <strong>ლოკოკინა:</strong> სრიალისა და გამოშრობისგან დასაცავად ტენი სჭირდება. სიცხეში ნიჟარაში იმალება, წვიმის შემდეგ კი სველ ფოთლებზე გამოდის.',
    wrongMsg: '🤔 <strong>ლოკოკინას</strong> მშრალ მიწაზე სრიალი უჭირს — მას გრილი და ნესტიანი გარემო უხდება!'
  },
  millipede_moist: {
    zone: 'moist',
    name: 'მრავალფეხა',
    iconHtml: `<svg viewBox="0 0 64 40" width="34" height="24" aria-hidden="true">
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
    note: '🌧️ <strong>მრავალფეხა:</strong> სიმშრალეში სწრაფად კარგავს ტენს, ამიტომ გრილ და ნესტიან მიწაში, სველი ფოთლებისა და ქვების ქვეშ იმალება.',
    wrongMsg: '🤔 <strong>მრავალფეხას</strong> მშრალი მიწა არ უხდება — ის გრილ და ნესტიან ნიადაგში დააბრუნე!'
  },
  hedgehog_moist: {
    zone: 'moist',
    name: 'ზღარბი',
    iconHtml: '🦔',
    note: '🌧️ <strong>ზღარბი:</strong> გრილ, ჩრდილიან და ტენიან ტყისპირა ადგილებს ირჩევს, სადაც სველ მიწაზე ჭიებსა და ლოკოკინებს პოულობს საკვებად.',
    wrongMsg: '🤔 <strong>ზღარბს</strong> გრილი, ჩრდილიანი და ტენიანი გარემო ურჩევნია, სადაც ბევრი საკვებია!'
  },
  mouse_moist: {
    zone: 'moist',
    name: 'მინდვრის თაგვი',
    iconHtml: '🐭',
    note: '🌧️ <strong>მინდვრის თაგვი:</strong> გრილ, მწვანე და ზომიერად ტენიან მინდვრებში ცხოვრობს, სადაც ბევრი მარცვალია, სიცხისას კი მიწისქვეშა გრილ, ბალახით მოფენილ სოროში აფარებს თავს.',
    wrongMsg: '🤔 <strong>მინდვრის თაგვი</strong> გრილ, მწვანე და ზომიერად ტენიან გარემოს ირჩევს თავისი ბალახოვანი სოროსთვის!'
  }
};

let selectedHabitatCreature = null;
let observedSimCreatures = new Set();

function selectHabitatCreature(tokenEl, creatureId) {
  if (observedSimCreatures.has(creatureId)) return;
  playTone('click');
  selectedHabitatCreature = creatureId;

  document.querySelectorAll('.habitat-token').forEach((el) => el.classList.remove('selected'));
  tokenEl.classList.add('selected');

  const info = simCreaturesInfo[creatureId];
  const feedback = document.getElementById('sortFeedbackText');
  if (info && feedback) {
    feedback.innerHTML = `არჩეულია: <strong>${info.name}</strong> — ახლა დააწკაპუნე შესაბამის გარემოს (<strong>☀️ მშრალი და ფხვიერი</strong> ან <strong>🌧️ გრილი და ნესტიანი</strong>)!`;
  }
}

function dragHabitatCreature(e, creatureId) {
  if (observedSimCreatures.has(creatureId)) {
    e.preventDefault();
    return;
  }
  selectedHabitatCreature = creatureId;
  e.dataTransfer.setData('text/plain', creatureId);
  document.querySelectorAll('.habitat-token').forEach((el) => {
    el.classList.toggle('selected', el.getAttribute('data-cid') === creatureId);
  });
}

function allowHabitatDrop(e, zoneEl) {
  e.preventDefault();
  zoneEl.classList.add('drag-over');
}

function leaveHabitatDrop(zoneEl) {
  zoneEl.classList.remove('drag-over');
}

function dropOnHabitatZone(e, zoneEl, zoneKey) {
  e.preventDefault();
  zoneEl.classList.remove('drag-over');
  const draggedId = e.dataTransfer.getData('text/plain') || selectedHabitatCreature;
  if (draggedId) {
    selectedHabitatCreature = draggedId;
    placeInHabitatZone(zoneEl, zoneKey);
  }
}

function placeInHabitatZone(zoneEl, zoneKey) {
  const feedback = document.getElementById('sortFeedbackText');
  const noteCard = document.getElementById('explorerNoteCard');

  if (!selectedHabitatCreature) {
    playTone('error');
    if (feedback) {
      feedback.innerHTML = '👆 ჯერ ზედა ზოლიდან აირჩიე ბინადარი, შემდეგ კი დააწკაპუნე მშრალ ან ნესტიან ნიადაგს!';
    }
    return;
  }

  const creatureId = selectedHabitatCreature;
  if (observedSimCreatures.has(creatureId)) return;

  const info = simCreaturesInfo[creatureId];
  if (!info) return;

  if (info.zone === zoneKey) {
    playTone('success');
    observedSimCreatures.add(creatureId);

    const listEl = document.getElementById(`habitatPlaced-${zoneKey}`);
    if (listEl) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'habitat-placed-chip';
      chip.setAttribute('data-tooltip', info.name);
      chip.setAttribute('aria-label', info.name);
      chip.innerHTML = `<span class="hpc-icon">${info.iconHtml}</span>`;
      chip.onclick = (ev) => {
        ev.stopPropagation();
        playTone('click');
        feedback.innerHTML = info.note;
      };
      listEl.appendChild(chip);
    }

    const tokenEl = document.querySelector(`.habitat-token[data-cid="${creatureId}"]`);
    if (tokenEl) {
      tokenEl.classList.remove('selected');
      tokenEl.classList.add('placed');
    }

    selectedHabitatCreature = null;
    document.getElementById('sortedCount').textContent = observedSimCreatures.size;

    if (noteCard) {
      noteCard.classList.remove('note-error');
      noteCard.classList.add('note-success');
    }
    feedback.innerHTML = info.note;

    const totalHabitatCreatures = Object.keys(simCreaturesInfo).length;
    if (observedSimCreatures.size === totalHabitatCreatures) {
      markStageCompleted(4);
      playTone('fanfare');
      feedback.innerHTML = `${info.note} <br/>🎉 <strong>ათივე ბინადარი თავის სახლშია!</strong> დააწკაპუნე ნებისმიერ ბინადარს ჩანაწერის ხელახლა წასაკითხად.`;
    }
  } else {
    playTone('error');
    zoneEl.classList.remove('wrong-shake');
    void zoneEl.offsetWidth;
    zoneEl.classList.add('wrong-shake');
    if (noteCard) {
      noteCard.classList.remove('note-success');
      noteCard.classList.add('note-error');
    }
    feedback.innerHTML = info.wrongMsg;
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
let answeredQuizSet = new Set();

function renderQuizQuestion() {
  const quizContainer = document.getElementById('quizContainer');
  const certCard = document.getElementById('certificateCard');
  const mascotsBanner = document.getElementById('quizMascotsBanner');

  if (currentQuizIdx >= quizQuestions.length) {
    quizContainer.style.display = 'none';
    if (mascotsBanner) mascotsBanner.style.display = 'none';
    certCard.classList.add('visible');
    markStageCompleted(5);
    document.getElementById('finalStarScore').textContent = `${stars} / 5`;
    const dateEl = document.getElementById('certDateText');
    if (dateEl && !dateEl.textContent) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('ka-GE');
    }
    playTone('fanfare');
    return;
  }

  quizContainer.style.display = 'block';
  if (mascotsBanner) mascotsBanner.style.display = 'flex';
  certCard.classList.remove('visible');

  const item = quizQuestions[currentQuizIdx];
  document.getElementById('quizProgressText').textContent =
    `შეკითხვა ${currentQuizIdx + 1} / ${quizQuestions.length}`;
  document.getElementById('quizQuestionTitle').textContent = item.q;

  const optsBox = document.getElementById('quizOptionsBox');
  optsBox.innerHTML = '';
  const letters = ['ა', 'ბ', 'გ', 'დ'];

  item.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.innerHTML = `<span class="quiz-opt-letter">${letters[idx] || idx + 1}</span><span class="quiz-opt-text">${optText}</span>`;
    btn.onclick = () => checkQuizAnswer(btn, idx, item);
    optsBox.appendChild(btn);
  });
}

function checkQuizAnswer(btnEl, chosenIdx, item) {
  if (chosenIdx === item.correct) {
    playTone('success');
    btnEl.classList.add('correct');
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

function loadCertImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function downloadCertificateImage() {
  playTone('click');
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1130;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, '#fffef2');
  bgGrad.addColorStop(1, '#e8f5e9');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer solid green border
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 14;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  // Inner dashed border
  ctx.strokeStyle = '#66bb6a';
  ctx.lineWidth = 4;
  ctx.setLineDash([16, 10]);
  ctx.strokeRect(64, 64, canvas.width - 128, canvas.height - 128);
  ctx.setLineDash([]);

  // Load images
  const [ecoImg, bitiImg, logoImg] = await Promise.all([
    loadCertImage('დედამიწა.png'),
    loadCertImage('ტექნოლოგია.png'),
    loadCertImage('logo.png')
  ]);

  // Draw logo in center top
  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 165, 58, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImg, canvas.width / 2 - 58, 107, 116, 116);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, 165, 58, 0, Math.PI * 2);
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Draw Eco & Biti on left and right
  if (ecoImg) {
    ctx.drawImage(ecoImg, 130, 120, 170, 200);
  }
  if (bitiImg) {
    ctx.drawImage(bitiImg, canvas.width - 300, 120, 170, 200);
  }

  // Title: სერთიფიკატი
  ctx.fillStyle = '#1b5e20';
  ctx.font = '900 64px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('სერთიფიკატი', canvas.width / 2, 300);

  // Orange Badge: 🏆 „ნიადაგის ბინადრების მკვლევარები“
  const badgeW = 760;
  const badgeH = 68;
  const badgeX = (canvas.width - badgeW) / 2;
  const badgeY = 335;
  ctx.fillStyle = '#fb8c00';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 34);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.fillText('🏆 „ნიადაგის ბინადრების მკვლევარები“', canvas.width / 2, badgeY + 45);

  // Recipient label
  ctx.fillStyle = '#37474f';
  ctx.font = '700 26px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.fillText('გადაეცემა ნორჩ მკვლევარს:', canvas.width / 2, 485);

  // Recipient Name or Blank Line for printing
  const nameInput = document.getElementById('certStudentName');
  const studentName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : '';

  if (studentName) {
    ctx.fillStyle = '#1b5e20';
    ctx.font = '900 48px "Noto Sans Georgian", "Segoe UI", sans-serif';
    ctx.fillText(studentName, canvas.width / 2, 565);
  }

  // Underline for name
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(350, 585);
  ctx.lineTo(canvas.width - 350, 585);
  ctx.stroke();

  // Body paragraph
  ctx.fillStyle = '#263238';
  ctx.font = '600 28px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.fillText(
    'ეკოსა და ბითისთან ერთად „მიწისქვეშა ქალაქის“ წარმატებით გამოკვლევისთვის,',
    canvas.width / 2,
    680
  );
  ctx.fillText(
    'ნიადაგის ბინადრების გაცნობისა და მათი საცხოვრებელი გარემოს შესწავლისთვის!',
    canvas.width / 2,
    725
  );

  // Footer divider
  ctx.strokeStyle = '#a5d6a7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 860);
  ctx.lineTo(canvas.width - 140, 860);
  ctx.stroke();

  // Left signature
  ctx.fillStyle = '#1b5e20';
  ctx.font = '800 28px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.fillText('ეკო და ბითი', 310, 930);
  ctx.fillStyle = '#546e7a';
  ctx.font = '600 22px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.fillText('ფუსფუსა სახელოსნოს მეგზურები', 310, 965);

  // Center stars pill
  const starW = 460;
  const starH = 64;
  const starX = (canvas.width - starW) / 2;
  const starY = 905;
  ctx.fillStyle = '#fff8e1';
  ctx.strokeStyle = '#ffb300';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(starX, starY, starW, starH, 32);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e65100';
  ctx.font = '900 28px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.fillText(`⭐ დაგროვებული ვარსკვლავები: ${stars || 5} / 5`, canvas.width / 2, starY + 42);

  // Right Date
  const dateStr = new Date().toLocaleDateString('ka-GE');
  ctx.fillStyle = '#1b5e20';
  ctx.font = '800 28px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.fillText(dateStr, canvas.width - 310, 930);
  ctx.fillStyle = '#546e7a';
  ctx.font = '600 22px "Noto Sans Georgian", "Segoe UI", sans-serif';
  ctx.fillText('გაცემის თარიღი', canvas.width - 310, 965);

  // Trigger download
  const link = document.createElement('a');
  link.download = 'სერთიფიკატი-ნიადაგის-ბინადრების-მკვლევარები.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function printCertificate() {
  playTone('click');
  window.print();
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
