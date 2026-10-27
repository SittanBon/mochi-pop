import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, useWindowDimensions, Platform } from 'react-native';
import { useGame } from '../context';
import Mochi from '../components/Mochi';
import { Bar, Floater } from '../components/UI';
import { C, F, MOCHI_RATIO } from '../theme';
import { presetOf, AURAS, auraOf } from '../mochi';
import { levelInfo, phaseOf, chestAt, chestReward, mood, myFace, auraPower, fmt } from '../game';

let pid = 0;

export default function PopScreen() {
  const { S, A, go, myRank } = useGame();
  const { width } = useWindowDimensions();
  const size = Math.min(width * 0.92, 390);
  const [pressed, setPressed] = useState(false);
  const [parts, setParts] = useState([]);
  const [combo, setCombo] = useState(0);
  const cref = useRef({ n: 0, last: 0, t: null, times: [] });
  const sq = useRef(new Animated.Value(0)).current;

  const li = levelInfo(S.pet.xp), ph = phaseOf(li.L);
  const au = auraOf(S.lifetime);
  const m = mood(S.pet);
  const nx = chestAt(S.chest + 1), na = AURAS.find(a => a.u === nx);
  const face = myFace(S, myRank);

  /* Every finger that lands on the mochi is one pop, so two-finger drumming works. */
  const press = (x, y) => {
    const c = cref.current, now = Date.now();
    c.times = c.times.filter(t => now - t < 1000);
    if (c.times.length >= 20) return; // human speed cap
    c.times.push(now);
    c.n = now - c.last < 380 ? c.n + 1 : 1;
    c.last = now;
    clearTimeout(c.t);
    c.t = setTimeout(() => { c.n = 0; setCombo(0); }, 450);
    setCombo(c.n);

    const r = A.pop(c.n, c.times.length);
    setPressed(true);
    Animated.timing(sq, { toValue: 1, duration: 45, useNativeDriver: true }).start();

    const talk = S.lifetime % 12 === 0;
    const lines = presetOf(S.skin)?.say || ['pop!', 'boing', 'squish!', 'mochi!'];
    const add = [{
      id: pid++, x, y, dx: Math.random() * 60 - 30,
      text: talk ? lines[Math.floor(Math.random() * lines.length)] : '+1', big: talk,
      color: !talk && r.tier ? r.aura.c : C.ink, glow: !talk && r.tier ? r.aura.c : null, size: talk ? 16 : 22 + r.tier * 2,
    }];
    if (r.tier >= 2 && Math.random() < 0.3) add.push({ id: pid++, x: x + Math.random() * 80 - 40, y: y + 20, dx: Math.random() * 80 - 40, text: r.aura.e, size: 26 });
    setParts(ps => [...ps.slice(-24), ...add]);
  };
  const release = () => {
    setPressed(false);
    Animated.spring(sq, { toValue: 0, friction: 3, tension: 220, useNativeDriver: true }).start();
  };
  const done = id => setParts(ps => ps.filter(p => p.id !== id));

  const h = size * MOCHI_RATIO;
  const shake = combo >= 50;

  return (
    <View style={st.wrap}>
      <View style={st.head}>
        <Text style={st.title}>Mochi Pop</Text>
        <View style={st.candy}><Text style={st.candyTxt}>🍬 {fmt(S.pet.candy)}</Text></View>
      </View>

      <Text style={st.num} accessibilityLabel={`${S.solo} pops`}>{fmt(S.solo)}</Text>
      <Text style={st.who}>
        {S.petName || 'Mochi'} · solo pops{au.id ? ` · ${au.e} ${au.n} ${Math.round(40 + auraPower(S.stats) * 60)}%` : ''}
      </Text>

      <Pressable style={st.grow} onPress={() => go('Pet')} accessibilityRole="button" accessibilityLabel="Open your mochi's home">
        <Mochi skin={S.skin} size={44} />
        <View style={{ flex: 1 }}>
          <Text style={st.growT}>{S.petName || 'Mochi'} · Lv {li.L} {ph.n} {ph.e}</Text>
          <Text style={st.growS}>{fmt(li.into)} / {fmt(li.need)} XP to Lv {li.L + 1}</Text>
          <Bar value={(li.into / li.need) * 100} color={C.gold} height={8} style={{ marginTop: 4 }} />
        </View>
      </Pressable>
      <Text style={st.chest}>
        {na ? `🎁 ${fmt(nx)} pops: candy chest + ${na.e} ${na.n} aura · ${fmt(nx - S.lifetime)} to go` : `🎁 Next candy chest at ${fmt(nx)} pops (+${fmt(chestReward(nx))} 🍬) · ${fmt(nx - S.lifetime)} to go`}
      </Text>
      {m.id === 'sad' || m.id === 'sick' ? (
        <Pressable style={st.care} onPress={() => go('Pet')}>
          <Text style={st.careTxt}>{m.id === 'sick' ? `🤢 ${A.petName()} is sick. Tap to help` : `🥺 ${A.petName()} is ${m.t}. Tap to take care`}</Text>
        </Pressable>
      ) : null}

      <View style={st.stage}>
        <View
          style={{ width: size, height: h }}
          accessible accessibilityRole="button" accessibilityLabel="Pop the mochi"
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={() => { press(size / 2, h / 2); setTimeout(release, 90); }}
          {...(Platform.OS === 'web'
            ? {
                onStartShouldSetResponder: () => true,
                onResponderGrant: e => press(e.nativeEvent.locationX, e.nativeEvent.locationY),
                onResponderRelease: release,
                onResponderTerminate: release,
              }
            : {
                onTouchStart: e => {
                  const ts = e.nativeEvent.changedTouches && e.nativeEvent.changedTouches.length ? e.nativeEvent.changedTouches : [e.nativeEvent];
                  ts.forEach(t => press(t.locationX, t.locationY));
                },
                onTouchEnd: e => { if (!e.nativeEvent.touches || e.nativeEvent.touches.length === 0) release(); },
                onTouchCancel: release,
              })}>
          <Animated.View
            style={{
              transform: [
                { translateY: sq.interpolate({ inputRange: [0, 1], outputRange: [0, h * 0.06] }) },
                { scaleX: sq.interpolate({ inputRange: [0, 1], outputRange: [1, 1.09] }) },
                { scaleY: sq.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }) },
                { rotate: shake ? `${(Math.random() * 4 - 2).toFixed(1)}deg` : '0deg' },
              ],
            }}>
            <Mochi skin={S.skin} face={face} size={size} open={pressed} canOpen grow={ph.s} />
          </Animated.View>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {parts.map(p => <Floater key={p.id} p={p} onDone={done} />)}
          </View>
        </View>
      </View>
      <Text style={[st.combo, shake && { color: C.hot }]}>
        {combo >= 50 ? `Rage mode ×${combo}` : combo >= 10 ? `Combo ×${combo}` : ' '}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: F.display, fontSize: 24, color: C.ink },
  candy: { backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 12 },
  candyTxt: { fontFamily: F.display, fontSize: 16, color: C.ink },
  num: { fontFamily: F.display, fontSize: 64, color: C.ink, textAlign: 'center', marginTop: 8, fontVariant: ['tabular-nums'] },
  who: { fontFamily: F.bold, fontSize: 13.5, color: C.soft, textAlign: 'center' },
  grow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 12, marginTop: 12 },
  growT: { fontFamily: F.black, fontSize: 14, color: C.ink },
  growS: { fontFamily: F.bold, fontSize: 12, color: C.soft },
  chest: { fontFamily: F.bold, fontSize: 12.5, color: C.soft, textAlign: 'center', marginTop: 6 },
  care: { alignSelf: 'center', backgroundColor: C.hot, borderColor: C.ink, borderWidth: 3, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14, marginTop: 8 },
  careTxt: { fontFamily: F.black, color: '#fff', fontSize: 13.5 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  combo: { fontFamily: F.display, fontSize: 18, color: C.ink, textAlign: 'center', marginBottom: 10 },
});
