export const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const DAY_FULL = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
export const DAY_SHORT_JS = { 0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa' };

export function getTodayKey() {
  return DAY_SHORT_JS[new Date().getDay()];
}

export function getCurrentTimeMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function formatTime12(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function classStatus(cls) {
  const today = getTodayKey();
  if (cls.day !== today) return 'other';
  const now = getCurrentTimeMinutes();
  const start = timeToMinutes(cls.startTime);
  const end = timeToMinutes(cls.endTime);
  if (now < start) return 'upcoming';
  if (now >= start && now < end) return 'current';
  return 'past';
}

export function getProgressPercent(cls) {
  const now = getCurrentTimeMinutes();
  const start = timeToMinutes(cls.startTime);
  const end = timeToMinutes(cls.endTime);
  if (now < start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function getTimeUntil(timeStr) {
  const now = getCurrentTimeMinutes();
  const target = timeToMinutes(timeStr);
  const diff = target - now;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getTimeAgo(timeStr) {
  const now = getCurrentTimeMinutes();
  const target = timeToMinutes(timeStr);
  const diff = now - target;
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0) return `${h}h ${m}m ago`;
  return `${m}m ago`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function daysUntil(date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export const CLASS_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#84cc16'
];
