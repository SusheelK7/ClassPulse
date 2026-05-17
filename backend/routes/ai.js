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

async function tryGroq(imageBase64, mimeType, apiKey) {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
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
        'Content-Type': 'application/json'
      },
      timeout: 30000
    }
  );
  return response.data?.choices?.[0]?.message?.content || '';
}

router.post('/extract-timetable', auth, async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) return res.status(400).json({ message: 'Image data required' });

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({
        message: 'GROQ_API_KEY not configured. Get a free key from console.groq.com and add it to Railway variables.'
      });
    }

    console.log('Trying Groq vision...');
    let raw = '';

    try {
      raw = await tryGroq(imageBase64, mimeType, groqKey);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error('Groq failed:', msg);
      return res.status(500).json({ message: 'AI extraction failed: ' + msg });
    }

    if (!raw) {
      return res.status(500).json({ message: 'AI returned empty response. Try again with a clearer image.' });
    }

    // Clean and parse JSON
    const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) {
      return res.status(500).json({ message: 'Could not parse timetable. Make sure the image is clear and readable.' });
    }

    const classes = JSON.parse(match[0]);
    if (!Array.isArray(classes) || classes.length === 0) {
      return res.status(500).json({ message: 'No classes found in image. Try a clearer photo.' });
    }

    res.json({ classes, count: classes.length, model: 'groq:llama-4-scout' });
  } catch (err) {
    console.error('AI extraction error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI extraction failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

module.exports = router;