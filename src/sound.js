/* Short pop sounds. Each voice has a small pool of players so fast taps overlap. */
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const SRC = {
  pop: require('../assets/sounds/pop.wav'),
  squish: require('../assets/sounds/squish.wav'),
  low: require('../assets/sounds/low.wav'),
  twang: require('../assets/sounds/twang.wav'),
  bell: require('../assets/sounds/bell.wav'),
  beep: require('../assets/sounds/beep.wav'),
  honk: require('../assets/sounds/honk.wav'),
  cluck: require('../assets/sounds/cluck.wav'),
  boo: require('../assets/sounds/boo.wav'),
  thump: require('../assets/sounds/thump.wav'),
  chime: require('../assets/sounds/chime.wav'),
};
const pools = {};

export function initSound() {
  try { setAudioModeAsync({ playsInSilentMode: false }).catch(() => {}); } catch (e) {}
}

function pool(name) {
  if (!pools[name]) {
    pools[name] = { i: 0, ps: [0, 1, 2, 3].map(() => createAudioPlayer(SRC[name])) };
  }
  return pools[name];
}

export function preload(name) { try { pool(SRC[name] ? name : 'pop'); } catch (e) {} }

export function play(name, volume = 1) {
  try {
    const P = pool(SRC[name] ? name : 'pop');
    const p = P.ps[P.i++ % P.ps.length];
    p.volume = volume;
    Promise.resolve(p.seekTo(0)).catch(() => {}).finally(() => { try { p.play(); } catch (e) {} });
  } catch (e) {}
}
