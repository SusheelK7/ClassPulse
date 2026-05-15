export const DAY_NAMES = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
export const DAY_SHORT = ['Mo','Tu','We','Th','Fr','Sa','Su'];

export function getCurrentDay() {
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  return days[new Date().getDay()];
}

export function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
}

export function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

export function classStatus(cls, currentDay, currentMinutes) {
  if (cls.day !== currentDay) return 'other';
  const start = timeToMinutes(cls.startTime);
  const end = timeToMinutes(cls.endTime);
  if (currentMinutes >= start && currentMinutes < end) return 'current';
  if (currentMinutes < start) return 'upcoming';
  return 'ended';
}

export function minutesUntil(timeStr, currentMinutes) {
  return timeToMinutes(timeStr) - currentMinutes;
}

export function durationMinutes(start, end) {
  return timeToMinutes(end) - timeToMinutes(start);
}

export function progressPercent(start, end, current) {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);
  const pct = ((current - s) / (e - s)) * 100;
  return Math.min(100, Math.max(0, pct));
}
