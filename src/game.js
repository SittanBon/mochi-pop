/* Game rules for Mochi Pop. Everything here is plain JS so it is easy to tune. */
import { PRESETS, AURAS, auraIdx, auraOf, cleanSkin } from './mochi';

export const clamp = v => Math.max(0, Math.min(100, typeof v === 'number' && isFinite(v) ? v : 0));
const num = v => (typeof v === 'number' && isFinite(v) && v >= 0 ? v : 0);

export function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* ---------- state ---------- */
export function newState() {
  const now = Date.now();
  return {
    v: 1,
    deviceId: 'd' + now.toString(36) + Math.random().toString(36).slice(2, 10),
    petName: '',
    solo: 0,
    lifetime: 0,
    chest: -1,
    skin: cleanSkin(PRESETS[0].s),
    owned: { classic: now },
    stats: { daily: {}, sessions: 0, bestCombo: 0, bestPps: 0, lastPopAt: 0 },
    pet: {
      full: 80, fun: 80, energy: 80, clean: 80, asleep: false, sick: false, crumbs: [],
      bond: 0, walks: 0, steps: 0, candy: 20, xp: 0, feeds: 0, baths: 0, met: 0,
      petCount: 0, petCandy: 0, petDay: '', born: now, last: now, lastCrumb: now,
    },
  };
}

export function normState(raw) {
  const s = newState();
  if (!raw || typeof raw !== 'object') return s;
  s.deviceId = typeof raw.deviceId === 'string' ? raw.deviceId : s.deviceId;
  s.petName = typeof raw.petName === 'string' ? raw.petName.slice(0, 16) : '';
  s.solo = num(raw.solo);
  s.lifetime = Math.max(num(raw.lifetime), s.solo);
  s.chest = typeof raw.chest === 'number' ? raw.chest : chestIndex(s.lifetime);
  s.skin = cleanSkin(raw.skin);
  if (raw.owned && typeof raw.owned === 'object') for (const k in raw.owned) if (num(raw.owned[k])) s.owned[k] = raw.owned[k];
  const st = raw.stats || {};
  s.stats.sessions = num(st.sessions); s.stats.bestCombo = num(st.bestCombo); s.stats.bestPps = num(st.bestPps); s.stats.lastPopAt = num(st.lastPopAt);
  if (st.daily && typeof st.daily === 'object') {
    const cutoff = dayKey(-60);
    for (const k in st.daily) if (k >= cutoff) s.stats.daily[k] = num(st.daily[k]);
  }
  const p = raw.pet || {};
  ['full', 'fun', 'energy', 'clean'].forEach(k => { if (typeof p[k] === 'number') s.pet[k] = clamp(p[k]); });
  ['bond', 'walks', 'steps', 'candy', 'xp', 'feeds', 'baths', 'met', 'petCount', 'petCandy'].forEach(k => { s.pet[k] = num(p[k] ?? s.pet[k]); });
  ['born', 'last', 'lastCrumb'].forEach(k => { if (num(p[k])) s.pet[k] = p[k]; });
  s.pet.asleep = p.asleep === true; s.pet.sick = p.sick === true;
  s.pet.petDay = typeof p.petDay === 'string' ? p.petDay : '';
  s.pet.crumbs = Array.isArray(p.crumbs) ? p.crumbs.slice(0, 5).map(c => ({ x: clamp(c && c.x), y: clamp(c && c.y) })) : [];
  return s;
}

/* ---------- growth ---------- */
export const PHASES = [
  { min: 1, n: 'Baby', e: '🌱', s: 0.74 },
  { min: 4, n: 'Kid', e: '🌿', s: 0.83 },
  { min: 10, n: 'Teen', e: '🌸', s: 0.91 },
  { min: 20, n: 'Adult', e: '🍡', s: 1 },
  { min: 35, n: 'Grand', e: '👑', s: 1.05 },
];
export const xpFor = L => Math.round(30 * Math.pow(L, 1.5));
export function levelInfo(xp) {
  let L = 1, need = xpFor(1), into = xp;
  while (into >= need && L < 99) { into -= need; L++; need = xpFor(L); }
  return { L, into, need };
}
export const phaseOf = L => PHASES.filter(p => L >= p.min).pop();

/* ---------- candy chests at pop milestones ---------- */
export const CHESTS = [100, 300, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000];
export const chestAt = i => (i < CHESTS.length ? CHESTS[i] : 10000000 + (i - CHESTS.length + 1) * 1000000);
export const chestReward = u => Math.max(15, Math.round(Math.min(u, 1000000) / 25));
export function chestIndex(n) { let i = -1; while (chestAt(i + 1) <= n) i++; return i; }

/* ---------- food matrix ----------
   value = Full×1.0 + Fun×1.2 + Energy×1.5 · price = value ÷ 5 · XP = value ÷ 3 */
const W = { full: 1, fun: 1.2, energy: 1.5 };
export const FOODS = [
  { g: 'meal', e: '🫘', n: 'Red bean paste', full: 20 },
  { g: 'meal', e: '🍵', n: 'Matcha tea', full: 10, energy: 15 },
  { g: 'meal', e: '🧋', n: 'Thai milk tea', full: 15, fun: 15 },
  { g: 'meal', e: '🍓', n: 'Strawberry daifuku', full: 40, fun: 10 },
  { g: 'meal', e: '🥭', n: 'Mango sticky rice', full: 50, fun: 15 },
  { g: 'energy', e: '☕', n: 'Oliang iced coffee', energy: 20 },
  { g: 'energy', e: '🍮', n: 'Energy jelly', energy: 40 },
  { g: 'energy', e: '🥥', n: 'Coconut water', energy: 60 },
  { g: 'energy', e: '⚡', n: 'Super mochi juice', energy: 100 },
].map(f => {
  const v = (f.full || 0) * W.full + (f.fun || 0) * W.fun + (f.energy || 0) * W.energy;
  return { ...f, v, c: Math.round(v / 5), xp: Math.round(v / 3) };
});

/* ---------- pet needs ---------- */
export const NEEDS = [
  ['full', 'Full', '🍙', 'hungry'],
  ['fun', 'Fun', '🎈', 'bored'],
  ['energy', 'Energy', '⚡', 'tired'],
  ['clean', 'Clean', '🫧', 'dirty'],
];
export const MOOD_E = { happy: '😊', ok: '🙂', sad: '🥺', sick: '🤢', asleep: '😴' };

/* Needs drop per hour, even while the app is closed. */
export function tickPet(p, now = Date.now()) {
  let hr = (now - p.last) / 3600000;
  if (hr <= 0) return;
  hr = Math.min(hr, 72);
  p.last = now;
  const c = p.crumbs.length;
  if (p.asleep) {
    p.energy = clamp(p.energy + 30 * hr); p.full = clamp(p.full - 3 * hr); p.fun = clamp(p.fun - 2 * hr); p.clean = clamp(p.clean - (1.5 + c) * hr);
    if (p.energy >= 100) p.asleep = false;
  } else {
    p.full = clamp(p.full - 6 * hr); p.fun = clamp(p.fun - (p.sick ? 10 : 5) * hr); p.energy = clamp(p.energy - 4 * hr); p.clean = clamp(p.clean - (3 + 2 * c) * hr);
  }
  const n = Math.floor((now - p.lastCrumb) / (45 * 60000));
  if (n > 0) {
    for (let i = 0; i < n && p.crumbs.length < 5; i++) p.crumbs.push({ x: 10 + Math.random() * 75, y: 4 + Math.random() * 14 });
    p.lastCrumb = now;
  }
  if (NEEDS.filter(([k]) => p[k] <= 0).length >= 2) p.sick = true;
}

export function mood(p) {
  if (p.asleep) return { id: 'asleep', t: 'Sleeping' };
  if (p.sick) return { id: 'sick', t: 'Feeling sick' };
  const low = NEEDS.find(([k]) => p[k] < 20);
  if (low) return { id: 'sad', t: low[3], need: low[0] };
  const avg = (p.full + p.fun + p.energy + p.clean) / 4;
  return avg >= 70 ? { id: 'happy', t: 'Happy' } : { id: 'ok', t: 'Okay' };
}
export function moodFace(p) {
  const m = mood(p).id;
  if (m === 'asleep') return { eyes: 'sleep', mouth: 'zen' };
  if (m === 'sick') return { eyes: 'dizzy', mouth: 'wavy' };
  if (m === 'sad') return { eyes: 'sad', mouth: 'frown' };
  return {};
}

/* ---------- aura ---------- */
export function auraPower(stats) {
  const d = stats.daily;
  const r = (d[dayKey()] || 0) + (d[dayKey(-1)] || 0) * 0.5 + (d[dayKey(-2)] || 0) * 0.25;
  return Math.max(0, Math.min(1, r / 600));
}
export { AURAS, auraIdx, auraOf };

/* Face info for drawing the player's own mochi: mood, baby sprout and aura. */
export function myFace(S, rank = 0) {
  const ph = phaseOf(levelInfo(S.pet.xp).L);
  return {
    ...moodFace(S.pet),
    sprout: ph.n === 'Baby',
    aura: { id: auraOf(S.lifetime).id, pw: auraPower(S.stats), rank },
  };
}

export function streak(stats) {
  let n = 0, k = stats.daily[dayKey()] ? 0 : -1;
  while (stats.daily[dayKey(k)]) { n++; k--; }
  return n;
}

export const fmt = n => Math.floor(n).toLocaleString('en-US');
