const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

const PROMPT = `You are a timetable parser. Extract ALL classes from this timetable image.
Return ONLY a valid JSON array. No markdown, no backticks, no explanation, no extra text at all.
Each object must have exactly these fields:
- day: short day code only: Mo Tu We Th Fr Sa Su
- startTime: 24hr format e.g. "08:00"
- endTime: 24hr format e.g. "09:00"
- subject: full subject/course name
- code: course code if visible, else ""
- room: room or lab code if visible, else ""
- teacher: teacher name if visible, else ""
- color: pick one from ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#06B6D4","#EC4899"]

Example:
[{"day":"Mo","startTime":"14:00","endTime":"17:00","subject":"Applied Physics Lab","code":"Ph111L","room":"Lab 1","teacher":"Yasir Arif","color":"#10B981"}]`;

// Try Gemini models in order
const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

async function tryGemini(model, imageBase64, mimeType, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await axios.post(url, {
    contents: [{
      parts: [
        { inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } },
        { text: PROMPT }
      ]
    }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 4000 }
  }, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });
  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Try OpenRouter as backup
async function tryOpenRouter(imageBase64, mimeType, apiKey) {
  const models = [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.2-11b-vision-instruct:free',
    'qwen/qwen2-vl-7b-instruct:free',
  ];
  for (const model of models) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } },
              { type: 'text', text: PROMPT }
            ]
          }],
          max_tokens: 4000,
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://classpulse-red.vercel.app',
            'X-Title': 'ClassPulse'
          },
          timeout: 30000
        }
      );
      const text = response.data?.choices?.[0]?.message?.content || '';
      if (text && text.includes('[')) return text;
    } catch (e) {
      console.log(`OpenRouter model ${model} failed:`, e.response?.data?.error?.message || e.message);
      continue;
    }
  }
  return '';
}

router.post('/extract-timetable', auth, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image data required' });

    const geminiKey = process.env.GEMINI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    let raw = '';
    let usedModel = '';

    // Try Gemini first if key exists
    if (geminiKey) {
      for (const model of GEMINI_MODELS) {
        try {
          console.log(`Trying Gemini model: ${model}`);
          raw = await tryGemini(model, imageBase64, mimeType, geminiKey);
          if (raw && raw.includes('[')) {
            usedModel = `gemini:${model}`;
            console.log(`Success with Gemini model: ${model}`);
            break;
          }
        } catch (err) {
          const status = err.response?.status;
          const msg = err.response?.data?.error?.message || err.message;
          console.log(`Gemini ${model} failed (${status}): ${msg}`);
          if (status === 401 || status === 403) break; // bad key, stop trying
          continue;
        }
      }
    }

    // Try OpenRouter as backup
    if (!raw && openrouterKey) {
      console.log('Trying OpenRouter...');
      raw = await tryOpenRouter(imageBase64, mimeType, openrouterKey);
      if (raw) usedModel = 'openrouter';
    }

    if (!raw) {
      return res.status(500).json({
        message: 'AI extraction failed. Please add a GEMINI_API_KEY from aistudio.google.com to Railway variables.'
      });
    }

    // Clean and parse JSON
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ message: 'Could not read timetable. Try a clearer image.' });

    const classes = JSON.parse(match[0]);
    if (!Array.isArray(classes) || classes.length === 0) {
      return res.status(500).json({ message: 'No classes found. Try a clearer image.' });
    }

    res.json({ classes, count: classes.length, model: usedModel });
  } catch (err) {
    console.error('AI extraction error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI extraction failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

module.exports = router;