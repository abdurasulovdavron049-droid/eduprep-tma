/**
 * GoPrep.gg — Main Application Orchestrator
 * Controls navigation, views, sidebar toggling, Gemini AI integration, state,
 * and the Interactive Fire Mascot Call Room.
 */

let appState = {
  currentView: 'dashboard',
  xp: 450,
  streak: 5,
  soundEnabled: true
};

const viewTitles = {
  'dashboard': 'Boshqaruv paneli',
  'call': 'Preppy Live Call',
  'speaking': 'IELTS AI Speaking Room',
  'writing': 'IELTS Writing Studio',
  'vocab': 'Smart Flashcards (3D)',
  'physics-solver': 'Fizika AI Masala Yechuvchi',
  'physics-voice': 'O\'zbekcha Fizika Suhbati',
  'physics-quiz': 'DTM / SAT Fizika Testlari',
  'dual-mode': 'Physics in English',
  'tutor': '24/7 Shaxsiy AI Ustoz'
};

document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Initialize modules
  if (typeof initPhysicsQuiz === 'function') initPhysicsQuiz();
  if (typeof initFormulaList === 'function') initFormulaList();
  if (typeof initSpeechRecognition === 'function') initSpeechRecognition();
  if (typeof initPhysicsSpeechRecognition === 'function') initPhysicsSpeechRecognition();
  if (typeof initDailyVocab === 'function') initDailyVocab();
  if (typeof openDualSection === 'function') openDualSection('glossary');
  if (typeof renderWritingTimer === 'function') renderWritingTimer();
  if (typeof updateWritingWordCount === 'function') updateWritingWordCount();

  // Telegram SDK sync
  if (window.TelegramApp) {
    TelegramApp.init();
  }
});

function loadState() {
  const savedXp = localStorage.getItem('goprep_xp');
  const savedStreak = localStorage.getItem('goprep_streak');
  if (savedXp) appState.xp = parseInt(savedXp, 10);
  if (savedStreak) appState.streak = parseInt(savedStreak, 10);

  updateStateUI();
}

function addXP(points) {
  appState.xp += points;
  localStorage.setItem('goprep_xp', appState.xp);
  updateStateUI();
}

function updateStateUI() {
  const xpEl = document.getElementById('sidebar-xp');
  const streakEl = document.getElementById('sidebar-streak');
  const topStreakEl = document.getElementById('top-streak');
  if (xpEl) xpEl.innerText = `⚡ ${appState.xp} XP`;
  if (streakEl) streakEl.innerText = `🔥 ${appState.streak} kun`;
  if (topStreakEl) topStreakEl.innerText = `🔥 ${appState.streak} kun`;
}

function toggleSound() {
  appState.soundEnabled = !appState.soundEnabled;
  const btn = document.getElementById('audio-toggle-btn');
  if (btn) {
    btn.innerHTML = appState.soundEnabled 
      ? '<span>🔊 Ovoz: YOQILGAN</span>' 
      : '<span>🔇 Ovoz: O\'CHIRILGAN</span>';
  }
  if (!appState.soundEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
window.isSoundActive = () => appState.soundEnabled;

// GoPrep View Navigation
function navigate(viewId) {
  const previousView = appState.currentView;
  appState.currentView = viewId;

  // Cleanup prior call if leaving call view
  if (previousView === 'call' && viewId !== 'call') {
    if (typeof stopCallMic === 'function') stopCallMic();
    if (callTimerInterval) clearInterval(callTimerInterval);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // Toggle active page view
  document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) targetView.classList.add('active');

  // Update Breadcrumbs
  const crumbEl = document.getElementById('current-crumb');
  if (crumbEl && viewTitles[viewId]) {
    crumbEl.innerText = viewTitles[viewId];
  }

  // Update active sidebar nav button
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(`'${viewId}'`)) {
      btn.classList.add('active');
    }
  });

  // Update active mobile bottom nav button
  document.querySelectorAll('.bnav-item').forEach(btn => btn.classList.remove('active'));
  const bnavBtn = document.getElementById(`bnav-${viewId}`);
  if (bnavBtn) bnavBtn.classList.add('active');

  // Launch Call if entering call view
  if (viewId === 'call') {
    startGoPrepCall();
  }

  // Close sidebar on mobile
  closeSidebar();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile Sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('open');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
  }
}

// ================= GEMINI AI ORCHESTRATOR =================
const CLIENT_GEMINI_KEY = "AQ.Ab8RN6JhCfmZ-m7QIJ334Y13wugEnnW7z9SykLcPnuLpcPAUGg";

async function callGemini(prompt, systemInstruction) {
  // 1. Try local server endpoint if running
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return data.text;
      }
    }
  } catch (err) {}

  // 2. Direct Google Gemini API fallback
  if (CLIENT_GEMINI_KEY) {
    try {
      const models = ['gemini-flash-lite-latest', 'gemini-flash-latest'];
      for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CLIENT_GEMINI_KEY}`;
        const payload = {
          contents: [{ parts: [{ text: prompt }] }]
        };
        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      }
    } catch (e) {
      console.warn('Client Gemini error:', e);
    }
  }

  return null;
}
window.callGemini = callGemini;

// ================= GOPREP LIVE CALL WITH FIRE MASCOT (SCREENSHOT 2) =================
let callTimerInterval = null;
let callSecondsElapsed = 0;
let callLanguage = 'en'; // 'en' or 'uz'
let isCallMicRecording = false;
let callSpeechRecognition = null;

function startGoPrepCall() {
  callSecondsElapsed = 0;
  clearInterval(callTimerInterval);
  renderCallTimer();

  callTimerInterval = setInterval(() => {
    callSecondsElapsed++;
    renderCallTimer();
    if (callSecondsElapsed >= 600) { // 10 minutes limit
      stopGoPrepCall();
      alert("⏱️ 10 daqiqalik suhbat vaqti yakunlandi!");
    }
  }, 1000);

  const initialGreeting = callLanguage === 'en'
    ? "Hello Davronjon! Welcome to your GoPrep Speaking session. What would you like to discuss today?"
    : "Assalomu alaykum, Davronjon! GoPrep fizika ovozli suhbatiga xush kelibsiz. Qaysi mavzuni tushuntirib beray?";

  updateCallSubtitles(initialGreeting);
  playMascotSpeech(initialGreeting);
}

function stopGoPrepCall() {
  clearInterval(callTimerInterval);
  stopCallMic();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setMascotState('idle');
  navigate('dashboard');
}

function renderCallTimer() {
  const el = document.getElementById('call-timer-display');
  if (!el) return;
  const mins = Math.floor(callSecondsElapsed / 60);
  const secs = callSecondsElapsed % 60;
  el.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs} / 10:00`;
}

function setMascotState(state) {
  const stage = document.getElementById('mascot-stage');
  const tagText = document.getElementById('mascot-status-text');
  if (!stage) return;

  stage.classList.remove('speaking', 'listening');

  if (state === 'speaking') {
    stage.classList.add('speaking');
    if (tagText) tagText.innerText = "Preppy gapirmoqda...";
  } else if (state === 'listening') {
    stage.classList.add('listening');
    if (tagText) tagText.innerText = "Sizni eshityapman... (Gapiring)";
  } else {
    if (tagText) tagText.innerText = "Mikrofonga bosing va gapiring";
  }
}

function updateCallSubtitles(text) {
  const el = document.getElementById('call-subtitles');
  if (el) el.innerText = `"${text}"`;
}

function playMascotSpeech(text) {
  if (window.TelegramApp) TelegramApp.haptic('light');
  if (!appState.soundEnabled) return;

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = callLanguage === 'en' ? 'en-US' : 'uz-UZ';
    utterance.rate = 0.96;
    utterance.pitch = 1.05;

    utterance.onstart = () => setMascotState('speaking');
    utterance.onend = () => setMascotState('idle');
    utterance.onerror = () => setMascotState('idle');

    window.speechSynthesis.speak(utterance);
  }
}

function toggleCallLanguage() {
  callLanguage = callLanguage === 'en' ? 'uz' : 'en';
  const btn = document.getElementById('call-lang-btn');
  if (btn) {
    btn.innerText = callLanguage === 'en' ? '🇬🇧 IELTS (English)' : '🇺🇿 Fizika (O\'zbek)';
  }
  const switchMsg = callLanguage === 'en' 
    ? "Switched to English IELTS Speaking mode." 
    : "O'zbek tili Fizika rejimiga o'tildi.";
  updateCallSubtitles(switchMsg);
  playMascotSpeech(switchMsg);
}

function toggleCallMic() {
  if (isCallMicRecording) {
    stopCallMic();
  } else {
    startCallMic();
  }
}

function startCallMic() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Kechirasiz, qurilmangizda nutqni tanish faollashtirilmagan. Matn kiritish tugmasidan foydalaning.");
    return;
  }

  isCallMicRecording = true;
  const btn = document.getElementById('btn-call-mic');
  if (btn) btn.classList.add('recording');
  setMascotState('listening');

  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  callSpeechRecognition = new SpeechRecognition();
  callSpeechRecognition.continuous = false;
  callSpeechRecognition.interimResults = true;
  callSpeechRecognition.lang = callLanguage === 'en' ? 'en-US' : 'uz-UZ';

  callSpeechRecognition.onresult = (e) => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; ++i) {
      transcript += e.results[i][0].transcript;
    }
    updateCallSubtitles(`Siz: ${transcript}`);
  };

  callSpeechRecognition.onerror = (err) => {
    console.warn('Call mic error:', err);
    stopCallMic();
  };

  callSpeechRecognition.onend = () => {
    stopCallMic();
    processCandidateCallSpeech();
  };

  try {
    callSpeechRecognition.start();
  } catch (err) {
    stopCallMic();
  }
}

function stopCallMic() {
  isCallMicRecording = false;
  const btn = document.getElementById('btn-call-mic');
  if (btn) btn.classList.remove('recording');
  if (callSpeechRecognition) {
    try { callSpeechRecognition.stop(); } catch(e){}
  }
}

async function processCandidateCallSpeech() {
  const subEl = document.getElementById('call-subtitles');
  let userText = subEl?.innerText?.replace(/^"Siz:\s*|"$|^"/g, '').trim();
  if (!userText || userText.length < 2) {
    setMascotState('idle');
    return;
  }

  setMascotState('speaking');
  updateCallSubtitles("Preppy o'ylamoqda...");

  const sysPrompt = callLanguage === 'en'
    ? "You are Preppy, the animated fire mascot and certified IELTS Speaking examiner at GoPrep. Reply in 1-2 friendly, conversational sentences with 1 vocabulary tip, then ask 1 engaging question. Keep it concise."
    : "Sen GoPrep'ning olov sochli qahramoni 'Preppy'san. Fizika bo'yicha samimiy, qisqa va qiziqarli qilib 1-2 jumlada javob ber va bitta savol ber.";

  let reply = await callGemini(userText, sysPrompt);
  if (!reply) {
    reply = callLanguage === 'en'
      ? "That is a very thoughtful perspective! In IELTS Speaking, expanding on your reasons helps boost your Fluency. How did you first get interested in that?"
      : "Ajoyib fikr! Fizika qonuniyatlarini kundalik hayotda ko'ra bilish juda muhim. Bu haqida yana qanday misollarni bilasiz?";
  }

  const cleanReply = reply.replace(/<[^>]*>?/gm, '').trim();
  updateCallSubtitles(cleanReply);
  playMascotSpeech(cleanReply);
  addXP(15);
}

function toggleCallTextInput() {
  const drawer = document.getElementById('call-text-drawer');
  if (drawer) {
    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
  }
}

function handleCallTextInput(e) {
  if (e.key === 'Enter') {
    sendCallTextMessage();
  }
}

function sendCallTextMessage() {
  const input = document.getElementById('call-text-input');
  const text = input?.value?.trim();
  if (!text) return;
  input.value = '';
  updateCallSubtitles(`Siz: ${text}`);
  toggleCallTextInput();
  processCandidateCallSpeech();
}

// ================= AI TUTOR LIVE CHAT =================
function handleTutorKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendTutorMessage();
  }
}

async function sendTutorMessage() {
  const input = document.getElementById('tutor-text-input');
  const userText = input?.value?.trim();
  if (!userText) return;

  const chatBox = document.getElementById('tutor-messages-box');

  chatBox.innerHTML += `
    <div class="chat-bubble user-bubble">
      ${escapeHtml(userText)}
    </div>
  `;
  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  const loadingId = 'tutor-loading-' + Date.now();
  chatBox.innerHTML += `
    <div class="chat-bubble ai-bubble" id="${loadingId}">
      <span class="spinner"></span> <i>Preppy javob tayyorlamoqda...</i>
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;

  const sysPrompt = "Sen GoPrep platformasining Fizika va IELTS bo'yicha yetakchi repetitori 'Preppy'san. Foydalanuvchiga samimiy, aniq va qiziqarli qilib javob ber. Formatlashda HTML teglari (<b>, <i>, <code>) dan foydalan.";
  const geminiAnswer = await callGemini(userText, sysPrompt);

  const loaderEl = document.getElementById(loadingId);
  if (loaderEl) loaderEl.remove();

  const finalResponse = geminiAnswer ? geminiAnswer.replace(/\n/g, '<br>') : generateTutorAnswer(userText);

  chatBox.innerHTML += `
    <div class="chat-bubble ai-bubble">
      ${finalResponse}
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;
  addXP(10);
}

function generateTutorAnswer(query) {
  const q = query.toLowerCase();

  if (q.includes('nyuton') || q.includes('newton')) {
    return `<b>Nyuton qonunlari haqida:</b><br>
    1-qonun (Inersiya): Jismga tashqi kuch ta'sir qilmasa, u tinch holatini yoki to'g'ri chiziqli tekis harakatini saqlaydi.<br>
    2-qonun: <code>F = m · a</code> — Jismning tezlanishi kuchga to'g'ri, massaga teskari proporsional.<br>
    3-qonun: Har qanday ta'sirga unga teng va qarama-qarshi aks ta'sir mavjud (<code>F₁ = -F₂</code>).`;
  } else if (q.includes('gravitatsiya') || q.includes('gravity') || q.includes('tortishish')) {
    return `<b>Butunjahon tortishish qonuni:</b><br>
    Ikkita jism bir-birini ularning massalari ko'paytmasiga to'g'ri, oralaridagi masofaning kvadratiga teskari proporsional kuch bilan tortadi:<br>
    <code>F = G · (m₁ · m₂) / r²</code>`;
  } else if (q.includes('ielts') || q.includes('speaking') || q.includes('writing')) {
    return `<b>GoPrep IELTS Strategiyasi:</b><br>
    • <b>Speaking</b>da: Fikrni darhol qisqa qoldirmang; <i>"The primary rationale behind this is..."</i> kabi C1 bog'lovchilar bilan kengaytiring.<br>
    • <b>Writing</b>da: Rasmiy 4 ta mezon (Task Response, Coherence & Cohesion, Lexical Resource, Grammar) muvozanatini saqlang va kamida 250 ta so'z yozing.`;
  } else {
    return `Savolingiz qabul qilindi! Menga Fizika masalalari, formulalar, IELTS Speaking/Writing mezonlari yoki imtihon savollari bo'yicha istalgan mavzuni yozing, tushuntirib beraman.`;
  }
}

function clearTutorChat() {
  const chatBox = document.getElementById('tutor-messages-box');
  chatBox.innerHTML = `
    <div class="chat-bubble ai-bubble">
      Chat tozalandi. Qanday yangi savol yoki mavzuni o'rganamiz?
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
