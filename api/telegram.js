/**
 * Vercel Serverless Function: /api/telegram
 * Handles Telegram Bot Webhooks 24/7 in the cloud without needing a local PC.
 */

const https = require('node:https');

module.exports = async (req, res) => {
  // Health check for GET
  if (req.method !== 'POST') {
    return res.status(200).json({ 
      status: 'Telegram Webhook is Active', 
      service: 'GoPrep AI Cloud Bot' 
    });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN || '8879545676:AAHDJlH844IYcE44GfgASUpb2FVmZTMj5e0';
  const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduprep-tma.vercel.app';

  const update = req.body;
  if (!update) {
    return res.status(200).json({ ok: true });
  }

  // Handle Callback query
  if (update.callback_query) {
    const cb = update.callback_query;
    await sendTelegram('answerCallbackQuery', { callback_query_id: cb.id }, BOT_TOKEN);
    return res.status(200).json({ ok: true });
  }

  // Handle Message
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const text = (msg.text || '').trim();
    const userName = msg.from?.first_name || 'foydalanuvchi';

    if (text.startsWith('/start')) {
      const welcomeText = `Assalomu alaykum, <b>${userName}</b>! 🎓\n\n<b>GoPrep.gg AI</b> — IELTS Speaking & Writing hamda Fizika fanlari bo'yicha sun'iy intellekt repetitoringizga xush kelibsiz!\n\n🔥 <b>Preppy Voice Call:</b> Olov sochli AI bilan jonli ovozli suhbat\n🎙️ <b>IELTS Speaking:</b> Part 1, 2 Cue Card (taymer bilan) va Part 3\n✍️ <b>IELTS Writing Studio:</b> 4 ta rasmiy mezon va Band 9 tahlil\n⚛️ <b>Fizika AI Solver:</b> Masalalarni qadamma-qadam yechish va DTM/SAT testlar\n\nQuyidagi tugmani bosing va platformani oching 👇`;

      const payload = {
        chat_id: chatId,
        text: welcomeText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 GoPrep AI (Mini App)',
                web_app: { url: WEBAPP_URL }
              }
            ],
            [
              {
                text: '🔥 Preppy bilan Ovozli Muloqot',
                web_app: { url: `${WEBAPP_URL}` }
              }
            ]
          ]
        }
      };

      await sendTelegram('sendMessage', payload, BOT_TOKEN);
    }
  }

  return res.status(200).json({ ok: true });
};

function sendTelegram(method, payload, token) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(payload);
    const req = https.request(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', () => resolve(null));
    req.write(postData);
    req.end();
  });
}
