/**
 * Dual Module: Physics in English
 * Science Glossary and International Exam (SAT / AP Physics) practice.
 */

const scienceGlossary = [
  {
    term: "Velocity",
    transcription: "/vəˈlɒs.ə.ti/",
    uzbek: "Tezlik (vektor kattalik)",
    definition: "The speed of something in a given direction (vector quantity: v = Δx / Δt).",
    example: "Unlike speed, velocity accounts for direction."
  },
  {
    term: "Acceleration",
    transcription: "/əkˌsel.əˈreɪ.ʃən/",
    uzbek: "Tezlanish",
    definition: "The rate at which an object changes its velocity over time (a = Δv / Δt).",
    example: "The acceleration due to gravity on Earth is approximately 9.8 m/s²."
  },
  {
    term: "Inertia",
    transcription: "/ɪˈnɜː.ʃə/",
    uzbek: "Inersiya (inersionlik)",
    definition: "The resistance of any physical object to any change in its velocity or state of rest.",
    example: "Mass is a quantitative measure of an object's inertia."
  },
  {
    term: "Momentum",
    transcription: "/məˈmen.təm/",
    uzbek: "Impuls (harakat miqdori)",
    definition: "The quantity of motion of a moving body, measured as a product of its mass and velocity (p = m · v).",
    example: "In an isolated system, total momentum is conserved during collisions."
  },
  {
    term: "Entropy",
    transcription: "/ˈen.trə.pi/",
    uzbek: "Entropiya",
    definition: "A thermodynamic quantity representing the unavailability of a system's thermal energy for conversion into mechanical work, often interpreted as the degree of disorder.",
    example: "According to the Second Law of Thermodynamics, total entropy always increases."
  }
];

const satPhysicsQuestions = [
  {
    title: "SAT Physics: Projectile Motion",
    question: "A ball is thrown horizontally from the top of a 45-meter-high cliff with an initial speed of 15 m/s. Neglecting air resistance, what is the horizontal distance (range) traveled before it strikes the ground? (Use g = 10 m/s²)",
    options: [
      "A) 15 m",
      "B) 30 m",
      "C) 45 m",
      "D) 60 m"
    ],
    answer: "C) 45 m",
    solution: "1. Vertical motion: h = (1/2) · g · t² => 45 = 5 · t² => t² = 9 => t = 3 seconds.<br>2. Horizontal distance: Range = v_horizontal · t = 15 m/s · 3 s = 45 meters."
  },
  {
    title: "AP Physics: Conservation of Energy",
    question: "A block of mass 4 kg slides down a frictionless incline from a vertical height of 5 meters. What is the kinetic energy of the block at the bottom of the incline?",
    options: [
      "A) 20 J",
      "B) 100 J",
      "C) 200 J",
      "D) 400 J"
    ],
    answer: "C) 200 J",
    solution: "By the Law of Conservation of Energy: Initial Potential Energy (E_p) = Final Kinetic Energy (E_k).<br>E_k = m · g · h = 4 kg · 10 m/s² · 5 m = 200 Joules."
  }
];

function openDualSection(section) {
  TelegramApp.haptic('selection');
  const container = document.getElementById('dual-dynamic-content');
  if (!container) return;

  if (section === 'glossary') {
    container.innerHTML = `
      <div class="section-title">
        <h3>📖 Science Glossary (Inglizcha-O'zbekcha)</h3>
        <span class="subtitle">Xalqaro darsliklarda eng ko'p uchraydigan terminlar</span>
      </div>
      <div class="vocab-cards-grid">
        ${scienceGlossary.map(item => `
          <div class="vocab-card">
            <div class="vocab-top">
              <div class="vocab-word" style="color: var(--accent-amber);">${item.term}</div>
              <div class="vocab-pos">${item.transcription}</div>
            </div>
            <div class="vocab-definition">🇺🇿 ${item.uzbek}</div>
            <p style="font-size: 0.82rem; margin: 6px 0; color: #e2e8f0;">${item.definition}</p>
            <div class="vocab-example">"<i>${item.example}</i>"</div>
            <button class="voice-play-btn" style="color: var(--accent-amber);" onclick="speakText('${item.term}. ${item.definition.replace(/'/g, "\\'")}')">🔊 Audio talaffuz</button>
          </div>
        `).join('')}
      </div>
    `;
  } else if (section === 'sat-questions') {
    container.innerHTML = `
      <div class="section-title">
        <h3>🎯 SAT & AP Physics Practice</h3>
        <span class="subtitle">Ingliz tilidagi xalqaro imtihon savollari</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${satPhysicsQuestions.map((q, idx) => `
          <div class="card">
            <span class="tag-gold" style="margin-bottom: 8px; display: inline-block;">${q.title}</span>
            <p style="font-weight: 600; font-size: 0.9rem; margin-bottom: 10px;">${q.question}</p>
            <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 10px;">
              ${q.options.map(o => `<div>${o}</div>`).join('')}
            </div>
            <button class="btn btn-primary" style="background: var(--grad-dual); padding: 8px;" onclick="toggleSatSolution(${idx})">
              Yechimni ko'rish
            </button>
            <div id="sat-sol-${idx}" class="solution-card hidden" style="margin-top: 10px; border-color: rgba(251, 191, 36, 0.4);">
              <div class="badge-success" style="background: rgba(251, 191, 36, 0.2); color: var(--accent-amber);">To'g'ri javob: ${q.answer}</div>
              <div style="margin-top: 8px; font-size: 0.82rem; color: #e2e8f0;">${q.solution}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function toggleSatSolution(idx) {
  TelegramApp.haptic('light');
  const el = document.getElementById(`sat-sol-${idx}`);
  if (el) {
    el.classList.toggle('hidden');
  }
}
