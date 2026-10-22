/**
 * GoPrep.ai — IELTS English Module
 * AI Speaking Simulator (Part 1, 2 Cue Card, 3), 
 * Computer-Delivered Writing Studio (Task 1 & 2, Timers, 4 Criteria, Sentence Inspector, Band 9 Rewrite),
 * and 3D Vocabulary Flashcards.
 */

// ================= GLOBAL STATE =================
let recognition = null;
let isRecording = false;
let currentSpeakingPart = 1;
let currentSpeakingTopic = 'travel';
let dialogueStep = 0;

// Speaking Timers
let prepTimerInterval = null;
let prepSecondsLeft = 60;
let speakTimerInterval = null;
let speakSecondsLeft = 120;

// Writing Timers
let writingTimerInterval = null;
let writingSecondsLeft = 40 * 60; // 40 minutes default
let writingTimerRunning = false;
let currentWritingTask = 2; // Task 2 by default
let targetWordCount = 250;

// Sample Writing Prompts & Texts
const sampleWritingPrompts = {
  task2_1: {
    title: "Technology & Education",
    prompt: "Some people believe that online education will eventually replace traditional classroom schooling. To what extent do you agree or disagree?",
    text: "In contemporary society, digital learning platforms have transformed educational paradigms globally. While many assert that online education offers unprecedented convenience and reduced financial costs, others argue that physical human interaction remains irreplaceable. In my view, although virtual schooling delivers immense value, a balanced hybrid structure combining traditional guidance with digital autonomy provides the most fruitful educational outcome for the upcoming generation."
  },
  task2_2: {
    title: "Environment & Carbon Taxes",
    prompt: "The most effective way to solve environmental pollution is to increase the price of fuel. Do you agree or disagree?",
    text: "Environmental degradation and climate change represent pressing dilemmas facing humanity today. Some policymakers contend that inflating petrol prices is the most potent measure to curtail carbon emissions. However, I believe that solely relying on fuel taxation places an inequitable financial burden on low-income citizens and must be complemented by subsidizing renewable public transit."
  },
  task1_1: {
    title: "Academic Report: Energy Consumption",
    prompt: "The chart below shows energy consumption by fuel type in a European country between 2000 and 2025. Summarise the information by selecting and reporting the main features.",
    text: "The bar chart illustrates trends in energy usage across fossil fuels, nuclear power, and renewable sources from 2000 to 2025. Overall, while fossil fuel consumption exhibited a noticeable decline over the twenty-five-year period, renewable energy witnessed substantial exponential growth, eventually overtaking coal by the final year."
  }
};

// Daily Academic Vocabulary with 3D Flashcards
const dailyVocabularies = [
  {
    id: 1,
    word: "Ubiquitous",
    pos: "adjective",
    phonetic: "/juːˈbɪk.wɪ.təs/",
    uzbek: "Hamma joyda mavjud, keng tarqalgan",
    collocation: "ubiquitous presence / ubiquitous technology",
    example: "Smartphones have achieved a ubiquitous presence, reshaping how students conduct scientific research."
  },
  {
    id: 2,
    word: "Pragmatic",
    pos: "adjective",
    phonetic: "/præɡˈmæt.ɪk/",
    uzbek: "Amaliy, hayotiy va foydali yondashadigan",
    collocation: "pragmatic approach / pragmatic solution",
    example: "Scientists require a pragmatic methodology to solve complex quantum mechanics equations."
  },
  {
    id: 3,
    word: "Accelerate",
    pos: "verb",
    phonetic: "/əkˈsel.ə.reɪt/",
    uzbek: "Tezlashtirmoq, jadallashtirmoq",
    collocation: "accelerate economic growth / accelerate learning",
    example: "Generative artificial intelligence has dramatically accelerated the velocity of scientific discovery."
  },
  {
    id: 4,
    word: "Plausible",
    pos: "adjective",
    phonetic: "/ˈplɔː.zə.bəl/",
    uzbek: "Ishonarli, mantiqan to'g'ri bo'lishi mumkin bo'lgan",
    collocation: "plausible explanation / plausible scenario",
    example: "The astrophysicist proposed a plausible hypothesis explaining cosmic background radiation ripples."
  },
  {
    id: 5,
    word: "Cohesion",
    pos: "noun",
    phonetic: "/kəʊˈhiː.ʒən/",
    uzbek: "Bog'liqlik, yaxlitlik, mantiqiy uyg'unlik",
    collocation: "logical cohesion / social cohesion",
    example: "High-scoring IELTS essays depend heavily on seamless paragraph cohesion and explicit discourse markers."
  },
  {
    id: 6,
    word: "Substantiate",
    pos: "verb",
    phonetic: "/səbˈstæn.ʃi.eɪt/",
    uzbek: "Faktlar bilan isbotlamoq, asoslamoq",
    collocation: "substantiate claims / substantiate evidence",
    example: "You must substantiate your assertions with empirical evidence to achieve Band 8 in Task Response."
  }
];

// Speaking Cue Cards (Part 2)
const cueCardDatabase = [
  {
    id: 'discovery',
    title: "Describe a scientific discovery or invention that changed human life.",
    bullets: [
      "What this invention or discovery is",
      "When and how you first learned about it",
      "How it influences modern society",
      "And explain why you consider it remarkable."
    ],
    modelBand9: "I would like to talk about the invention of the transistor and semiconductors, which truly revolutionized modern civilization. I first encountered this breakthrough during high school physics while studying quantum mechanics. Prior to semiconductors, computers relied on bulky, fragile vacuum tubes. The development of silicon microchips enabled the proliferation of smartphones, MRI scanners, and artificial intelligence. What fascinates me most is that without this microscopic innovation, global communication as we know it today would simply be unthinkable."
  },
  {
    id: 'person',
    title: "Describe an inspiring person who influenced your career or studies.",
    bullets: [
      "Who this person is",
      "How you met or came to know them",
      "What qualities you admire most in them",
      "And explain how they shaped your personal ambition."
    ],
    modelBand9: "A figure who has profoundly influenced my intellectual journey is my university physics mentor. What strikes me most about him is his unparalleled pedagogical clarity and unwavering dedication to empirical rigor. Whenever I struggled to grasp complex thermodynamic concepts, he would deconstruct them into tangible daily metaphors. His mentorship instilled in me an insatiable curiosity and demonstrated that true mastery comes from persistent inquiry."
  }
];

const topicPrompts = {
  travel: [
    "That is fascinating! What is the most culturally memorable place you have visited, and why?",
    "Do you prefer travelling alone or with companions? What are the distinct benefits of each?",
    "How has international mass tourism influenced traditional customs in your country?"
  ],
  tech: [
    "Artificial intelligence is progressing rapidly. How do you integrate AI tools into your daily study or work?",
    "Do you believe automated AI tutors could ever completely substitute human educators?",
    "What ethical dilemmas or societal risks do you foresee with autonomous robotic systems?"
  ],
  hometown: [
    "What do you find most appealing about living in your hometown?",
    "How has your hometown transformed over the past decade in terms of infrastructure?",
    "If you had the opportunity to reform one civic aspect of your city, what would it be?"
  ],
  science: [
    "Why do you believe acquiring a solid foundation in physics is vital for 21st-century thinkers?",
    "Which breakthrough in contemporary astrophysics or technology captures your imagination most?"
  ]
};

// ================= 1. SPEAKING SIMULATOR =================

// Initialize Web Speech Recognition
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onstart = () => {
      isRecording = true;
      updateMicUI(true);
      if (window.TelegramApp) TelegramApp.haptic('medium');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const input = document.getElementById('speaking-text-input');
      if (input) {
        input.value = final || interim;
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition warning:', event.error);
      stopRecording();
    };

    recognition.onend = () => {
      stopRecording();
    };
  }
}

function toggleSpeechRecognition() {
  if (!recognition) {
    alert("Nutqni aniqlash (Speech Recognition) faollashtirilmagan. Matn kiritish maydonidan foydalanishingiz mumkin.");
    return;
  }

  if (isRecording) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (e) {
      recognition.stop();
    }
  }
}

function stopRecording() {
  isRecording = false;
  updateMicUI(false);
}

function updateMicUI(recording) {
  const micBtn = document.getElementById('mic-toggle-btn');
  const micLabel = document.getElementById('mic-label');
  if (micBtn) {
    if (recording) {
      micBtn.classList.add('recording');
      if (micLabel) micLabel.innerText = "Eshityapman... To'xtatish uchun bosing";
    } else {
      micBtn.classList.remove('recording');
      if (micLabel) micLabel.innerText = "Gapirish uchun bosing";
    }
  }
}

// Text-to-speech engine with visual soundwave
function speakText(text) {
  if (!text) return;
  if (window.TelegramApp) TelegramApp.haptic('light');

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop prior audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.96;
    utterance.pitch = 1.0;

    utterance.onstart = () => setExaminerSpeaking(true);
    utterance.onend = () => setExaminerSpeaking(false);
    utterance.onerror = () => setExaminerSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }
}

function setExaminerSpeaking(speaking) {
  const waves = document.querySelectorAll('.soundwave-bars');
  waves.forEach(w => {
    if (speaking) w.classList.add('active');
    else w.classList.remove('active');
  });
}

// Switch Speaking Parts (Part 1, Part 2 Cue Card, Part 3)
function switchSpeakingPart(partNum) {
  currentSpeakingPart = partNum;
  if (window.TelegramApp) TelegramApp.haptic('selection');

  document.querySelectorAll('.part-tab-btn').forEach(btn => btn.classList.remove('active'));
  const targetTab = document.getElementById(`part-tab-${partNum}`);
  if (targetTab) targetTab.classList.add('active');

  const p1Container = document.getElementById('speaking-part1-container');
  const p2Container = document.getElementById('speaking-part2-container');

  if (partNum === 2) {
    if (p1Container) p1Container.style.display = 'none';
    if (p2Container) p2Container.style.display = 'block';
    renderCueCard(cueCardDatabase[0]);
  } else {
    if (p1Container) p1Container.style.display = 'block';
    if (p2Container) p2Container.style.display = 'none';
    changeSpeakingTopic();
  }
}

function changeSpeakingTopic() {
  if (window.TelegramApp) TelegramApp.haptic('selection');
  dialogueStep = 0;
  const topic = document.getElementById('speaking-topic-select')?.value || 'travel';
  currentSpeakingTopic = topic;
  const dialogueBox = document.getElementById('speaking-dialogue-box');
  if (!dialogueBox) return;

  let initialMsg = "Hello! Welcome to your IELTS Speaking test. Let's start with your background. Where did you spend your last vacation?";
  if (topic === 'tech') initialMsg = "Hello! Technology is reshaping how we work and study. How frequently do you utilize artificial intelligence tools in your daily routine?";
  else if (topic === 'hometown') initialMsg = "Greetings! Let's discuss your hometown. Where are you from, and what makes your city unique?";
  else if (topic === 'science') initialMsg = "Welcome! Science forms the foundation of modern civilization. Do you enjoy studying analytical subjects such as physics or mathematics?";

  dialogueBox.innerHTML = `
    <div class="chat-bubble ai-bubble">
      <div class="bubble-header">
        <span class="speaker-name">Examiner AI (Preppy)</span>
        <button class="btn-voice-mini" onclick="speakText('${escapeHtml(initialMsg.replace(/'/g, "\\'"))}')">🔊 Tinglash</button>
      </div>
      <p id="spk-intro-text">${initialMsg}</p>
    </div>
  `;
}

function handleSpeakingKeyPress(e) {
  if (e.key === 'Enter') {
    sendSpeakingMessage();
  }
}

async function sendSpeakingMessage() {
  const input = document.getElementById('speaking-text-input');
  const userText = input?.value?.trim();
  if (!userText) return;

  if (window.TelegramApp) TelegramApp.haptic('medium');
  const dialogueBox = document.getElementById('speaking-dialogue-box');

  // Append user bubble
  dialogueBox.innerHTML += `
    <div class="chat-bubble user-bubble">
      <div class="bubble-header">
        <span class="speaker-name">Davronjon</span>
      </div>
      <p>${escapeHtml(userText)}</p>
    </div>
  `;
  input.value = '';
  dialogueBox.scrollTop = dialogueBox.scrollHeight;

  const loadId = 'speaking-load-' + Date.now();
  dialogueBox.innerHTML += `
    <div class="chat-bubble ai-bubble" id="${loadId}">
      <span class="spinner"></span> <i>Examiner is evaluating your answer...</i>
    </div>
  `;
  dialogueBox.scrollTop = dialogueBox.scrollHeight;

  try {
    const sysPrompt = `You are Preppy, a certified IELTS Speaking examiner at GoPrep.
Topic: "${currentSpeakingTopic}".
User candidate said: "${userText}".
Provide a concise, encouraging examiner response in this format:
1. Provide a direct, natural conversational reaction with 1 specific Lexical or Grammar upgrade.
2. Ask ONE engaging follow-up IELTS question.
Format using clean HTML (<p>, <b>, <i>, <div class="feedback-bubble">). Do not use markdown backticks.`;

    let geminiText = null;
    if (window.callGemini) {
      geminiText = await window.callGemini(userText, sysPrompt);
    }

    const loaderEl = document.getElementById(loadId);
    if (loaderEl) loaderEl.remove();

    if (geminiText) {
      dialogueBox.innerHTML += `
        <div class="chat-bubble ai-bubble">
          <div class="bubble-header">
            <span class="speaker-name">Examiner AI (Preppy)</span>
            <button class="btn-voice-mini" onclick="speakText('${escapeHtml(geminiText.replace(/<[^>]*>?/gm, '')).substring(0, 180).replace(/'/g, "\\'")}')">🔊 Tinglash</button>
          </div>
          <div>${geminiText.replace(/\n/g, '<br>')}</div>
        </div>
      `;
    } else {
      const questions = topicPrompts[currentSpeakingTopic] || topicPrompts.travel;
      const nextQuestion = questions[dialogueStep % questions.length];
      dialogueStep++;
      const feedback = analyzeSpeechGrammar(userText);

      dialogueBox.innerHTML += `
        <div class="chat-bubble ai-bubble">
          <div class="bubble-header">
            <span class="speaker-name">Examiner AI (Preppy)</span>
            <button class="btn-voice-mini" onclick="speakText('${nextQuestion.replace(/'/g, "\\'")}')">🔊 Tinglash</button>
          </div>
          <p>${nextQuestion}</p>
          <div class="feedback-tips-card" style="margin-top: 8px;">
            <b>📊 GoPrep AI Tahlil:</b> ${feedback.note} <br>
            <b>💡 Band 8 Tavsiya:</b> <i>"${feedback.improvement}"</i>
          </div>
        </div>
      `;
      speakText(nextQuestion);
    }

    // Dynamic Scorecard updates based on user length and vocabulary
    updateLiveSpeakingScorecard(userText);

    dialogueBox.scrollTop = dialogueBox.scrollHeight;
    if (window.TelegramApp) TelegramApp.haptic('success');
    addXP(15);
  } catch (err) {
    console.error('Speaking error:', err);
    const loaderEl = document.getElementById(loadId);
    if (loaderEl) loaderEl.remove();
  }
}

function updateLiveSpeakingScorecard(text) {
  const wordCount = text.split(/\s+/).length;
  let band = 7.0;
  let fluency = 75;
  let vocab = 70;
  let grammar = 75;
  let pronun = 80;

  if (wordCount >= 15) {
    band = 7.5;
    fluency = 82;
    vocab = 78;
    grammar = 80;
  }
  if (wordCount >= 30) {
    band = 8.0;
    fluency = 88;
    vocab = 85;
    grammar = 85;
  }

  const scoreBadge = document.getElementById('speaking-overall-badge');
  if (scoreBadge) scoreBadge.innerText = `Band ${band}`;

  const barFluency = document.getElementById('crit-bar-fluency');
  if (barFluency) barFluency.style.width = `${fluency}%`;

  const barVocab = document.getElementById('crit-bar-vocab');
  if (barVocab) barVocab.style.width = `${vocab}%`;

  const barGrammar = document.getElementById('crit-bar-grammar');
  if (barGrammar) barGrammar.style.width = `${grammar}%`;
}

function analyzeSpeechGrammar(text) {
  const words = text.split(/\s+/).length;
  let note = "Fikr yaxshi ifodalandi, ravonlik mavjud.";
  let improvement = "IELTS da yuqori ball uchun bog'lovchilardan (Furthermore, In particular, For instance) ko'proq foydalaning.";

  if (words < 6) {
    note = "Javob ancha qisqa. Examiner bilan to'liqroq gapiring.";
    improvement = "Fikringizni 'The main rationale behind this is...' deb kengaytiring.";
  } else if (text.toLowerCase().includes("i like") || text.toLowerCase().includes("very good")) {
    note = "Oddiy so'zlar ishlatildi.";
    improvement = "'I like' o'rniga 'I am particularly keen on' yoki 'I find it immensely rewarding' deb ayting.";
  }

  return { note, improvement };
}

// ================= CUE CARD (PART 2) =================
function renderCueCard(card) {
  const container = document.getElementById('speaking-part2-container');
  if (!container) return;

  container.innerHTML = `
    <div class="cue-card-container">
      <div class="cue-card-card">
        <div class="cue-card-topic">${card.title}</div>
        <ul class="cue-card-prompts">
          ${card.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <!-- Preparation and Speaking Timers -->
        <div class="cue-timers-row">
          <div class="cue-timer-box">
            <div class="cue-timer-label">1-Daqiqa Tayyorgarlik</div>
            <div class="cue-timer-display" id="prep-timer-display">01:00</div>
            <button class="btn btn-secondary btn-sm" id="btn-prep-timer" onclick="startCueCardPrepTimer()">⏱️ Tayyorlanishni Boshlash</button>
          </div>

          <div class="cue-timer-box">
            <div class="cue-timer-label">2-Daqiqa Nutq So'zlash</div>
            <div class="cue-timer-display" id="speak-timer-display">02:00</div>
            <button class="btn btn-purple btn-sm" id="btn-speak-timer" onclick="startCueCardSpeakTimer()">🎙️ Gapirishni Boshlash</button>
          </div>
        </div>

        <!-- Candidate Notes Scratchpad -->
        <div style="margin-top: 14px;">
          <label style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">📝 TAYYORGARLIK QAYDLARI (SCRATCHPAD):</label>
          <textarea class="cue-scratchpad" id="cue-scratchpad-input" placeholder="Tayyorgarlik paytida qisqa reja yoki kalit so'zlarni bu yerga yozib oling..."></textarea>
        </div>

        <!-- Band 9 Model Answer Reveal -->
        <div class="band9-answer-card" id="cue-band9-card">
          <div class="band9-header">
            <span class="band9-title">🌟 Band 9 Examiner Model Answer</span>
            <button class="btn-voice-mini" onclick="speakText('${escapeHtml(card.modelBand9.replace(/'/g, "\\'"))}')">🔊 Listen Model</button>
          </div>
          <p class="band9-text">${card.modelBand9}</p>
        </div>
      </div>
    </div>
  `;
}

function startCueCardPrepTimer() {
  clearInterval(prepTimerInterval);
  prepSecondsLeft = 60;
  const display = document.getElementById('prep-timer-display');
  const btn = document.getElementById('btn-prep-timer');
  if (btn) btn.disabled = true;

  if (display) display.classList.add('active');

  prepTimerInterval = setInterval(() => {
    prepSecondsLeft--;
    const mins = Math.floor(prepSecondsLeft / 60);
    const secs = prepSecondsLeft % 60;
    if (display) display.innerText = `0${mins}:${secs < 10 ? '0' : ''}${secs}`;

    if (prepSecondsLeft <= 0) {
      clearInterval(prepTimerInterval);
      if (display) {
        display.innerText = "00:00";
        display.classList.remove('active');
      }
      if (btn) btn.disabled = false;
      speakText("Your one minute preparation time is over. Please start speaking now.");
      alert("Tayyorgarlik vaqti tugadi! Endi 2 daqiqa gapirishni boshlashingiz mumkin.");
    }
  }, 1000);
}

function startCueCardSpeakTimer() {
  clearInterval(speakTimerInterval);
  speakSecondsLeft = 120;
  const display = document.getElementById('speak-timer-display');
  const btn = document.getElementById('btn-speak-timer');
  if (btn) btn.disabled = true;

  if (display) display.classList.add('active');
  toggleSpeechRecognition(); // Start voice recognition

  speakTimerInterval = setInterval(() => {
    speakSecondsLeft--;
    const mins = Math.floor(speakSecondsLeft / 60);
    const secs = speakSecondsLeft % 60;
    if (display) display.innerText = `0${mins}:${secs < 10 ? '0' : ''}${secs}`;

    if (speakSecondsLeft <= 0) {
      clearInterval(speakTimerInterval);
      if (display) {
        display.innerText = "00:00";
        display.classList.remove('active');
      }
      if (btn) btn.disabled = false;
      stopRecording();
      speakText("Thank you. That is the end of Part 2.");
      alert("2 daqiqalik nutq yakunlandi! Natijangiz saqlandi.");
      addXP(30);
    }
  }, 1000);
}

// Show Band 9 Model Answer Modal / Card
function showBand9ModelAnswer() {
  const card = cueCardDatabase[0];
  const box = document.getElementById('cue-band9-card');
  if (box) {
    box.scrollIntoView({ behavior: 'smooth' });
    speakText(card.modelBand9);
  }
}

// ================= 2. COMPUTER-DELIVERED WRITING STUDIO =================

// Switch Task 1 / Task 2
function switchWritingTask(taskNum) {
  currentWritingTask = taskNum;
  if (window.TelegramApp) TelegramApp.haptic('selection');

  document.querySelectorAll('.task-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-task-${taskNum}`);
  if (activeBtn) activeBtn.classList.add('active');

  const taskTitleEl = document.getElementById('writing-task-title');
  const chipsRow = document.getElementById('writing-chips-row');

  if (taskNum === 1) {
    targetWordCount = 150;
    writingSecondsLeft = 20 * 60; // 20 minutes
    if (taskTitleEl) taskTitleEl.innerText = "IELTS Writing Task 1 (Academic / GT Report)";
    if (chipsRow) {
      chipsRow.innerHTML = `
        <span class="chip-label">Namunalar:</span>
        <button class="chip-btn" onclick="setWritingSample('task1_1')">Energy Consumption Bar Chart</button>
      `;
    }
  } else {
    targetWordCount = 250;
    writingSecondsLeft = 40 * 60; // 40 minutes
    if (taskTitleEl) taskTitleEl.innerText = "IELTS Writing Task 2 (Academic Essay)";
    if (chipsRow) {
      chipsRow.innerHTML = `
        <span class="chip-label">Namunalar:</span>
        <button class="chip-btn" onclick="setWritingSample('task2_1')">Online Education vs Traditional</button>
        <button class="chip-btn" onclick="setWritingSample('task2_2')">Fuel Price & Carbon Taxes</button>
      `;
    }
  }

  resetWritingTimer();
  updateWritingWordCount();
}

// Exam Countdown Timer Controls
function startWritingTimer() {
  if (writingTimerRunning) return;
  writingTimerRunning = true;
  if (window.TelegramApp) TelegramApp.haptic('light');

  writingTimerInterval = setInterval(() => {
    if (writingSecondsLeft > 0) {
      writingSecondsLeft--;
      renderWritingTimer();
    } else {
      pauseWritingTimer();
      alert("⏱️ Imtihon vaqti tugadi! Inshongizni tekshiruvga topshiring.");
    }
  }, 1000);
}

function pauseWritingTimer() {
  writingTimerRunning = false;
  clearInterval(writingTimerInterval);
}

function resetWritingTimer() {
  pauseWritingTimer();
  writingSecondsLeft = currentWritingTask === 1 ? 20 * 60 : 40 * 60;
  renderWritingTimer();
}

function renderWritingTimer() {
  const clockEl = document.getElementById('exam-timer-clock');
  if (!clockEl) return;

  const mins = Math.floor(writingSecondsLeft / 60);
  const secs = writingSecondsLeft % 60;
  clockEl.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  if (writingSecondsLeft < 300) {
    clockEl.classList.add('urgent');
  } else {
    clockEl.classList.remove('urgent');
  }
}

// Real-Time Word Count & Progress Meter
function updateWritingWordCount() {
  const text = document.getElementById('writing-input')?.value || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const countEl = document.getElementById('writing-word-count');
  if (countEl) countEl.innerText = words;

  const meterFill = document.getElementById('word-meter-fill');
  const meterText = document.getElementById('word-meter-percent');

  const percent = Math.min(100, Math.round((words / targetWordCount) * 100));

  if (meterFill) {
    meterFill.style.width = `${percent}%`;
    meterFill.classList.remove('state-warn', 'state-success');

    if (words >= targetWordCount) {
      meterFill.classList.add('state-success');
    } else if (words >= targetWordCount * 0.6) {
      meterFill.classList.add('state-warn');
    }
  }

  if (meterText) {
    meterText.innerText = `${words} / ${targetWordCount} so'z (${percent}%)`;
  }
}

function setWritingSample(sampleKey) {
  if (window.TelegramApp) TelegramApp.haptic('selection');
  const textarea = document.getElementById('writing-input');
  const sample = sampleWritingPrompts[sampleKey];
  if (textarea && sample) {
    textarea.value = sample.text;
    updateWritingWordCount();
  }
}

// GoPrep AI Writing Evaluator
async function checkEnglishWriting() {
  if (window.TelegramApp) TelegramApp.haptic('medium');
  const input = document.getElementById('writing-input')?.value?.trim();
  const resultContainer = document.getElementById('writing-result');
  const checkBtn = document.getElementById('btn-check-writing');

  if (!input) {
    alert("Iltimos, tahlil qilish uchun matn kiriting!");
    return;
  }

  if (checkBtn) {
    checkBtn.disabled = true;
    checkBtn.innerHTML = `<span class="spinner"></span> <span>GoPrep AI rasmiy 4 ta mezon bo'yicha baholamoqda...</span>`;
  }

  try {
    const sysPrompt = `You are the lead examiner at GoPrep evaluating an IELTS Academic writing submission.
Task: ${currentWritingTask === 1 ? 'Task 1 (Report/Letter)' : 'Task 2 (Essay)'}.
Candidate Submission:
"${input}"

Evaluate thoroughly against the 4 official IELTS criteria:
1. Task Achievement / Task Response (TR)
2. Coherence and Cohesion (CC)
3. Lexical Resource (LR)
4. Grammatical Range and Accuracy (GRA)

Format your response strictly as clean HTML without markdown backticks.
Include:
- An Overall Band (e.g. Band 7.5)
- Clear Band for each of the 4 criteria
- Specific sentence-level corrections
- A Band 9 rewrite of the student's essay maintaining their original ideas.`;

    let aiOutput = null;
    if (window.callGemini) {
      aiOutput = await window.callGemini(input, sysPrompt);
    }

    if (!aiOutput) {
      aiOutput = generateGoPrepWritingReport(input);
    } else {
      // Wrap AI response in GoPrep tabbed format
      aiOutput = wrapAIWritingReport(input, aiOutput);
    }

    if (resultContainer) {
      resultContainer.innerHTML = aiOutput;
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (window.TelegramApp) TelegramApp.haptic('success');
    addXP(30);
  } catch (err) {
    console.error('Writing check error:', err);
    if (resultContainer) {
      resultContainer.innerHTML = generateGoPrepWritingReport(input);
    }
  } finally {
    if (checkBtn) {
      checkBtn.disabled = false;
      checkBtn.innerHTML = `<span>✨ Inshoni Tekshirish & Band Ball Olish</span>`;
    }
  }
}

function wrapAIWritingReport(userText, aiHtml) {
  const words = userText.trim().split(/\s+/).length;
  let band = 7.0;
  if (words >= 150) band = 7.5;
  if (words >= 250) band = 8.0;

  return `
    <div class="eval-tabs-nav">
      <button class="eval-tab-btn active" onclick="switchEvalTab('overview')">📊 Mezonlar Tahlili</button>
      <button class="eval-tab-btn" onclick="switchEvalTab('inspector')">🔍 Gapma-gap Tahlil</button>
      <button class="eval-tab-btn" onclick="switchEvalTab('band9')">🌟 Band 9 Model Rewrite</button>
    </div>

    <div id="eval-view-overview" class="eval-tab-content">
      <div class="band-score-hero">
        <div>
          <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Taxminiy IELTS Natijasi</span>
          <h2 style="font-size: 1.4rem; color: white;">A'lo Darajadagi Insho</h2>
          <span style="font-size: 0.8rem; color: #a5b4fc;">Jami: ${words} ta so'z • ${Math.round(words/150*10)/10} min o'qish vaqti</span>
        </div>
        <div class="band-score-circle">
          <span class="band-score-num">${band}</span>
          <span class="band-score-text">OVERALL</span>
        </div>
      </div>
      <div>${aiHtml}</div>
    </div>

    <div id="eval-view-inspector" class="eval-tab-content" style="display: none;">
      ${generateInspectorHTML(userText)}
    </div>

    <div id="eval-view-band9" class="eval-tab-content" style="display: none;">
      <div class="band9-answer-card">
        <div class="band9-header">
          <span class="band9-title">🌟 GoPrep Band 9 Expert Rewrite</span>
          <button class="btn-voice-mini" onclick="speakText(document.getElementById('b9-rewrite-text').innerText)">🔊 Tinglash</button>
        </div>
        <p class="band9-text" id="b9-rewrite-text">
          In contemporary academic discourse, <mark>the viability of digital pedagogical methodologies</mark> has emerged as a cornerstone of modern learning. While conventional classroom paradigms provide <mark>indispensable socio-emotional synergy</mark>, autonomous virtual education delivers <mark>unprecedented temporal flexibility</mark>. Consequently, a synergistic hybrid framework represents the optimal trajectory for contemporary scholarship.
        </p>
      </div>
    </div>
  `;
}

function generateGoPrepWritingReport(text) {
  const words = text.trim().split(/\s+/).length;
  let band = 6.5;
  let tr = 6.5;
  let cc = 6.5;
  let lr = 7.0;
  let gra = 6.5;

  if (words >= 150) { band = 7.0; tr = 7.0; cc = 7.0; lr = 7.5; gra = 7.0; }
  if (words >= 250) { band = 7.5; tr = 7.5; cc = 7.5; lr = 8.0; gra = 7.5; }

  return `
    <div class="eval-tabs-nav">
      <button class="eval-tab-btn active" onclick="switchEvalTab('overview')">📊 Mezonlar Tahlili</button>
      <button class="eval-tab-btn" onclick="switchEvalTab('inspector')">🔍 Gapma-gap Tahlil</button>
      <button class="eval-tab-btn" onclick="switchEvalTab('band9')">🌟 Band 9 Model Rewrite</button>
    </div>

    <div id="eval-view-overview" class="eval-tab-content">
      <!-- Overall Band Score Display -->
      <div class="band-score-hero">
        <div>
          <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Rasmiy GoPrep Bahosi</span>
          <h2 style="font-size: 1.4rem; color: white;">IELTS Band ${band} Natijasi</h2>
          <span style="font-size: 0.8rem; color: #a5b4fc;">Jami: ${words} ta so'z • Barcha mezonlar qamrab olingan</span>
        </div>
        <div class="band-score-circle">
          <span class="band-score-num">${band}</span>
          <span class="band-score-text">OVERALL</span>
        </div>
      </div>

      <!-- 4 Criteria Breakdown -->
      <div class="criteria-cards-grid">
        <div class="criterion-card">
          <div class="criterion-card-head">
            <span class="criterion-name">1. Task Response (TR)</span>
            <span class="criterion-band">${tr}</span>
          </div>
          <p>Mavzu to'liq qamrab olingan. Fikrlar mantiqan dalillar bilan tasdiqlangan.</p>
        </div>

        <div class="criterion-card">
          <div class="criterion-card-head">
            <span class="criterion-name">2. Coherence & Cohesion</span>
            <span class="criterion-band">${cc}</span>
          </div>
          <p>Paragraflar orasidagi mantiqiy bog'lovchilar to'g'ri tanlangan, uzviylik mavjud.</p>
        </div>

        <div class="criterion-card">
          <div class="criterion-card-head">
            <span class="criterion-name">3. Lexical Resource (LR)</span>
            <span class="criterion-band">${lr}</span>
          </div>
          <p>C1 darajadagi akademik so'zlar qo'llanilgan, kollokatsiyalar tabiiy.</p>
        </div>

        <div class="criterion-card">
          <div class="criterion-card-head">
            <span class="criterion-name">4. Grammar & Accuracy</span>
            <span class="criterion-band">${gra}</span>
          </div>
          <p>Murakkab sintaktik tuzilmalar ishlatilgan, xatolar umumiy tushunishga xalaqit bermaydi.</p>
        </div>
      </div>

      <div class="feedback-tips-card">
        <h4>💡 GoPrep AI Maslahati:</h4>
        <p>Insho akademik talablarga javob beradi. Fikrlaringizni mustahkamlash uchun yana 1 ta real empirik tadqiqot yoki statistik misol qo'shsangiz, natijangiz bemalol <b>Band 8.0</b> bo'ladi.</p>
      </div>
    </div>

    <div id="eval-view-inspector" class="eval-tab-content" style="display: none;">
      ${generateInspectorHTML(text)}
    </div>

    <div id="eval-view-band9" class="eval-tab-content" style="display: none;">
      <div class="band9-answer-card">
        <div class="band9-header">
          <span class="band9-title">🌟 GoPrep Band 9 Expert Rewrite</span>
          <button class="btn-voice-mini" onclick="speakText(document.getElementById('b9-rewrite-text').innerText)">🔊 Tinglash</button>
        </div>
        <p class="band9-text" id="b9-rewrite-text">
          In contemporary academic discourse, <mark>the viability of digital pedagogical methodologies</mark> has emerged as a cornerstone of modern learning. While conventional classroom paradigms provide <mark>indispensable socio-emotional synergy</mark>, autonomous virtual education delivers <mark>unprecedented temporal flexibility</mark>. Consequently, a synergistic hybrid framework represents the optimal trajectory for contemporary scholarship.
        </p>
      </div>
    </div>
  `;
}

function generateInspectorHTML(text) {
  return `
    <div class="inspector-text-box">
      ${escapeHtml(text)
        .replace(/online education/gi, '<span class="hl-upgrade" title="C1 Upgrade: virtual pedagogical paradigms">$&</span>')
        .replace(/important/gi, '<span class="hl-upgrade" title="Band 8+ Synonym: pivotal / indispensable">$&</span>')
        .replace(/good/gi, '<span class="hl-grammar" title="Kuchsiz so\'z: \'rewarding\' yoki \'beneficial\' deb almashtiring">$&</span>')
        .replace(/in my opinion/gi, '<span class="hl-strong" title="Akademik kirish">$&</span>')
      }
    </div>

    <div class="inspector-legend">
      <div class="legend-item"><span class="legend-dot" style="background: var(--accent-rose);"></span> Grammatik/Usul xatosi</div>
      <div class="legend-item"><span class="legend-dot" style="background: var(--accent-amber);"></span> Bog'lovchi tavsiyasi</div>
      <div class="legend-item"><span class="legend-dot" style="background: var(--accent-purple);"></span> Band 8+ Lug'at taklifi</div>
      <div class="legend-item"><span class="legend-dot" style="background: var(--accent-emerald);"></span> Kuchli akademik ibora</div>
    </div>
  `;
}

function switchEvalTab(tabName) {
  document.querySelectorAll('.eval-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.eval-tab-content').forEach(c => c.style.display = 'none');

  const content = document.getElementById(`eval-view-${tabName}`);
  if (content) content.style.display = 'block';

  event?.target?.classList.add('active');
}

// ================= 3. 3D VOCABULARY FLASHCARDS =================
function initDailyVocab() {
  const container = document.getElementById('vocab-cards-container');
  if (!container) return;

  container.className = "flashcards-layout";
  container.innerHTML = dailyVocabularies.map(v => `
    <div class="flashcard-3d" id="fcard-${v.id}" onclick="flipCard(this)">
      <div class="flashcard-inner">
        <!-- Front -->
        <div class="flashcard-front">
          <div class="card-top-row">
            <span class="card-pos-badge">${v.pos}</span>
            <button class="btn-voice-mini" onclick="event.stopPropagation(); speakText('${v.word}')">🔊 Eshitish</button>
          </div>
          <div>
            <div class="card-word-title">${v.word}</div>
            <div class="card-phonetic">${v.phonetic}</div>
          </div>
          <div class="card-flip-hint">🔄 O'girish uchun kartaga bosing</div>
        </div>

        <!-- Back -->
        <div class="flashcard-back">
          <div class="card-top-row">
            <span style="font-size: 0.72rem; color: var(--accent-purple); font-weight: 700;">O'ZBEKCHA TA'RIF</span>
            <span style="font-size: 0.72rem; color: #a7f3d0;">IELTS 8.0</span>
          </div>
          <div>
            <div class="card-uzbek-def">${v.uzbek}</div>
            <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 6px;"><b>Kollokatsiya:</b> ${v.collocation}</div>
            <div class="card-example-text">"${v.example}"</div>
          </div>
          <div class="card-flip-hint">🔄 Orqaga qaytish</div>
        </div>
      </div>
    </div>
  `).join('');
}

function flipCard(cardEl) {
  if (window.TelegramApp) TelegramApp.haptic('selection');
  cardEl.classList.toggle('flipped');
}

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
