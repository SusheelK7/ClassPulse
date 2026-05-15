const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

// Free vision-capable models on OpenRouter (tried in order)
const MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-flash-1.5-8b-exp',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'qwen/qwen2-vl-7b-instruct:free',
];

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

async function tryModel(model, imageBase64, mimeType, apiKey) {
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
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'ClassPulse'
      }
    }
  );
  return response.data?.choices?.[0]?.message?.content || '';
}

router.post('/extract-timetable', auth, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image data required' });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'OpenRouter API key not configured. Add OPENROUTER_API_KEY to your .env file.' });

    let raw = '';
    let usedModel = '';

    for (const model of MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        raw = await tryModel(model, imageBase64, mimeType, apiKey);
        if (raw && raw.trim().startsWith('[')) {
          usedModel = model;
          console.log(`Success with: ${model}`);
          break;
        }
      } catch (err) {
        const status = err.response?.status;
        const msg = err.response?.data?.error?.message || err.message;
        console.log(`Model ${model} failed (${status}): ${msg}`);
        // Stop on auth errors, continue on model errors
        if (status === 401 || status === 403) {
          return res.status(500).json({ message: 'Invalid OpenRouter API key. Check your key at openrouter.ai/keys' });
        }
        continue;
      }
    }

    if (!raw) {
      return res.status(500).json({ message: 'All models failed. Please check your OpenRouter API key at openrouter.ai/keys and try again.' });
    }

    // Clean and parse JSON
    const clean = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Extract JSON array if there's extra text around it
    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ message: 'Could not read timetable. Make sure the image is clear.' });

    const classes = JSON.parse(match[0]);
    if (!Array.isArray(classes) || classes.length === 0) {
      return res.status(500).json({ message: 'No classes found in image. Try a clearer photo.' });
    }

    res.json({ classes, count: classes.length, model: usedModel });
  } catch (err) {
    console.error('AI extraction error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI extraction failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

module.exports = router;