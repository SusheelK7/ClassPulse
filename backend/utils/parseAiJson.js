function sanitizeJsonText(text) {
  return String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/,\s*([}\]])/g, '$1')
    .trim();
}

function extractJsonArray(text) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function repairUnescapedQuotes(json) {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const char = json[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      if (!inString) {
        inString = true;
        result += char;
        continue;
      }

      const rest = json.slice(i + 1);
      if (/^\s*([,:}\]])/.test(rest)) {
        inString = false;
        result += char;
      } else {
        result += '\\"';
      }
      continue;
    }

    if (inString && (char === '\n' || char === '\r')) {
      result += ' ';
      continue;
    }

    result += char;
  }

  return result;
}

function tryParseArray(text) {
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseObjectsIndividually(text) {
  const objects = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        const chunk = text.slice(start, i + 1);
        const repaired = repairUnescapedQuotes(sanitizeJsonText(chunk));
        const parsed = tryParseArray(`[${repaired}]`);
        if (parsed?.[0] && typeof parsed[0] === 'object') objects.push(parsed[0]);
        start = -1;
      }
    }
  }

  return objects;
}

function parseAiJsonArray(raw) {
  const clean = sanitizeJsonText(raw);
  const arrayText = extractJsonArray(clean) || clean;

  const attempts = [
    arrayText,
    repairUnescapedQuotes(arrayText),
    repairUnescapedQuotes(sanitizeJsonText(repairUnescapedQuotes(arrayText))),
  ];

  for (const attempt of attempts) {
    const parsed = tryParseArray(attempt);
    if (parsed?.length) return parsed;
  }

  const fallback = parseObjectsIndividually(arrayText);
  if (fallback.length) return fallback;

  throw new Error('Could not parse AI response as JSON');
}

module.exports = { parseAiJsonArray, sanitizeJsonText, repairUnescapedQuotes };
