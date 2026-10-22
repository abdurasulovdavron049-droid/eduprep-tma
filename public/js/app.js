/**
 * GoPrep.ai — Main Application Orchestrator
 * Controls navigation, views, sidebar toggling, Gemini AI integration, and state.
 */

let appState = {
  currentView: 'dashboard',
  xp: 450,
  streak: 5,
  soundEnabled: true
};

const viewTitles = {
  'dashboard': 'Boshqaruv paneli',
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

  // Telegram SDK sync if present
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
  appState.currentView = viewId;

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
