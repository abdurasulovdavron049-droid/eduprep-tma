/**
 * Vercel Serverless Function: /api/telegram
 * Handles Telegram Bot Webhooks 24/7 in the cloud with instant response.
 */

module.exports = async (req, res) => {
  // Health check for GET
  if (req.method !== 'POST') {
    return res.status(200).json({ 
      status: 'Telegram Webhook is Active', 
      service: 'GoPrep AI Cloud Bot',
      version: '2.0.0'
    });
  }

  const WEBAPP_URL = process.env.WEBAPP_URL || 'https://eduprep-tma.vercel.app';

  let update = req.body;
  if (typeof update === 'string') {
    try {
      update = JSON.parse(update);
    } catch (e) {
      update = null;
    }
  }

  if (!update) {
    return res.status(200).json({ ok: true });
  }

  // 1. Handle Callback Query (inline button click)
  if (update.callback_query) {
    const cb = update.callback_query;
    return res.status(200).json({
      method: 'answerCallbackQuery',
      callback_query_id: cb.id,
      text: 'GoPrep AI platformasiga xush kelibsiz!'
    });
  }

  // 2. Handle Message
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat?.id;
    const text = (msg.text || '').trim();
    const userName = msg.from?.first_name || 'foydalanuvchi';

    if (text.startsWith('/start')) {
      const welcomeText = `Assalomu alaykum, <b>${userName}</b>! 🎓\n\n<b>GoPrep.gg AI</b> — IELTS Speaking & Writing hamda Fizika fanlari bo'yicha sun'iy intellekt repetitoringizga xush kelibsiz!\n\n🔥 <b>Preppy Voice Call:</b> Olov sochli AI bilan jonli ovozli suhbat\n🎙️ <b>IELTS Speaking:</b> Part 1, 2 Cue Card (taymer bilan) va Part 3\n✍️ <b>IELTS Writing Studio:</b> 4 ta rasmiy mezon va Band 9 tahlil\n⚛️ <b>Fizika AI Solver:</b> Masalalarni qadamma-qadam yechish va DTM/SAT testlar\n\nQuyidagi tugmani bosing va platformani oching 👇`;

      // Instant Telegram Webhook response (0ms latency)
      return res.status(200).json({
        method: 'sendMessage',
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
                web_app: { url: WEBAPP_URL }
              }
            ]
          ]
        }
      });
    }

    // Default reply for any other message
    const replyText = `Salom, <b>${userName}</b>! 🎓\n\nGoPrep interaktiv darslari, olov sochli Preppy bilan jonli ovozli muloqot va fizika laboratoriyasini ochish uchun quyidagi tugmani bosing:`;

    return res.status(200).json({
      method: 'sendMessage',
      chat_id: chatId,
      text: replyText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 GoPrep Mini Appni ochish',
              web_app: { url: WEBAPP_URL }
            }
          ]
        ]
      }
    });
  }

  return res.status(200).json({ ok: true });
};
