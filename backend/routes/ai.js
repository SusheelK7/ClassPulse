const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const { normalizeTimetableClasses } = require('../utils/timetableNormalize');
const { parseAiJsonArray } = require('../utils/parseAiJson');
const router = express.Router();

const PROMPT = `You are a university weekly timetable parser. Extract one JSON object per real class block in the grid.

Return ONLY a valid JSON array. No markdown, no backticks, no explanation.

CRITICAL RULES:
1. Count only filled timetable cells/blocks. Skip empty cells completely.
2. Ignore column headers and time labels. Never output a class whose subject is only a time range.
3. Merged cells that span multiple hour columns are ONE class with the full time range.
   Example: a lab from 14:00 to 17:00 must be ONE entry, NOT three 1-hour entries.
4. Multi-line text inside one cell is still ONE class. Do not split wrapped subject lines.
5. If both 02:00-03:00 and 14:00-15:00 appear in headers, use the afternoon 24-hour times (14:00-21:00 range).
6. Separate 1-hour lecture cells stay separate even if the same course appears on the same day.
7. Do not duplicate the same class block.

JSON FORMAT RULES (IMPORTANT):
- Use only straight double quotes "
- Escape any double quote inside a value as \\"
- Keep every value on a single line (no line breaks inside strings)
- No trailing commas
- Output must be valid JSON that JSON.parse can read

Each object must have exactly these fields:
- day: short day code only: Mo Tu We Th Fr Sa Su
- startTime: 24hr format e.g. "14:00"
- endTime: 24hr format e.g. "17:00"
- subject: full subject/course name without leading period numbers like "1-" or "2-"
- code: course code if visible, else ""
- room: room or lab code if visible, else ""
- teacher: teacher name if visible, else ""
- color: pick one from ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#06B6D4","#EC4899"]

Example for a 3-hour merged lab cell:
[{"day":"Mo","startTime":"14:00","endTime":"17:00","subject":"Application of Information and Communication Technologies Lab","code":"CS181L","room":"Lab 11","teacher":"Ms. Nimra Shafqat","color":"#10B981"}]`;

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

    let rawClasses;
    try {
      rawClasses = parseAiJsonArray(raw);
    } catch (parseErr) {
      console.error('JSON parse failed. AI output preview:', raw.slice(0, 500));
      return res.status(500).json({ message: 'Could not parse timetable JSON. Please try again.' });
    }

    if (!Array.isArray(rawClasses) || rawClasses.length === 0) {
      return res.status(500).json({ message: 'No classes found in image. Try a clearer photo.' });
    }

    const { classes, rawCount, normalizedCount } = normalizeTimetableClasses(rawClasses);
    if (classes.length === 0) {
      return res.status(500).json({ message: 'No valid classes found after parsing. Try a clearer photo.' });
    }

    console.log(`Timetable normalized: ${rawCount} raw -> ${normalizedCount} classes`);
    res.json({ classes, count: classes.length, rawCount, model: 'groq:llama-4-scout' });
  } catch (err) {
    console.error('AI extraction error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI extraction failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

module.exports = router;