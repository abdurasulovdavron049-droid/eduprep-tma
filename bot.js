/**
 * Telegram Bot for EduPrep Mini App
 * Uses Inline Keyboard Buttons (tugma ichidagi havolalar), fast DNS, and Gemini 2.5 Flash AI.
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const dns = require('node:dns');

// Instant DNS resolver for Telegram API (bypasses slow local IPv6 timeouts)
function customLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (hostname === 'api.telegram.org') {
    if (options && options.all) {
      return callback(null, [{ address: '149.154.166.110', family: 4 }]);
    }
    return callback(null, '149.154.166.110', 4);
  }
  dns.lookup(hostname, options, callback);
}

const envPath = path.join(__dirname, '.env');

function loadEnv() {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && !process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim();
        }
      }
    }
  }
}
loadEnv();

let BOT_TOKEN = process.env.BOT_TOKEN;
let WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduprep.app';
let GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function updateEnvUrl(newUrl) {
  try {
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('WEBAPP_URL=')) {
        content = content.replace(/WEBAPP_URL=.*/, `WEBAPP_URL=${newUrl}`);
      } else {
        content += `\nWEBAPP_URL=${newUrl}\n`;
      }
      fs.writeFileSync(envPath, content);
    }
  } catch (e) {
    console.error('.env yangilashda xatolik:', e.message);
  }
}

if (!BOT_TOKEN) {
  console.error('❌ XATOLIK: BOT_TOKEN topilmadi.');
  process.exit(1);
}

// Fast HTTPS API request
function apiRequest(method, payload = {}) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(payload);
    const req = https.request(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      lookup: customLookup,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (!json.ok) {
            console.warn(`⚠️ Telegram API rad etdi (${method}):`, json.description || data);
          }
          resolve(json);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      if (method !== 'getUpdates') {
        console.error(`Telegram API xatosi (${method}):`, err.code || err.message);
      }
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// Gemini Flash AI query with auto-fallback
async function askGemini(userPrompt, systemInstruction) {
  if (!GEMINI_API_KEY) return null;
  const models = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }]
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
    } catch (e) {
      console.debug(`Gemini API query error (${model}):`, e.message);
    }
  }
  return null;
}

async function startPolling() {
  console.log('🔄 Telegram API bilan aloqa o\'rnatilmoqda...');
  
  const botInfo = await apiRequest('getMe');
  if (botInfo && botInfo.ok) {
    console.log(`=========================================`);
    console.log(`✅ Telegram Bot muvaffaqiyatli ulandi!`);
    console.log(`🤖 Bot nomi: @${botInfo.result.username} (${botInfo.result.first_name})`);
    console.log(`🧠 Gemini AI: ${GEMINI_API_KEY ? 'Faol ✅' : 'Yo\'q ❌'}`);
    console.log(`🌐 WebApp URL: ${WEBAPP_URL}`);
    console.log(`=========================================`);
    console.log(`🟢 Bot tayyor! Xabarlar qabul qilinmoqda...`);
  } else {
    console.warn('⚠️ Telegram serveriga ulanish kutilmoqda...');
  }

  let offset = 0;

  while (true) {
    try {
      const data = await apiRequest('getUpdates', {
        offset: offset,
        timeout: 0
      });

      if (data && data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          await handleUpdate(update);
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function handleUpdate(update) {
  // A) Handle Inline Button Clicks (Callback Query)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    const data = cb.data;
    const userName = cb.from.first_name || 'foydalanuvchi';

    await apiRequest('answerCallbackQuery', { callback_query_id: cb.id });

    if (data === 'btn_physics') {
      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: `⚛️ <b>Fizika Masala Yechuvchi AI:</b>\n\nIstalgan fizika masalasining matnini shu yerga yozib yuboring! Masalan:\n<i>"Massasi 2 kg bo'lgan jism 20 m balandlikdan tushmoqda. Yerga urilish paytidagi tezligini toping."</i>\n\nGemini AI uni formulalar va qadam-baqadam yechim bilan tushuntirib beradi!`,
        parse_mode: 'HTML'
      });
    } else if (data === 'btn_english') {
      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: `🇬🇧 <b>English Master AI:</b>\n\nInglizcha insho yoki matningizni yuboring. AI grammatika, leksika tahlili va IELTS taxminiy ballini chiqarib beradi!`,
        parse_mode: 'HTML'
      });
    } else if (data === 'btn_info') {
      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: `ℹ️ <b>Havolani o'zgartirish:</b>\n\nAgar yangi HTTPS havolangiz bo'lsa, botga shunchaki quyidagicha yuboring:\n<code>/seturl https://sizning-havolangiz.link</code>\n\nBot uni avtomatik tugma ichiga joylab beradi!`,
        parse_mode: 'HTML'
      });
    }
    return;
  }

  // B) Handle Incoming Text Messages
  if (!update.message || !update.message.text) return;

  const chatId = update.message.chat.id;
  const text = update.message.text.trim();
  const userName = update.message.from.first_name || 'foydalanuvchi';

  console.log(`📩 Yangi xabar keldi: [${userName}] "${text}"`);

  // 1. Command: /seturl <https://...>
  if (text.startsWith('/seturl')) {
    const parts = text.split(/\s+/);
    if (parts.length > 1 && parts[1].startsWith('https://')) {
      WEBAPP_URL = parts[1].trim();
      updateEnvUrl(WEBAPP_URL);
      console.log(`🔄 Yangi WEBAPP_URL o'rnatildi: ${WEBAPP_URL}`);

      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: `✅ <b>Havola muvaffaqiyatli saqlandi va tugma ichiga joylandi!</b>\n\nManzil: <code>${WEBAPP_URL}</code>\n\nQuyidagi tugmani bosing va platformani oching 👇`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Platformani ochish (Mini App)',
                web_app: { url: WEBAPP_URL }
              }
            ]
          ]
        }
      });
      return;
    } else {
      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: `⚠️ <b>Xato format!</b>\nIltimos, havolani quyidagicha yuboring:\n<code>/seturl https://sizning-havolangiz.link</code>`,
        parse_mode: 'HTML'
      });
      return;
    }
  }

  // 2. Command: /start
  if (text.startsWith('/start')) {
    const welcomeMessage = `
Assalomu alaykum, <b>${userName}</b>! 🎓

<b>EduPrep AI</b> — Fizika va Ingliz tili fanlarini sun'iy intellekt (Gemini 2.5 Flash) yordamida o'rgatuvchi shaxsiy AI repetitoringizga xush kelibsiz!

<b>Platforma imkoniyatlari:</b>
⚛️ <b>Fizika:</b> Masalalarni qadamma-qadam yechish va DTM/SAT testlari
🎙️ <b>O'zbekcha Suhbat:</b> Fizika professori bilan jonli o'zbekcha suhbat
🇬🇧 <b>Ingliz tili:</b> AI bilan IELTS Speaking va Writing tekshiruvi
🚀 <b>Physics in English:</b> Xalqaro atamalar va SAT savollari
🤖 <b>AI Shaxsiy Ustoz:</b> 24/7 savol-javob

Quyidagi tugmani bosib platformani ochishingiz mumkin 👇
    `;

    // Construct Inline Keyboard with Button Link
    let inlineKeyboard = [];

    if (WEBAPP_URL && WEBAPP_URL.startsWith('https://')) {
      inlineKeyboard.push([
        {
          text: '🚀 Platformani ochish (Mini App)',
          web_app: { url: WEBAPP_URL }
        }
      ]);
    } else {
      inlineKeyboard.push([
        {
          text: '⚙️ Havolani sozlash (/seturl)',
          callback_data: 'btn_info'
        }
      ]);
    }

    inlineKeyboard.push([
      { text: '⚛️ Fizika Masalalari', callback_data: 'btn_physics' },
      { text: '🇬🇧 English AI', callback_data: 'btn_english' }
    ]);

    const res = await apiRequest('sendMessage', {
      chat_id: chatId,
      text: welcomeMessage,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    });

    if (res && res.ok) {
      console.log(`✅ /start javobi yuborildi: [${userName}]`);
    }
    return;
  }

  // 3. Any other message -> Answered by Gemini 2.5 Flash
  console.log(`🧠 Gemini AI javob tayyorlamoqda: "${text}"`);

  await apiRequest('sendChatAction', {
    chat_id: chatId,
    action: 'typing'
  });

  const sysInstruction = `Sen Fizika va Ingliz tili fanlari bo'yicha professional repetitor va professorsan. Isming EduPrep AI. 
Foydalanuvchiga do'stona, aniq, ilmiy va tushunarli qilib o'zbek tilida javob ber. Formatlashda sodda HTML teglari (<b>, <i>, <code>) dan foydalan.`;

  const aiReply = await askGemini(text, sysInstruction);

  if (aiReply) {
    const res = await apiRequest('sendMessage', {
      chat_id: chatId,
      text: aiReply,
      parse_mode: 'HTML'
    });
    if (res && res.ok) console.log(`✅ Gemini javobi yuborildi: [${userName}]`);
  } else {
    await apiRequest('sendMessage', {
      chat_id: chatId,
      text: `Salom, <b>${userName}</b>! Savolingiz qabul qilindi. Bosh menyuga qaytish uchun /start bosing.`,
      parse_mode: 'HTML'
    });
  }
}

// Start web server automatically if not already started
try {
  require('./server.js');
} catch (e) {}

startPolling();
