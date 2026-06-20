const VALID_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DAY_ALIASES = {
  monday: 'Mo', mon: 'Mo', mo: 'Mo',
  tuesday: 'Tu', tue: 'Tu', tu: 'Tu',
  wednesday: 'We', wed: 'We', we: 'We',
  thursday: 'Th', thu: 'Th', th: 'Th',
  friday: 'Fr', fri: 'Fr', fr: 'Fr',
  saturday: 'Sa', sat: 'Sa', sa: 'Sa',
  sunday: 'Su', sun: 'Su', su: 'Su',
};
const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

function timeToMinutes(t) {
  const [h, m] = String(t).split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function normalizeDay(day) {
  if (!day) return null;
  const key = String(day).trim().toLowerCase().replace(/\./g, '');
  if (VALID_DAYS.includes(day)) return day;
  return DAY_ALIASES[key] || DAY_ALIASES[key.slice(0, 3)] || null;
}

function normalizeTime(raw) {
  if (!raw) return '';
  let t = String(raw).trim().toUpperCase();
  const pm = /\bPM\b/.test(t);
  const am = /\bAM\b/.test(t);
  t = t.replace(/\s*(AM|PM)\s*/g, '');
  const parts = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!parts) return raw;
  let h = parseInt(parts[1], 10);
  const m = parseInt(parts[2], 10);
  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function fixAfternoonShift(startTime, endTime) {
  const startH = Math.floor(timeToMinutes(startTime) / 60);
  const endH = Math.floor(timeToMinutes(endTime) / 60);
  if (startH >= 2 && startH <= 9 && endH >= 2 && endH <= 10) {
    return {
      startTime: minutesToTime(timeToMinutes(startTime) + 720),
      endTime: minutesToTime(timeToMinutes(endTime) + 720),
    };
  }
  return { startTime, endTime };
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeSubject(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeCode(value) {
  return normalizeText(value).replace(/[()]/g, '').toLowerCase();
}

function isLabClass(cls) {
  const code = normalizeCode(cls.code);
  const subject = normalizeSubject(cls.subject);
  return /lab/.test(subject) || /l$/.test(code);
}

function looksLikeTimeSlot(text) {
  return /^\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}$/.test(normalizeText(text));
}

function isValidEntry(cls) {
  const subject = normalizeText(cls.subject);
  if (!subject || subject.length < 2) return false;
  if (looksLikeTimeSlot(subject)) return false;
  if (/^(break|lunch|empty|free|period)$/i.test(subject)) return false;
  if (!VALID_DAYS.includes(cls.day)) return false;
  if (!cls.startTime || !cls.endTime) return false;
  if (timeToMinutes(cls.startTime) >= timeToMinutes(cls.endTime)) return false;
  return true;
}

function entryKey(cls) {
  return [
    cls.day,
    cls.startTime,
    cls.endTime,
    normalizeCode(cls.code),
    normalizeSubject(cls.subject),
    normalizeSubject(cls.room),
  ].join('|');
}

function dedupeExact(classes) {
  const seen = new Set();
  return classes.filter((cls) => {
    const key = entryKey(cls);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeSameSlot(classes) {
  const groups = new Map();
  for (const cls of classes) {
    const key = `${cls.day}|${cls.startTime}|${cls.endTime}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(cls);
  }

  return [...groups.values()].map((group) =>
    group.reduce((best, cur) => ({
      ...best,
      subject: (cur.subject || '').length > (best.subject || '').length ? cur.subject : best.subject,
      code: best.code || cur.code || '',
      room: best.room || cur.room || '',
      teacher: best.teacher || cur.teacher || '',
      color: best.color || cur.color,
    }))
  );
}

function canMergeLabSegments(a, b) {
  if (a.day !== b.day) return false;
  if (normalizeCode(a.code) && normalizeCode(b.code) && normalizeCode(a.code) !== normalizeCode(b.code)) return false;
  if (normalizeSubject(a.subject) !== normalizeSubject(b.subject)) return false;

  const roomA = normalizeSubject(a.room);
  const roomB = normalizeSubject(b.room);
  if (roomA && roomB && roomA !== roomB) return false;

  const gap = timeToMinutes(b.startTime) - timeToMinutes(a.endTime);
  return gap >= 0 && gap <= 5;
}

function mergeSplitLabBlocks(classes) {
  const sorted = [...classes].sort((a, b) => {
    if (a.day !== b.day) return VALID_DAYS.indexOf(a.day) - VALID_DAYS.indexOf(b.day);
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  const merged = [];
  for (const cls of sorted) {
    const prev = merged[merged.length - 1];
    if (prev && isLabClass(prev) && isLabClass(cls) && canMergeLabSegments(prev, cls)) {
      prev.endTime = cls.endTime;
      prev.room = prev.room || cls.room;
      prev.teacher = prev.teacher || cls.teacher;
      prev.code = prev.code || cls.code;
      if ((cls.subject || '').length > (prev.subject || '').length) prev.subject = cls.subject;
      continue;
    }
    merged.push({ ...cls });
  }
  return merged;
}

function mergeOverlappingRanges(classes) {
  const sorted = [...classes].sort((a, b) => {
    if (a.day !== b.day) return VALID_DAYS.indexOf(a.day) - VALID_DAYS.indexOf(b.day);
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  const kept = [];
  for (const cls of sorted) {
    const duplicate = kept.find((existing) => {
      if (existing.day !== cls.day) return false;
      if (normalizeCode(existing.code) !== normalizeCode(cls.code)) return false;
      if (normalizeSubject(existing.subject) !== normalizeSubject(cls.subject)) return false;

      const aStart = timeToMinutes(existing.startTime);
      const aEnd = timeToMinutes(existing.endTime);
      const bStart = timeToMinutes(cls.startTime);
      const bEnd = timeToMinutes(cls.endTime);
      const aContainsB = aStart <= bStart && aEnd >= bEnd;
      const bContainsA = bStart <= aStart && bEnd >= aEnd;
      return aContainsB || bContainsA;
    });

    if (duplicate) {
      const existingDuration = timeToMinutes(duplicate.endTime) - timeToMinutes(duplicate.startTime);
      const newDuration = timeToMinutes(cls.endTime) - timeToMinutes(cls.startTime);
      if (newDuration > existingDuration) {
        duplicate.startTime = cls.startTime;
        duplicate.endTime = cls.endTime;
      }
      duplicate.room = duplicate.room || cls.room;
      duplicate.teacher = duplicate.teacher || cls.teacher;
      duplicate.code = duplicate.code || cls.code;
      continue;
    }
    kept.push({ ...cls });
  }
  return kept;
}

function normalizeClass(raw, index) {
  let startTime = normalizeTime(raw.startTime);
  let endTime = normalizeTime(raw.endTime);
  ({ startTime, endTime } = fixAfternoonShift(startTime, endTime));

  return {
    day: normalizeDay(raw.day),
    startTime,
    endTime,
    subject: normalizeText(raw.subject),
    code: normalizeText(raw.code),
    room: normalizeText(raw.room),
    teacher: normalizeText(raw.teacher),
    color: COLORS.includes(raw.color) ? raw.color : COLORS[index % COLORS.length],
  };
}

function normalizeTimetableClasses(rawClasses) {
  if (!Array.isArray(rawClasses)) return { classes: [], rawCount: 0, normalizedCount: 0 };

  const rawCount = rawClasses.length;
  const normalized = rawClasses
    .map((cls, index) => normalizeClass(cls, index))
    .filter(isValidEntry);

  let classes = dedupeExact(normalized);
  classes = dedupeSameSlot(classes);
  classes = mergeOverlappingRanges(classes);
  classes = mergeSplitLabBlocks(classes);
  classes = dedupeExact(classes);

  classes.sort((a, b) => {
    if (a.day !== b.day) return VALID_DAYS.indexOf(a.day) - VALID_DAYS.indexOf(b.day);
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  return { classes, rawCount, normalizedCount: classes.length };
}

module.exports = { normalizeTimetableClasses };
