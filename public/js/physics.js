/**
 * Physics Module
 * Step-by-step solver, Interactive Quizzes, and Formula Reference.
 */

const samplePhysicsProblems = {
  1: "Massasi 2 kg bo'lgan jism 20 m balandlikdan boshlang'ich tezliksiz erkin tushmoqda. Jismning yerga urilish paytidagi tezligi va kinetik energiyasini toping. (Havo qarshiligi hisobga olinmasin, g = 10 m/s²)",
  2: "Tezligi 72 km/soat bo'lgan avtomobil tormoz bergach, 4 soniyada to'xtadi. Avtomobilning tormozlanish tezlanishi va tormozlanish yo'lini aniqlang.",
  3: "Qarshiligi 20 Om bo'lgan o'tkazgich uchlariga 120 V kuchlanish berilgan. O'tkazgichdan o'tayotgan tok kuchi va 5 minutda ajralib chiqadigan issiqlik miqdorini toping."
};

const physicsQuizzes = [
  {
    id: 1,
    topic: "Kinematika",
    question: "Agar jism tekis tezlanuvchan harakat qilsa va boshlang'ich tezligi v₀ = 0 bo'lsa, bosib o'tilgan yo'l (S) va vaqt (t) orasidagi bog'lanish qanday?",
    options: [
      { text: "A) S to'g'ri proporsional t ga", correct: false },
      { text: "B) S to'g'ri proporsional t² ga (kvadratiga)", correct: true },
      { text: "C) S vaqtga bog'liq emas", correct: false },
      { text: "D) S teskari proporsional t ga", correct: false }
    ],
    explanation: "Tekis tezlanuvchan harakatda S = (a · t²) / 2 formulasi orqali yo'l vaqtning kvadratiga to'g'ri proporsional bo'ladi."
  },
  {
    id: 2,
    topic: "Dinamika",
    question: "Nyutonning ikkinchi qonuniga ko'ra jism olgan tezlanishi:",
    options: [
      { text: "A) Unga ta'sir etuvchi kuchga to'g'ri, massasiga teskari proporsional", correct: true },
      { text: "B) Kuchga teskari, massasiga to'g'ri proporsional", correct: false },
      { text: "C) Faqat jism tezligiga bog'liq", correct: false },
      { text: "D) Har doim o'zgarmas bo'ladi", correct: false }
    ],
    explanation: "a = F / m formulasi: Jismning tezlanishi unga ta'sir qiluvchi kuchga to'g'ri, massasiga esa teskari proporsionaldir."
  },
  {
    id: 3,
    topic: "Elektr",
    question: "O'tkazgichning qarshiligi uning uzunligini 2 marta oshirib, ko'ndalang kesim yuzasini 2 marta kamaytirganda qanday o'zgaradi?",
    options: [
      { text: "A) O'zgarmaydi", correct: false },
      { text: "B) 2 marta ortadi", correct: false },
      { text: "C) 4 marta ortadi", correct: true },
      { text: "D) 4 marta kamayadi", correct: false }
    ],
    explanation: "R = ρ · (l / S). Uzunlik (l) 2 marta ortsa, R 2 marta ortadi. Yuzasi (S) 2 marta kamaysa, R yana 2 marta ortadi. Jami: 2 × 2 = 4 marta ortadi."
  }
];

const physicsFormulas = [
  { category: "Kinematika", title: "Tekis harakat tezligi", tex: "v = s / t", desc: "Tezlik = bosib o'tilgan yo'l / vaqt" },
  { category: "Kinematika", title: "Tezlanish", tex: "a = (v - v₀) / t", desc: "Tezlik o'zgarishining vaqtga nisbati" },
  { category: "Kinematika", title: "Erkin tushish balandligi", tex: "h = (g · t²) / 2", desc: "Boshlang'ich tezliksiz tushish yo'li" },
  { category: "Dinamika", title: "Nyutonning 2-qonuni", tex: "F = m · a", desc: "Kuch = massa × tezlanish" },
  { category: "Dinamika", title: "Og'irlik kuchi", tex: "F = m · g", desc: "Gravitatsion tortishish kuchi" },
  { category: "Energiya", title: "Kinetik energiya", tex: "E_k = (m · v²) / 2", desc: "Harakatdagi jismning energiyasi" },
  { category: "Energiya", title: "Potensial energiya", tex: "E_p = m · g · h", desc: "Balandlikdagi jismning energiyasi" },
  { category: "Elektr", title: "Zanjir qismi uchun Om qonuni", tex: "I = U / R", desc: "Tok kuchi kuchlanishga to'g'ri, qarshilikka teskari" },
  { category: "Elektr", title: "Joul-Lens qonuni", tex: "Q = I² · R · t", desc: "O'tkazgichdan ajraluvchi issiqlik miqdori" }
];

let currentQuizIndex = 0;
let userQuizScore = 0;

function setPhysicsSample(id) {
  TelegramApp.haptic('selection');
  const textarea = document.getElementById('physics-input');
  if (samplePhysicsProblems[id]) {
    textarea.value = samplePhysicsProblems[id];
  }
}

async function solvePhysicsProblem() {
  TelegramApp.haptic('medium');
  const input = document.getElementById('physics-input').value.trim();
  const resultCard = document.getElementById('physics-result');
  const resultBody = document.getElementById('physics-result-body');
  const solveBtn = document.getElementById('btn-solve-physics');

  if (!input) {
    alert("Iltimos, masala matnini kiriting!");
    return;
  }

  // Loading state
  solveBtn.disabled = true;
  solveBtn.innerHTML = `<span class="spinner"></span> <span>Gemini AI hisoblamoqda...</span>`;

  try {
    const sysPrompt = `Sen Fizika bo'yicha xalqaro olimpiada ustozi va professorman. Berilgan fizika masalasini o'zbek tilida quyidagi aniq 4 ta qismga bo'lib qadamma-qadam yechib ber:
<h4>1. Berilgan kattaliklar (Given):</h4>
<div class="formula-box">kattaliklar</div>
<h4>2. Asosiy formulalar (Formulas):</h4>
<div class="formula-box">formulalar</div>
<h4>3. Qadamma-qadam hisoblash (Step-by-step):</h4>
<p>hisoblash jarayoni</p>
<h4>4. Xulosa va Fizik mohiyat:</h4>
<p>xulosa</p>
Faqat chiroyli HTML teglari (h4, div class="formula-box", p, b) dan foydalan, markdown backtick qo'shma.`;

    let solutionHtml = null;
    if (window.callGemini) {
      solutionHtml = await window.callGemini(input, sysPrompt);
    }

    if (!solutionHtml) {
      solutionHtml = generatePhysicsSolution(input);
    }

    resultBody.innerHTML = solutionHtml;
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    TelegramApp.haptic('success');
    addXP(15);
  } catch (err) {
    console.error('Solve error:', err);
    resultBody.innerHTML = generatePhysicsSolution(input);
    resultCard.classList.remove('hidden');
  } finally {
    solveBtn.disabled = false;
    solveBtn.innerHTML = `<span>AI bilan yechish</span> <span class="btn-icon">⚡</span>`;
  }
}

function generatePhysicsSolution(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes("erkin tush") || lower.includes("balandlik") || lower.includes("20 m")) {
    return `
      <h4>1. Berilgan kattaliklar (Given):</h4>
      <div class="formula-box">
        m = 2 kg<br>
        h = 20 m<br>
        v₀ = 0 m/s<br>
        g = 10 m/s²
      </div>

      <h4>2. Asosiy formulalar (Formulas):</h4>
      <p>Energiyaning saqlanish qonuniga ko'ra, eng yuqori nuqtadagi potensial energiya yerga yetish arafasidagi kinetik energiyaga to'liq aylanadi:</p>
      <div class="formula-box">
        E_p = m · g · h<br>
        E_k = (m · v²) / 2 = E_p<br>
        v = √(2 · g · h)
      </div>

      <h4>3. Qadamma-qadam hisoblash (Step-by-step):</h4>
      <p>1) Kinetik energiyani topamiz:<br>
         <b>E_k = E_p = m · g · h = 2 kg · 10 m/s² · 20 m = 400 J (Joul)</b>
      </p>
      <p>2) Yerga urilish tezligini hisoblaymiz:<br>
         <b>v = √(2 · 10 · 20) = √400 = 20 m/s</b>
      </p>

      <h4>4. Xulosa va Fizik mohiyat:</h4>
      <p>Havo qarshiligi hisobga olinmagani sababli mexanik energiya to'liq saqlanadi. Jism yerga <b>20 m/s (72 km/soat)</b> tezlikda va <b>400 J</b> kinetik energiya bilan uriladi.</p>
    `;
  } else if (lower.includes("tormoz") || lower.includes("avtomobil") || lower.includes("72")) {
    return `
      <h4>1. Berilgan kattaliklar (Given):</h4>
      <div class="formula-box">
        v₀ = 72 km/soat = 20 m/s (72 / 3.6)<br>
        v = 0 m/s (to'xtadi)<br>
        t = 4 s
      </div>

      <h4>2. Asosiy formulalar:</h4>
      <div class="formula-box">
        a = (v₀ - v) / t<br>
        S = v₀ · t - (a · t²) / 2 = (v₀ + v) / 2 · t
      </div>

      <h4>3. Qadamma-qadam hisoblash:</h4>
      <p>1) Tormozlanish tezlanishi:<br>
         <b>a = (20 - 0) / 4 = 5 m/s²</b>
      </p>
      <p>2) Tormozlanish yo'li:<br>
         <b>S = (20 / 2) · 4 = 10 · 4 = 40 m</b>
      </p>

      <h4>4. Xulosa:</h4>
      <p>Avtomobil har soniyada o'z tezligini <b>5 m/s</b> ga kamaytirib, to'liq to'xtaguncha <b>40 metr</b> masofani bosib o'tadi.</p>
    `;
  } else if (lower.includes("qarshilik") || lower.includes("tok") || lower.includes("om") || lower.includes("120")) {
    return `
      <h4>1. Berilgan kattaliklar:</h4>
      <div class="formula-box">
        R = 20 Om<br>
        U = 120 V<br>
        t = 5 min = 300 s
      </div>

      <h4>2. Asosiy formulalar:</h4>
      <div class="formula-box">
        I = U / R  (Om qonuni)<br>
        Q = I² · R · t = (U² / R) · t  (Joul-Lens qonuni)
      </div>

      <h4>3. Qadamma-qadam hisoblash:</h4>
      <p>1) Tok kuchi:<br>
         <b>I = 120 / 20 = 6 A (Amper)</b>
      </p>
      <p>2) Ajralib chiqqan issiqlik miqdori:<br>
         <b>Q = (6 A)² · 20 Om · 300 s = 36 · 20 · 300 = 216,000 J = 216 kJ</b>
      </p>

      <h4>4. Xulosa:</h4>
      <p>O'tkazgichdan <b>6 A</b> tok oqib o'tadi va 5 daqiqa davomida <b>216 kJ</b> issiqlik ajraladi.</p>
    `;
  } else {
    // Dynamic universal breakdown for custom problems
    return `
      <h4>1. Masalaning fizik tahlili:</h4>
      <p>Kiritilgan masala: "<i>${escapeHtml(text)}</i>"</p>

      <h4>2. Yechish algoritmi:</h4>
      <div class="formula-box">
        1. Xalqaro birliklar sistemasiga (SI) o'tkazish<br>
        2. Qonuniyat: Dinamika va mexanika qonuniyatlarini tadbiq etish<br>
        3. Formula bo'yicha ifodalash va hisoblash
      </div>

      <h4>3. AI Ustoz maslahati:</h4>
      <p>Fizika masalalarida har doim vektor yo'nalishlarini (koordinata o'qlarini) to'g'ri tanlash va berilgan kattaliklarni SI sistemasida yozib olish (masalan, km/h ni m/s ga, daqiqani soniyaga) xatolarning 80% oldini oladi.</p>
    `;
  }
}

function initPhysicsQuiz() {
  renderCurrentQuiz();
}

function renderCurrentQuiz() {
  const container = document.getElementById('physics-quiz-container');
  if (!container) return;

  const quiz = physicsQuizzes[currentQuizIndex];
  if (!quiz) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <span style="font-size: 3rem;">🎉</span>
        <h3>Barcha testlar yakunlandi!</h3>
        <p style="color: var(--text-secondary); margin: 8px 0 16px 0;">Siz ${physicsQuizzes.length} ta savoldan ${userQuizScore} tasiga to'g'ri javob berdingiz.</p>
        <button class="btn btn-primary" onclick="restartQuiz()">Qayta boshlash</button>
      </div>
    `;
    return;
  }

  let optionsHtml = '';
  quiz.options.forEach((opt, idx) => {
    optionsHtml += `
      <button class="quiz-option-btn" id="opt-btn-${idx}" onclick="selectQuizOption(${idx}, ${opt.correct})">
        <span>${opt.text}</span>
      </button>
    `;
  });

  container.innerHTML = `
    <div class="quiz-question-number">Savol ${currentQuizIndex + 1} / ${physicsQuizzes.length} • ${quiz.topic}</div>
    <div class="quiz-question-text">${quiz.question}</div>
    <div class="quiz-options">${optionsHtml}</div>
    <div id="quiz-feedback-box" class="quiz-explanation hidden"></div>
    <div class="quiz-nav-row hidden" id="quiz-next-row">
      <button class="btn btn-primary" style="width: auto; padding: 8px 16px;" onclick="nextQuizQuestion()">Keyingi savol →</button>
    </div>
  `;
}

function selectQuizOption(index, isCorrect) {
  TelegramApp.haptic(isCorrect ? 'success' : 'error');
  const quiz = physicsQuizzes[currentQuizIndex];
  const allBtns = document.querySelectorAll('.quiz-option-btn');
  allBtns.forEach(btn => btn.disabled = true);

  const selectedBtn = document.getElementById(`opt-btn-${index}`);
  if (isCorrect) {
    selectedBtn.classList.add('correct');
    userQuizScore++;
    addXP(10);
  } else {
    selectedBtn.classList.add('wrong');
    // Highlight the correct one
    quiz.options.forEach((opt, idx) => {
      if (opt.correct) {
        document.getElementById(`opt-btn-${idx}`).classList.add('correct');
      }
    });
  }

  const feedbackBox = document.getElementById('quiz-feedback-box');
  feedbackBox.innerHTML = `<b>${isCorrect ? 'To\'g\'ri!' : 'Noto\'g\'ri!'}</b> ${quiz.explanation}`;
  feedbackBox.classList.remove('hidden');

  document.getElementById('quiz-next-row').classList.remove('hidden');
}

function nextQuizQuestion() {
  TelegramApp.haptic('selection');
  currentQuizIndex++;
  renderCurrentQuiz();
}

function restartQuiz() {
  currentQuizIndex = 0;
  userQuizScore = 0;
  renderCurrentQuiz();
}

function initFormulaList() {
  const container = document.getElementById('formula-list-container');
  if (!container) return;

  container.innerHTML = physicsFormulas.map(f => `
    <div class="formula-item">
      <div class="formula-title">${f.category}: ${f.title}</div>
      <div class="formula-tex">${f.tex}</div>
      <div class="formula-desc">${f.desc}</div>
    </div>
  `).join('');
}

function filterFormulas() {
  const query = document.getElementById('formula-search').value.toLowerCase();
  const filtered = physicsFormulas.filter(f => 
    f.title.toLowerCase().includes(query) || 
    f.category.toLowerCase().includes(query) ||
    f.tex.toLowerCase().includes(query)
  );

  const container = document.getElementById('formula-list-container');
  container.innerHTML = filtered.map(f => `
    <div class="formula-item">
      <div class="formula-title">${f.category}: ${f.title}</div>
      <div class="formula-tex">${f.tex}</div>
      <div class="formula-desc">${f.desc}</div>
    </div>
  `).join('');
}

function copySolution(id) {
  TelegramApp.haptic('light');
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert("Yechim nusxalandi!");
  });
}

// ===================================================================
// O'ZBEK TILIDA FIZIKA BO'YICHA AI SUHBATDOSH (VOICE & DIALOGUE)
// ===================================================================

let physicsRecognition = null;
let isPhysicsRecording = false;
let physicsDialogueStep = 0;

const physicsUzbekTopics = {
  universe: {
    intro: "Assalomu alaykum! Keling, koinot sirlari va nisbiylik nazariyasi haqida o'zbek tilida erkin suhbatlashamiz! Masalan: Einsteinning nisbiylik nazariyasi yoki qora tuynuklar haqida nimalarni bilasiz?",
    questions: [
      "Gravitatsiya fazo-vaqt matosini bukadi. Shuning uchun massasi ulkan qora tuynuk yaqinida vaqt Yerga qaraganda ancha sekin o'tadi. Sizningcha, koinotda vaqt mashinasi yasash nazariy jihatdan mumkinmi?",
      "Koinotning kengayishi haqida Xabbel qonunini eshitganmisiz? Nega uzoqdagi galaktikalar bizdan borgan sari tezroq uzoqlashmoqda?",
      "Qora tuynukning 'voqealar gorizonti' (event horizon) degan tushunchasini qanday tasavvur qilasiz?"
    ]
  },
  mechanics: {
    intro: "Harakat va mexanika — fizikaning poydevori! Masalan, nima uchun harakatlanayotgan avtobus keskin to'xtaganda, barcha yo'lovchilar beixtiyor oldinga egilib ketadi?",
    questions: [
      "Juda to'g'ri, bu Nyutonning 1-qonuni — inersiya hodisasi! Endi ayting-chi, agar vakuumda (havosiz joyda) 10 kg lik tosh bilan 1 gramm qush patini bir vaqtda tashlasak, qaysi biri birinchi tushadi?",
      "Nyutonning 3-qonuni: 'Har bir ta'sirga teng va qarama-qarshi aks ta'sir bor'. Siz devorni 50 N kuch bilan itarsangiz, devor sizni qanday kuch bilan itaradi?",
      "Nega koptokni qiya burchak (45°) ostida tepganda u eng uzoq masofaga uchib boradi?"
    ]
  },
  energy: {
    intro: "Energiya va elektr — zamonaviy dunyoni harakatlantiruvchi kuch. Sizningcha, nega shu kunga qadar hech kim 'abadiy dvigatel' (perpetuum mobile) yarata olmagan?",
    questions: [
      "To'g'ri, Energiyaning saqlanish qonuni va Termodinamika bunga yo'l qo'ymaydi. Elektr toki aslida qanday zarrachalarning tartibli harakati ekanini bilasizmi?",
      "Quyosh panellari quyosh nurini qanday qilib elektr energiyasiga aylantiradi? (Fotoeffekt hodisasini eslang)",
      "Atom elektr stansiyalarida juda oz miqdordagi urandan qanday qilib ulkan energiya olinadi? (E = mc² formulasi)"
    ]
  },
  quantum: {
    intro: "Kvant fizikasi — mikroolam sirlari. Kvant olamida bitta elektron bir vaqtning o'zida bir nechta joyda bo'lishi mumkin! Siz kvant olami haqida nimalarni bilasiz?",
    questions: [
      "Mashhur 'Shryodinger mushugi' gipotezasida quti ochilmaguncha zarracha ham, mushuk ham bir vaqtning o'zida ikki xil holatda bo'ladi (superpozitsiya). Buni qanday tushunasiz?",
      "Kvant kompyuterlari oddiy kompyuterlardan qanday farq qiladi va nima uchun ular milliard barobar tezroq hisoblay oladi?",
      "Yorug'lik ham to'lqin, ham zarracha (foton) ekanligi (korpuskulyar-to'lqin dualizmi) haqida nima deya olasiz?"
    ]
  },
  everyday: {
    intro: "Kundalik hayotimiz to'la fizika mo'jizalaridan iborat! Masalan: Nega osmon kunduzi moviy rangda, lekin quyosh botayotganda qip-qizil bo'lib qoladi?",
    questions: [
      "Bu Reley sochilishi! Moviy nurlar to'lqin uzunligi qisqa bo'lgani uchun atmosferada eng ko'p sochiladigan nurdir. Samolyot havoda qanday qilib uchib turadi deb o'ylaysiz?",
      "Nega muz suvdan yengil va suv ustida suzadi? (Suvning g'aroyib anomaliyasi)",
      "Mikroto'lqinli pech (mikrovolnovka) qanday qilib ovqatni ichidan boshlab isitadi?"
    ]
  }
};

// Ovozli nutqni aniqlash (Speech Recognition for Uzbek)
function initPhysicsSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    physicsRecognition = new SpeechRecognition();
    physicsRecognition.continuous = false;
    physicsRecognition.lang = 'uz-UZ'; // O'zbek tili
    physicsRecognition.interimResults = false;

    physicsRecognition.onstart = () => {
      isPhysicsRecording = true;
      const micBtn = document.getElementById('physics-mic-btn');
      if (micBtn) micBtn.classList.add('recording');
      TelegramApp.haptic('medium');
    };

    physicsRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('physics-dialogue-input');
      if (input) input.value = transcript;
      TelegramApp.haptic('success');
    };

    physicsRecognition.onerror = (event) => {
      console.warn('Physics speech error:', event.error);
      stopPhysicsRecording();
    };

    physicsRecognition.onend = () => {
      stopPhysicsRecording();
    };
  }
}

function togglePhysicsSpeechRecognition() {
  if (!physicsRecognition) {
    initPhysicsSpeechRecognition();
  }

  if (!physicsRecognition) {
    alert("Kechirasiz, qurilmangizda nutqni aniqlash (Speech Recognition) faollashtirilmagan. Matn maydoniga o'zbek tilida yozishingiz mumkin.");
    return;
  }

  if (isPhysicsRecording) {
    physicsRecognition.stop();
  } else {
    try {
      physicsRecognition.start();
    } catch (e) {
      console.warn(e);
    }
  }
}

function stopPhysicsRecording() {
  isPhysicsRecording = false;
  const micBtn = document.getElementById('physics-mic-btn');
  if (micBtn) micBtn.classList.remove('recording');
}

// O'zbek tilida matnni ovoz chiqarib o'qish (TTS)
function speakTextUz(text) {
  if (window.isSoundActive && !window.isSoundActive()) return;
  if (window.TelegramApp) TelegramApp.haptic('light');
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uz-UZ';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}
window.speakUzbek = speakTextUz;

function changePhysicsTopic() {
  TelegramApp.haptic('selection');
  physicsDialogueStep = 0;
  const topicKey = document.getElementById('physics-topic-select').value;
  const topicData = physicsUzbekTopics[topicKey] || physicsUzbekTopics.universe;
  const dialogueBox = document.getElementById('physics-dialogue-box');

  dialogueBox.innerHTML = `
    <div class="message ai-message">
      <div class="msg-bubble">
        <p>${topicData.intro}</p>
      </div>
      <button class="voice-play-btn" onclick="speakTextUz('${topicData.intro.replace(/'/g, "\\'")}')">🔊 Tinglash</button>
    </div>
  `;
}

function handlePhysicsDialogueKeyPress(e) {
  if (e.key === 'Enter') {
    sendPhysicsDialogueMessage();
  }
}

async function sendPhysicsDialogueMessage() {
  const input = document.getElementById('physics-dialogue-input');
  const userText = input.value.trim();
  if (!userText) return;

  TelegramApp.haptic('medium');
  const dialogueBox = document.getElementById('physics-dialogue-box');

  // Foydalanuvchi xabarini qo'shish
  dialogueBox.innerHTML += `
    <div class="message user-message">
      <div class="msg-bubble">
        ${escapeHtml(userText)}
      </div>
    </div>
  `;
  input.value = '';
  dialogueBox.scrollTop = dialogueBox.scrollHeight;

  const topicKey = document.getElementById('physics-topic-select').value;
  const topicData = physicsUzbekTopics[topicKey] || physicsUzbekTopics.universe;

  // Loading indicator
  const loadId = 'phys-load-' + Date.now();
  dialogueBox.innerHTML += `
    <div class="message ai-message" id="${loadId}">
      <div class="msg-bubble">
        <span class="spinner"></span> <i>Professor o'ylamoqda...</i>
      </div>
    </div>
  `;
  dialogueBox.scrollTop = dialogueBox.scrollHeight;

  try {
    const sysPrompt = `Sen Fizika bo'yicha samimiy va bilimdon o'zbek ustozi va professorman. Hozir foydalanuvchi bilan "${topicKey}" mavzusida o'zbek tilida qiziqarli suhbat qurmoqdasan.
Foydalanuvchining aytgan fikriga samimiy munosabat bildir, fizik qonuniyatini qisqa va qiziqarli tushuntir, so'ng suhbatni qiziqtirish uchun bitta ajoyib yangi savol ber.
Javobni sodda HTML teglari (<b>, <i>, <p>) orqali qaytar.`;

    let geminiText = null;
    if (window.callGemini) {
      geminiText = await window.callGemini(userText, sysPrompt);
    }

    const loaderEl = document.getElementById(loadId);
    if (loaderEl) loaderEl.remove();

    if (geminiText) {
      dialogueBox.innerHTML += `
        <div class="message ai-message">
          <div class="msg-bubble">
            ${geminiText.replace(/\n/g, '<br>')}
          </div>
          <button class="voice-play-btn" onclick="speakTextUz('${escapeHtml(geminiText.replace(/<[^>]*>?/gm, '')).substring(0, 150).replace(/'/g, "\\'")}')">🔊 Tinglash</button>
        </div>
      `;
    } else {
      const nextQ = topicData.questions[physicsDialogueStep % topicData.questions.length];
      physicsDialogueStep++;
      const analysis = analyzeUzbekPhysicsAnswer(userText, topicKey);

      dialogueBox.innerHTML += `
        <div class="message ai-message">
          <div class="msg-bubble">
            <p>${analysis.explanation}</p>
            <hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 8px 0;">
            <p><b>🤔 Keyingi savol:</b> ${nextQ}</p>
          </div>
          <div class="feedback-bubble" style="background: rgba(0, 210, 255, 0.12); border-color: rgba(0, 210, 255, 0.3); color: #7dd3fc;">
            <b>⚛️ Fizik tahlil:</b> ${analysis.insight}
          </div>
          <button class="voice-play-btn" onclick="speakTextUz('${nextQ.replace(/'/g, "\\'")}')">🔊 Tinglash</button>
        </div>
      `;
    }

    dialogueBox.scrollTop = dialogueBox.scrollHeight;
    TelegramApp.haptic('success');
    addXP(15);
  } catch (err) {
    console.error('Dialogue error:', err);
    const loaderEl = document.getElementById(loadId);
    if (loaderEl) loaderEl.remove();
  }
}

function analyzeUzbekPhysicsAnswer(text, topic) {
  const lower = text.toLowerCase();
  let explanation = "Juda qiziqarli fikr bildirdingiz! Fizik qonuniyatlar aynan shunday hodisalarni tushuntirib beradi.";
  let insight = "Fikrlashingiz to'g'ri yo'nalishda. Har bir fizik xulosani formula yoki qonun bilan bog'lash bilimlarni mustahkamlaydi.";

  if (lower.includes("inersiya") || lower.includes("og'irlik") || lower.includes("tortishish")) {
    explanation = "Ajoyib! Siz harakat qonuniyatlari va Nyuton mexanikasini juda to'g'ri his qildingiz.";
    insight = "Inersiya — massaga to'g'ri proporsional. Massa qancha katta bo'lsa, jism o'z tezligini o'zgartirishga shuncha ko'p qarshilik ko'rsatadi.";
  } else if (lower.includes("vaqt") || lower.includes("nisbiylik") || lower.includes("einstein") || lower.includes("e=mc")) {
    explanation = "Barakalla! Einsteinning Maxsus va Umumiy nisbiylik nazariyasi zamonaviy astrofizikaning eng buyuk kashfiyotidir.";
    insight = "Vaqt mutlaq emas, u kuzatuvchining tezligiga va fazodagi gravitatsion maydon kuchiga bog'liq ravishda o'zgaradi.";
  } else if (lower.includes("energiya") || lower.includes("issiqlik") || lower.includes("saqlanish")) {
    explanation = "To'g'ri qayd etdingiz! Energiya yo'qdan bor bo'lmaydi va bordan yo'qolmaydi — bu koinotning asosiy qonunidir.";
    insight = "Kinetik, potensial va ichki (issiqlik) energiyalar doimiy ravishda bir-biriga aylanib turadi.";
  } else if (text.split(/\s+/).length < 4) {
    explanation = "Fikringiz tushunarli. Fizikada hodisaning sababini batafsilroq tushuntirish bilimni yanada mustahkamlaydi.";
    insight = "Maslahat: Javob berayotganda qaysi formula yoki fizik qonuniyat asosida bunday xulosaga kelganingizni ham yozing.";
  }

  return { explanation, insight };
}

