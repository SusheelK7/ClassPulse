const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const router = express.Router();

const PROMPT = `You are a precise timetable parser. Extract ALL classes from this timetable image.

CRITICAL TIMING RULES:
- Each column has a header showing time e.g. "02:00-03:00" or "14:00-15:00"
- startTime = LEFT side of column header
- endTime = RIGHT side of column header
- Do NOT shift times — read EXACTLY what the column header says
- If a class spans multiple columns, use start of first column and end of last column
- All times in 24-hour format

OUTPUT FORMAT RULES:
- Return ONLY a raw JSON array
- NO markdown, NO backticks, NO code blocks, NO explanation
- NO newlines inside string values
- All strings must use double quotes
- Every object must have all 8 fields

Required fields for each class:
day (Mo/Tu/We/Th/Fr/Sa/Su), startTime (HH:MM), endTime (HH:MM), subject (string), code (string or ""), room (string or ""), teacher (string or ""), color (one of: #3B82F6 #10B981 #8B5CF6 #F59E0B #EF4444 #06B6D4 #EC4899)

Output example:
[{"day":"Mo","startTime":"14:00","endTime":"17:00","subject":"Applied Physics Lab","code":"Ph111L","room":"Lab 1","teacher":"Yasir Arif","color":"#10B981"},{"day":"Tu","startTime":"08:00","endTime":"09:00","subject":"Mathematics","code":"MA101","room":"C-201","teacher":"Dr. Ali","color":"#3B82F6"}]`;

function cleanAndParseJSON(raw) {
  if (!raw) return null;

  // Remove markdown code blocks
  let clean = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Extract array from text
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) return null;

  let jsonStr = match[0];

  // Fix common JSON issues
  jsonStr = jsonStr
    // Remove trailing commas before ] or }
    .replace(/,\s*]/g, ']')
    .replace(/,\s*}/g, '}')
    // Fix single quotes to double quotes
    .replace(/'/g, '"')
    // Remove any control characters
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    // Fix multiple spaces
    .replace(/\s+/g, ' ');

  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Last resort: extract individual objects
  try {
    const objects = [];
    const objMatches = jsonStr.match(/\{[^{}]+\}/g);
    if (objMatches) {
      for (const obj of objMatches) {
        try {
          const parsed = JSON.parse(obj);
          if (parsed.day && parsed.startTime && parsed.subject) {
            objects.push(parsed);
          }
        } catch {}
      }
    }
    if (objects.length > 0) return objects;
  } catch {}

  return null;
}

async function tryGroq(imageBase64, mimeType, apiKey) {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are a timetable parser. You output ONLY valid JSON arrays. Never use markdown. Never use code blocks. Output raw JSON only.'
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } },
            { type: 'text', text: PROMPT }
          ]
        }
      ],
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
      console.log('Groq raw response:', raw.substring(0, 200));
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error('Groq failed:', msg);
      return res.status(500).json({ message: 'AI extraction failed: ' + msg });
    }

    const classes = cleanAndParseJSON(raw);

    if (!classes || classes.length === 0) {
      console.error('Failed to parse:', raw.substring(0, 500));
      return res.status(500).json({
        message: 'Could not read timetable. Please try with a clearer, higher resolution image.'
      });
    }

    // Ensure all required fields exist
    const normalized = classes.map(c => ({
      day: c.day || 'Mo',
      startTime: c.startTime || '08:00',
      endTime: c.endTime || '09:00',
      subject: c.subject || 'Unknown',
      code: c.code || '',
      room: c.room || '',
      teacher: c.teacher || '',
      color: c.color || '#3B82F6'
    }));

    res.json({ classes: normalized, count: normalized.length, model: 'groq:llama-4-scout' });
  } catch (err) {
    console.error('AI extraction error:', err.response?.data || err.message);
    res.status(500).json({ message: 'AI extraction failed: ' + (err.response?.data?.error?.message || err.message) });
  }
});

module.exports = router;