import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, PanResponder, Easing } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { useGame } from '../context';
import Mochi from '../components/Mochi';
import { Bar, Btn, Floater } from '../components/UI';
import { C, F } from '../theme';
import { presetOf, PRESETS } from '../mochi';
import { FOODS, NEEDS, MOOD_E, mood, levelInfo, phaseOf, myFace, fmt } from '../game';

let fid = 0;
const PROPS = ['🌳', '🌸', '🌷', '🍄', '🌼', '🪨', '🌲', '🏮'];

export default function PetScreen() {
  const { S, A, askName, myRank } = useGame();
  const p = S.pet;
  const m = mood(p);
  const li = levelInfo(p.xp), ph = phaseOf(li.L);
  const world = (presetOf(S.skin) || PRESETS[0]).w;
  const age = Math.max(1, Math.ceil((Date.now() - p.born) / 86400000));

  const [panel, setPanel] = useState(null);      // 'food' | 'walk' | {summary}
  const [bathing, setBathing] = useState(false);
  const [chomp, setChomp] = useState(false);
  const [fx, setFx] = useState([]);
  const [walk, setWalk] = useState(null);        // {kind, steps, moving, friend}
  const [props, setProps] = useState([]);
  const W = useRef(null);                        // live walk data for timers
  const hop = useRef(new Animated.Value(0)).current;
  const sceneW = useRef(320);

  const spawn = (text, x, y, size = 24) => setFx(f => [...f.slice(-20), { id: fid++, text, x, y, dx: Math.random() * 50 - 25, size }]);
  const doneFx = id => setFx(f => f.filter(q => q.id !== id));

  /* ---------- mochi hops while walking ---------- */
  const moving = !!walk && walk.moving;
  useEffect(() => {
    if (!moving) { hop.stopAnimation(); hop.setValue(0); return undefined; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(hop, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(hop, { toValue: 0, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [moving]);

  /* Scenery scrolls past while walking. */
  useEffect(() => {
    if (!moving) return undefined;
    const t = setInterval(() => {
      const a = new Animated.Value(0);
      const id = fid++;
      setProps(ps => [...ps.slice(-6), { id, e: PROPS[Math.floor(Math.random() * PROPS.length)], a }]);
      Animated.timing(a, { toValue: 1, duration: 3600, easing: Easing.linear, useNativeDriver: true }).start(() => setProps(ps => ps.filter(q => q.id !== id)));
    }, 1100);
    return () => clearInterval(t);
  }, [moving]);

  useEffect(() => () => stopWalk(), []);

  /* ---------- bath: rub the scene ---------- */
  const lastScrub = useRef(0);
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: e => {
      const now = Date.now();
      if (now - lastScrub.current < 40) return;
      lastScrub.current = now;
      const { locationX, locationY } = e.nativeEvent;
      setFx(f => [...f.slice(-24), { id: fid++, text: '🫧', x: locationX, y: locationY, dx: Math.random() * 40 - 20, size: 18 + Math.random() * 14 }]);
      if (A.scrub()) setBathing(false);
    },
  })).current;

  /* ---------- feeding ---------- */
  const feed = f => {
    if (!A.feed(f)) return;
    setPanel(null);
    spawn(f.e, sceneW.current / 2, 60, 40);
    let n = 0;
    const t = setInterval(() => { setChomp(c => !c); if (++n >= 6) { clearInterval(t); setChomp(false); spawn('😋', sceneW.current / 2, 120); } }, 170);
  };

  /* ---------- walks ---------- */
  const friendA = useRef(new Animated.Value(0)).current;
  const meetFriend = acc => {
    const c = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    S.pet.met++;
    acc.fun += 10;
    setWalk(w => w && { ...w, friend: c });
    friendA.setValue(0);
    Animated.sequence([
      Animated.timing(friendA, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(friendA, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start(() => setWalk(w => w && { ...w, friend: null }));
    return `Met a wild ${c.n}! +10 fun`;
  };
  const walkEvent = (i, acc) => {
    let t;
    if (i === 0) { const n = 1 + Math.floor(Math.random() * 3); acc.candy += n; t = `Found ${n} 🍬 on the path!`; spawn('🍬', sceneW.current / 2, 90); }
    else if (i === 1) { acc.fun += 8; t = `${A.petName()} sniffed a flower 🌸`; spawn('🌸', sceneW.current / 2, 90); }
    else if (i === 2) t = meetFriend(acc);
    else { acc.candy += 1; acc.fun += 4; t = 'Chased a butterfly 🦋'; spawn('🦋', sceneW.current / 2, 90); }
    acc.log.push(t);
    A.toast(t);
  };

  function stopWalk() {
    const w = W.current;
    if (!w) return;
    w.timers.forEach(t => { clearInterval(t); clearTimeout(t); });
    if (w.sub) w.sub.remove();
    W.current = null;
  }

  const finish = (steps, acc, kind) => {
    stopWalk();
    setWalk(null);
    const xp = A.finishWalk(steps, acc);
    setPanel({ summary: { kind, steps, xp, acc } });
  };

  const startStroll = () => {
    if (p.energy < 15) { A.toast(`${A.petName()} is too tired to walk. Let it sleep, or give it an energy drink ⚡`); return; }
    setPanel(null);
    const acc = { candy: 3, fun: 20, full: 6, clean: 8, energy: 15, log: [] };
    const start = Date.now(), DUR = 30000, PACE = 1.9;
    W.current = { timers: [] };
    setWalk({ kind: 'stroll', steps: 0, moving: true, friend: null });
    W.current.timers.push(setInterval(() => setWalk(w => w && { ...w, steps: Math.floor(((Date.now() - start) / 1000) * PACE), pct: Math.min(1, (Date.now() - start) / DUR) }), 250));
    const order = [0, 2, Math.random() < 0.5 ? 1 : 3];
    [7000, 15000, 23000].forEach((at, i) => W.current.timers.push(setTimeout(() => walkEvent(order[i], acc), at)));
    W.current.timers.push(setTimeout(() => finish(Math.round((DUR / 1000) * PACE), acc, 'Stroll'), DUR));
  };

  const startReal = async () => {
    if (p.energy < 10) { A.toast(`${A.petName()} is too tired to walk. Let it sleep, or give it an energy drink ⚡`); return; }
    try {
      if (!(await Pedometer.isAvailableAsync())) { A.toast('This phone has no step counter. Try a Quick stroll.'); return; }
      const perm = await Pedometer.requestPermissionsAsync();
      if (!perm.granted) { A.toast('Motion access is off, so steps can’t be counted. Try a Quick stroll.'); return; }
    } catch (e) { A.toast('Step counting isn’t available here. Try a Quick stroll.'); return; }
    setPanel('real');
    const acc = { candy: 0, fun: 0, full: 0, clean: 0, energy: 0, log: [] };
    W.current = { timers: [], acc, steps: 0, lastStep: 0 };
    setWalk({ kind: 'real', steps: 0, moving: false, friend: null });
    W.current.sub = Pedometer.watchStepCount(r => {
      const w = W.current; if (!w) return;
      const prev = w.steps;
      w.steps = r.steps; w.lastStep = Date.now();
      if (Math.floor(w.steps / 150) > Math.floor(prev / 150)) walkEvent(Math.floor(Math.random() * 4), acc);
      setWalk(x => x && { ...x, steps: w.steps, moving: true, pct: (w.steps % 150) / 150 });
    });
    W.current.timers.push(setInterval(() => {
      const w = W.current; if (!w) return;
      const mv = Date.now() - w.lastStep < 2500;
      setWalk(x => (x && x.moving !== mv ? { ...x, moving: mv } : x));
    }, 700));
  };

  const endReal = () => {
    const w = W.current;
    if (!w || !w.steps) { stopWalk(); setWalk(null); setPanel(null); A.toast('No steps counted this time'); return; }
    const s = w.steps, acc = w.acc;
    acc.candy += Math.floor(s / 50);
    acc.fun += Math.min(40, Math.round(s / 20));
    acc.energy = Math.min(25, s / 80); acc.full = Math.min(15, s / 120); acc.clean = Math.min(15, s / 150);
    finish(s, acc, 'Real walk');
  };

  /* ---------- render ---------- */
  const busy = !!walk || chomp;
  const walking = !!walk;
  return (
    <ScrollView contentContainerStyle={st.wrap} scrollEnabled={!bathing}>
      <View style={st.head}>
        <View style={{ flex: 1 }}>
          <Pressable onPress={askName} style={st.nameRow} accessibilityLabel="Rename your mochi">
            <Text style={st.name}>{S.petName || 'Mochi'}</Text><Text style={st.edit}>✏️</Text>
          </Pressable>
          <Text style={st.sub}>Lv {li.L} {ph.n} {ph.e} · day {age} together</Text>
        </View>
        <View style={st.candy}><Text style={st.candyTxt}>🍬 {fmt(p.candy)}</Text></View>
      </View>

      <View style={[st.scene, { backgroundColor: world.sky }]} onLayout={e => { sceneW.current = e.nativeEvent.layout.width; }}>
        <View style={[st.ground, { backgroundColor: world.top }]} />
        {props.map(q => (
          <Animated.Text key={q.id} style={[st.prop, { transform: [{ translateX: q.a.interpolate({ inputRange: [0, 1], outputRange: [sceneW.current + 20, -80] }) }] }]}>{q.e}</Animated.Text>
        ))}
        {p.crumbs.map((c, i) => (
          <Pressable key={i} onPress={() => A.cleanCrumb(i)} hitSlop={10} style={[st.crumb, { left: `${c.x}%`, bottom: `${c.y}%` }]} accessibilityLabel="Clean up crumb" />
        ))}
        <Animated.View style={[st.pet, { transform: [{ translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }) }] }]}>
          <Pressable
            onPress={e => { if (bathing || walking) return; const r = A.petTap(); if (r !== null) spawn(r ? '+1 🍬' : Math.random() < 0.5 ? '💗' : '✨', e.nativeEvent.locationX + 20, e.nativeEvent.locationY); }}
            accessibilityLabel="Pet your mochi">
            <Mochi skin={S.skin} face={myFace(S, myRank)} size={235} open={chomp} canOpen grow={ph.s} />
          </Pressable>
        </Animated.View>
        {walk && walk.friend ? (
          <Animated.View style={[st.friend, { opacity: friendA, transform: [{ translateX: friendA.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) }] }]}>
            <Text style={st.hi}>hi! 👋</Text>
            <Mochi skin={walk.friend.s} size={90} />
          </Animated.View>
        ) : null}
        {p.asleep ? (
          <View style={st.night} pointerEvents="none"><Text style={{ fontSize: 34, alignSelf: 'flex-end' }}>🌙</Text><Text style={st.zz}>z Z z</Text></View>
        ) : null}
        <View style={st.moodTag}><Text style={st.moodTxt}>{MOOD_E[m.id]} {m.t[0].toUpperCase() + m.t.slice(1)}</Text></View>
        {walk ? (
          <View style={st.hud}>
            <Text style={st.hudTxt}>👟 {fmt(walk.steps)} {walk.kind === 'real' ? 'real steps' : 'steps'}</Text>
            <Bar value={(walk.pct || 0) * 100} color={C.gold} height={7} style={{ marginTop: 3 }} />
          </View>
        ) : null}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {fx.map(q => <Floater key={q.id} p={q} onDone={doneFx} />)}
        </View>
        {bathing ? <View style={StyleSheet.absoluteFill} {...pan.panHandlers} /> : null}
      </View>
      <Text style={st.hint}>{bathing ? 'Rub the scene to scrub. Keep going until Clean is full 🫧' : 'Tap your mochi to pet it 💗 Every 10 pets = 1 🍬'}</Text>

      <View style={st.needs}>
        {NEEDS.map(([k, label, e]) => {
          const v = Math.round(p[k]);
          return (
            <View key={k} style={st.need}>
              <View style={st.needRow}><Text style={st.needT}>{e} {label}</Text><Text style={st.needV}>{v}%</Text></View>
              <Bar value={v} color={v < 20 ? C.hot : v < 50 ? C.gold : C.mint} />
            </View>
          );
        })}
      </View>

      <View style={st.bigRow}>
        <BigAct e="🍙" t="Feed" s="Snacks for 🍬 · +XP" disabled={busy || p.asleep} onPress={() => { setBathing(false); setPanel(panel === 'food' ? null : 'food'); }} />
        <BigAct e="👟" t="Walk" s="Earn 🍬 · +XP" disabled={busy || p.asleep || p.sick} onPress={() => { setBathing(false); setPanel(panel === 'walk' ? null : 'walk'); }} />
      </View>
      <View style={st.smallRow}>
        <SmallAct e="🫧" t={bathing ? 'Done' : 'Bath'} on={bathing} disabled={(busy && !bathing) || p.asleep} onPress={() => { setPanel(null); setBathing(b => !b); }} />
        <SmallAct e={p.asleep ? '☀️' : '🌙'} t={p.asleep ? 'Wake up' : 'Sleep'} disabled={busy} onPress={() => { setBathing(false); A.toggleSleep(); }} />
        {p.sick ? <SmallAct e="💊" t="Medicine 🍬15" disabled={busy || p.candy < 15} onPress={A.medicine} /> : null}
      </View>

      {panel === 'food' ? (
        <View style={st.menu}>
          <Text style={st.menuH}>Feed {A.petName()}</Text>
          {FOODS.map((f, i) => (
            <View key={f.n}>
              {i === 0 || FOODS[i - 1].g !== f.g ? <Text style={st.group}>{f.g === 'meal' ? '🍙 Meals · fill the tummy' : '⚡ Energy drinks · no nap needed'}</Text> : null}
              <Pressable style={[st.item, p.candy < f.c && { opacity: 0.45 }]} disabled={p.candy < f.c} onPress={() => feed(f)}>
                <Text style={st.itemE}>{f.e}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={st.itemT}>{f.n}</Text>
                  <Text style={st.itemS}>{[f.full && `+${f.full} full`, f.fun && `+${f.fun} fun`, f.energy && `+${f.energy} energy`, `+${f.xp} XP`].filter(Boolean).join(' · ')}</Text>
                </View>
                <Text style={st.price}>🍬{f.c}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {panel === 'walk' ? (
        <View style={st.menu}>
          <Text style={st.menuH}>Take {A.petName()} for a walk</Text>
          <Pressable style={st.item} onPress={startReal}>
            <Text style={st.itemE}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.itemT}>Real walk</Text>
              <Text style={st.itemS}>Walk for real with your phone. Your steps are your mochi's steps. Every 50 steps = 1 🍬</Text>
            </View>
            <Text style={st.price}>GO</Text>
          </Pressable>
          <Pressable style={st.item} onPress={startStroll}>
            <Text style={st.itemE}>👟</Text>
            <View style={{ flex: 1 }}>
              <Text style={st.itemT}>Quick stroll</Text>
              <Text style={st.itemS}>A 30-second stroll around the island. About 3 to 8 🍬</Text>
            </View>
            <Text style={st.price}>30s</Text>
          </Pressable>
        </View>
      ) : null}

      {panel === 'real' && walk ? (
        <View style={st.menu}>
          <Text style={st.menuH}>Real walk 📱</Text>
          <Text style={st.itemS}>Start walking with your phone in your hand. {A.petName()} walks when you walk and waits when you stop. Keep this screen open. Something fun turns up every 150 steps.</Text>
          <Btn title="Finish walk" onPress={endReal} style={{ marginTop: 10, alignSelf: 'flex-start' }} />
        </View>
      ) : null}

      {panel && panel.summary ? (
        <View style={st.menu}>
          <Text style={st.menuH}>{panel.summary.kind} done! 👟</Text>
          <Text style={st.itemS}>
            {fmt(panel.summary.steps)} steps · +{panel.summary.acc.candy} 🍬 · +{panel.summary.xp} XP · +{Math.round(panel.summary.acc.fun)} fun
            {panel.summary.acc.clean >= 5 ? ' · a little dirty now, bath time?' : ''}
          </Text>
          {panel.summary.acc.log.map((t, i) => <Text key={i} style={st.itemS}>• {t}</Text>)}
        </View>
      ) : null}
    </ScrollView>
  );
}

function BigAct({ e, t, s, onPress, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [st.big, disabled && { opacity: 0.45 }, pressed && { transform: [{ scale: 0.97 }] }]}>
      <Text style={{ fontSize: 42 }}>{e}</Text>
      <Text style={st.bigT}>{t}</Text>
      <Text style={st.bigS}>{s}</Text>
    </Pressable>
  );
}
function SmallAct({ e, t, onPress, disabled, on }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[st.small, on && { backgroundColor: C.ink }, disabled && { opacity: 0.45 }]}>
      <Text style={{ fontSize: 17 }}>{e}</Text>
      <Text style={[st.smallT, on && { color: C.card }]}>{t}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontFamily: F.display, fontSize: 24, color: C.ink },
  edit: { fontSize: 16 },
  sub: { fontFamily: F.bold, fontSize: 13, color: C.soft },
  candy: { backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 12 },
  candyTxt: { fontFamily: F.display, fontSize: 16, color: C.ink },
  scene: { height: 300, marginTop: 10, borderColor: C.ink, borderWidth: 3, borderRadius: 28, overflow: 'hidden' },
  ground: { position: 'absolute', left: -30, right: -30, bottom: 0, height: '32%', borderTopWidth: 3, borderColor: C.ink, borderTopLeftRadius: 400, borderTopRightRadius: 400 },
  prop: { position: 'absolute', bottom: '20%', fontSize: 38 },
  crumb: { position: 'absolute', width: 22, height: 16, borderRadius: 10, backgroundColor: '#8B5A3C', borderWidth: 2.5, borderColor: C.ink, zIndex: 4 },
  pet: { position: 'absolute', left: 0, right: 0, bottom: 4, alignItems: 'center', zIndex: 3 },
  friend: { position: 'absolute', right: 8, bottom: 22, alignItems: 'center', zIndex: 3 },
  hi: { fontFamily: F.black, fontSize: 12, backgroundColor: C.card, borderColor: C.ink, borderWidth: 2, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden', color: C.ink },
  night: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,16,60,.58)', padding: 16, zIndex: 5 },
  zz: { position: 'absolute', left: '58%', top: '22%', fontFamily: F.display, fontSize: 22, color: '#fff' },
  moodTag: { position: 'absolute', left: 12, top: 12, backgroundColor: C.card, borderColor: C.ink, borderWidth: 2, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10, zIndex: 6 },
  moodTxt: { fontFamily: F.black, fontSize: 13, color: C.ink },
  hud: { position: 'absolute', right: 12, top: 12, width: '44%', backgroundColor: C.card, borderColor: C.ink, borderWidth: 2, borderRadius: 14, paddingVertical: 5, paddingHorizontal: 10, zIndex: 6 },
  hudTxt: { fontFamily: F.black, fontSize: 13, color: C.ink },
  hint: { fontFamily: F.bold, fontSize: 12.5, color: C.soft, textAlign: 'center', marginTop: 6 },
  needs: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 20, padding: 12, marginTop: 10, rowGap: 8, columnGap: 14 },
  need: { width: '46%', flexGrow: 1 },
  needRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  needT: { fontFamily: F.black, fontSize: 13, color: C.ink },
  needV: { fontFamily: F.black, fontSize: 13, color: C.soft },
  bigRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  big: { flex: 1, alignItems: 'center', backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 22, paddingVertical: 12 },
  bigT: { fontFamily: F.black, fontSize: 17, color: C.ink },
  bigS: { fontFamily: F.bold, fontSize: 12, color: C.soft },
  smallRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  small: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: C.card, borderColor: C.ink, borderWidth: 2, borderRadius: 999, paddingVertical: 8 },
  smallT: { fontFamily: F.black, fontSize: 13, color: C.ink },
  menu: { marginTop: 10, backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 20, padding: 12 },
  menuH: { fontFamily: F.display, fontSize: 17, color: C.ink, marginBottom: 4 },
  group: { fontFamily: F.black, fontSize: 13, color: C.soft, marginTop: 10, marginBottom: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1.5, borderTopColor: '#E6D3E0' },
  itemE: { fontSize: 30, width: 40, textAlign: 'center' },
  itemT: { fontFamily: F.black, fontSize: 14, color: C.ink },
  itemS: { fontFamily: F.bold, fontSize: 12.5, color: C.soft, marginTop: 2 },
  price: { fontFamily: F.display, fontSize: 15, color: C.ink },
});
