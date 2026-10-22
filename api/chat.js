/**
 * Vercel Serverless Function: /api/chat
 * Proxy for Google Gemini API with fallback
 */

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, systemInstruction } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JhCfmZ-m7QIJ334Y13wugEnnW7z9SykLcPnuLpcPAUGg";

    const models = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let text = '';
    let lastError = null;

    for (const model of models) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const payload = {
          contents: [{ parts: [{ text: prompt }] }]
        };
        if (systemInstruction) {
          payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const apiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) break;
        } else {
          lastError = await apiRes.text();
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!text) {
      return res.status(502).json({ error: 'Gemini API Error', details: lastError });
    }

    return res.status(200).json({ ok: true, text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
