import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, AppState, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { useFonts } from 'expo-font';
import { MochiyPopOne_400Regular } from '@expo-google-fonts/mochiy-pop-one/400Regular';
import { MPLUSRounded1c_700Bold } from '@expo-google-fonts/m-plus-rounded-1c/700Bold';
import { MPLUSRounded1c_800ExtraBold } from '@expo-google-fonts/m-plus-rounded-1c/800ExtraBold';

import { C, F } from './src/theme';
import { Ctx } from './src/context';
import { cleanSkin, presetOf, PRICE, AURAS, auraIdx, auraOf } from './src/mochi';
import { normState, tickPet, mood, levelInfo, phaseOf, chestAt, chestIndex, chestReward, auraPower, dayKey, clamp, fmt } from './src/game';
import { initSound, play, preload } from './src/sound';
import { enabled as boardOn, pushMe, watchTop } from './src/leaderboard';
import { GiftModal, NameModal } from './src/components/Modals';
import PopScreen from './src/screens/PopScreen';
import PetScreen from './src/screens/PetScreen';
import ShopScreen from './src/screens/ShopScreen';
import RanksScreen from './src/screens/RanksScreen';

const KEY = 'mochipop:save:v1';
const TABS = [['Pop', '🍡'], ['Pet', '🏠'], ['Mochi', '🎨'], ['Ranks', '🏆']];

export default function App() {
  return (
    <SafeAreaProvider>
      <Game />
    </SafeAreaProvider>
  );
}

function Game() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded, fontError] = useFonts({ MochiyPopOne_400Regular, MPLUSRounded1c_700Bold, MPLUSRounded1c_800ExtraBold });
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [, bump] = useReducer(x => x + 1, 0);
  const [view, setView] = useState('Pop');
  const [toastMsg, setToastMsg] = useState(null);
  const [gift, setGift] = useState(null);
  const giftQ = useRef([]);
  const [nameOpen, setNameOpen] = useState(false);
  const [board, setBoard] = useState([]);

  /* ---------- load + save ---------- */
  useEffect(() => {
    initSound();
    (async () => {
      let raw = null;
      try { raw = JSON.parse((await AsyncStorage.getItem(KEY)) || 'null'); } catch (e) {}
      const S = normState(raw);
      tickPet(S.pet);
      ref.current = S;
      preload(S.skin.voice);
      setReady(true);
      if (!S.petName) setNameOpen(true);
    })();
  }, []);

  const pushT = useRef(null);
  const schedulePush = () => {
    if (!boardOn || pushT.current) return;
    pushT.current = setTimeout(() => {
      pushT.current = null;
      const S = ref.current;
      if (!S || !S.petName) return;
      pushMe(S.deviceId, {
        name: S.petName, solo: S.solo, lv: levelInfo(S.pet.xp).L, skin: S.skin,
        aura: auraOf(S.lifetime).id, ap: +auraPower(S.stats).toFixed(2), mood: mood(S.pet).id, updatedAt: Date.now(),
      });
    }, 4000);
  };

  const saveT = useRef(null);
  const save = () => {
    if (saveT.current) return;
    saveT.current = setTimeout(async () => {
      saveT.current = null;
      try { await AsyncStorage.setItem(KEY, JSON.stringify(ref.current)); } catch (e) {}
      schedulePush();
    }, 800);
  };

  /* Needs keep changing while the app is open, and catch up when it comes back. */
  useEffect(() => {
    if (!ready) return undefined;
    const t = setInterval(() => { tickPet(ref.current.pet); bump(); save(); }, 15000);
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') { tickPet(ref.current.pet); bump(); }
      else AsyncStorage.setItem(KEY, JSON.stringify(ref.current)).catch(() => {});
    });
    return () => { clearInterval(t); sub.remove(); };
  }, [ready]);

  useEffect(() => (ready ? watchTop(setBoard) : undefined), [ready]);
  const myRank = useMemo(() => {
    if (!ready) return 0;
    const i = board.findIndex(p => p.id === ref.current.deviceId);
    return i >= 0 && i < 3 ? i + 1 : 0;
  }, [board, ready]);

  /* ---------- feedback helpers ---------- */
  const toastT = useRef(null);
  const toast = (msg, kind) => {
    setToastMsg({ msg, kind });
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(null), 2300);
  };
  const showNextGift = () => setGift(giftQ.current.shift() || null);
  const pushGift = item => {
    giftQ.current.push(item);
    setGift(g => g || giftQ.current.shift());
  };
  const buzz = style => {
    if (Platform.OS === 'web') {
      // Browsers have no haptics engine; Android browsers can still vibrate.
      const ms = { light: 10, soft: 8, medium: 18, heavy: 28 }[style] || 12;
      try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
      return;
    }
    Haptics.impactAsync(style).catch(() => {});
  };

  /* ---------- game actions ---------- */
  const A = useMemo(() => {
    const S = () => ref.current;
    const petName = () => ref.current.petName || 'Mochi';

    function addXP(n) {
      const p = S().pet, a = levelInfo(p.xp).L;
      p.xp += n;
      const b = levelInfo(p.xp).L;
      if (b <= a) return;
      let c = 0;
      for (let L = a + 1; L <= b; L++) c += 5 * L;
      p.candy += c;
      const pa = phaseOf(a), pb = phaseOf(b);
      if (pa !== pb) {
        pushGift({ skin: S().skin, face: { aura: { id: auraOf(S().lifetime).id, pw: 1 } }, k: `🎉 ${petName()} grew up!`, n: `Now a ${pb.n} ${pb.e}`, t: `Level ${b}. +${c} 🍬 for growing. Keep feeding, walking and popping to grow even more.` });
      } else toast(`🎉 ${petName()} reached Lv ${b}! +${c} 🍬`, 'gold');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      play('chime', 0.7);
    }

    function checkChests() {
      const st = S(), ci = chestIndex(st.lifetime);
      if (ci <= st.chest) return;
      let total = 0;
      for (let k = st.chest + 1; k <= ci; k++) total += chestReward(chestAt(k));
      const u = chestAt(ci);
      st.chest = ci;
      st.pet.candy += total;
      const na = AURAS.find(a => a.u === u);
      if (na) pushGift({ skin: st.skin, face: { aura: { id: na.id, pw: 1 } }, k: `${fmt(u)} pops · +${fmt(total)} 🍬`, n: `New aura: ${na.n} ${na.e}`, t: `${na.d} It shines brightest on days you pop a lot.` });
      else pushGift({ emoji: '🎁', k: `${fmt(u)} pops reached`, n: `Candy chest! +${fmt(total)} 🍬`, t: 'Spend candy on new mochi in the Mochi tab, or on snacks for your pet.' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      play('chime');
    }

    /* One pop. combo and pps come from the Pop screen. */
    function pop(combo, pps) {
      const st = S(), p = st.pet, now = Date.now();
      if (now - st.stats.lastPopAt > 5 * 60000) st.stats.sessions++;
      st.stats.lastPopAt = now;
      const dk = dayKey();
      st.stats.daily[dk] = (st.stats.daily[dk] || 0) + 1;
      st.solo++; st.lifetime++;
      if (combo > st.stats.bestCombo) st.stats.bestCombo = combo;
      if (pps > st.stats.bestPps) st.stats.bestPps = pps;
      if (p.asleep) { p.asleep = false; p.fun = clamp(p.fun - 5); toast(`😾 You woke ${petName()} up!`, 'bad'); }
      if (st.lifetime % (mood(p).id === 'happy' ? 5 : 10) === 0) p.candy++;
      if (st.lifetime % 5 === 0) addXP(1);
      if (st.lifetime % 50 === 0) { p.fun = clamp(p.fun + 1); p.energy = clamp(p.energy - 1); p.full = clamp(p.full - 1); }
      const tier = auraIdx(st.lifetime), rage = combo >= 50;
      play(st.skin.voice, 1);
      if (tier >= 3) play('thump', 0.25 + tier * 0.1);
      buzz(rage || tier >= 4 ? Haptics.ImpactFeedbackStyle.Heavy : combo >= 15 || tier >= 2 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
      checkChests();
      save();
      bump();
      return { tier, aura: AURAS[tier], rage };
    }

    function wear(skin) {
      const s = cleanSkin(skin);
      S().skin = s;
      preload(s.voice);
      save(); bump();
      toast(`${petName()} is wearing ${presetOf(s)?.n || 'a new look'}`);
    }

    function buy(c) {
      const st = S(), price = PRICE[c.id] || 0;
      if (st.owned[c.id] || st.pet.candy < price) return;
      st.pet.candy -= price;
      st.owned[c.id] = Date.now();
      pushGift({ skin: c.s, k: `New mochi! −${fmt(price)} 🍬`, n: c.n, t: c.t, wear: true });
      play('chime'); save(); bump();
    }

    function feed(f) {
      const p = S().pet;
      const raises = ['full', 'fun', 'energy'].filter(k => f[k]);
      if (raises.every(k => p[k] >= 95)) { toast(f.g === 'energy' ? `${petName()} is already full of energy! ⚡` : `${petName()} is too full! 🫃`); return false; }
      if (p.candy < f.c) return false;
      p.candy -= f.c;
      p.full = clamp(p.full + (f.full || 0)); p.fun = clamp(p.fun + (f.fun || 0)); p.energy = clamp(p.energy + (f.energy || 0));
      p.bond++; p.feeds++;
      addXP(f.xp); save(); bump();
      return true;
    }

    function petTap() {
      const p = S().pet;
      if (p.asleep) return null;
      p.fun = clamp(p.fun + 2); p.bond++; p.petCount++;
      let gotCandy = false;
      if (p.petCount % 10 === 0) {
        if (p.petDay !== dayKey()) { p.petDay = dayKey(); p.petCandy = 0; }
        if (p.petCandy < 30) { p.candy++; p.petCandy++; gotCandy = true; }
      }
      addXP(1); play(S().skin.voice, 0.8); buzz(Haptics.ImpactFeedbackStyle.Soft);
      save(); bump();
      return gotCandy;
    }

    function scrub() {
      const p = S().pet;
      p.clean = clamp(p.clean + 1.2);
      if (p.clean >= 100) {
        p.fun = clamp(p.fun + 5); p.bond += 2; p.baths++; addXP(10);
        toast(`✨ ${petName()} is squeaky clean!`); save(); bump();
        return true;
      }
      bump();
      return false;
    }

    function cleanCrumb(i) {
      const p = S().pet;
      p.crumbs.splice(i, 1); p.clean = clamp(p.clean + 6); p.bond++; addXP(2);
      buzz(Haptics.ImpactFeedbackStyle.Light); save(); bump();
    }

    function toggleSleep() {
      const p = S().pet;
      if (p.asleep) {
        p.asleep = false;
        if (p.energy < 30) { p.fun = clamp(p.fun - 3); toast(`${petName()} is grumpy. Too little sleep 😾`); }
      } else { p.asleep = true; toast(`Lights off. Good night, ${petName()} 🌙`); }
      save(); bump();
    }

    function medicine() {
      const p = S().pet;
      if (p.candy < 15) return;
      p.candy -= 15; p.sick = false;
      ['full', 'fun', 'energy', 'clean'].forEach(k => { p[k] = Math.max(p[k], 30); });
      toast(`${petName()} feels better!`); save(); bump();
    }

    /* acc = {candy, fun, full, clean, energy} gathered during the walk */
    function finishWalk(steps, acc) {
      const p = S().pet;
      const xp = Math.max(10, Math.round(steps / 5));
      p.walks++; p.steps += steps; p.candy += acc.candy;
      p.fun = clamp(p.fun + acc.fun); p.full = clamp(p.full - acc.full); p.clean = clamp(p.clean - acc.clean); p.energy = clamp(p.energy - acc.energy);
      p.bond += 3;
      addXP(xp); save(); bump();
      return xp;
    }

    return { addXP, pop, wear, buy, feed, petTap, scrub, cleanCrumb, toggleSleep, medicine, finishWalk, petName, toast };
  }, []);

  if (!ready || (!fontsLoaded && !fontError)) {
    return <View style={[st.root, st.center]}><ActivityIndicator color={C.ink} /></View>;
  }

  const S = ref.current;
  const g = { S, A, bump, save, toast, go: setView, view, board, boardOn, myRank, askName: () => setNameOpen(true) };

  return (
    <Ctx.Provider value={g}>
      <View style={[st.root, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {TABS.map(([name]) => (
            <View key={name} style={[StyleSheet.absoluteFill, { display: view === name ? 'flex' : 'none' }]}>
              {name === 'Pop' && <PopScreen active={view === 'Pop'} />}
              {name === 'Pet' && <PetScreen active={view === 'Pet'} />}
              {name === 'Mochi' && <ShopScreen active={view === 'Mochi'} />}
              {name === 'Ranks' && <RanksScreen active={view === 'Ranks'} />}
            </View>
          ))}
        </View>

        {toastMsg ? (
          <View pointerEvents="none" style={[st.toast, toastMsg.kind === 'bad' && { backgroundColor: C.hot }, toastMsg.kind === 'gold' && { backgroundColor: C.gold }, { bottom: 84 + insets.bottom }]}>
            <Text style={[st.toastTxt, toastMsg.kind === 'gold' && { color: C.ink }]}>{toastMsg.msg}</Text>
          </View>
        ) : null}

        <View style={[st.tabs, { paddingBottom: Math.max(8, insets.bottom) }]}>
          {TABS.map(([name, e]) => (
            <Pressable key={name} onPress={() => setView(name)} style={[st.tab, view === name && st.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: view === name }}>
              <Text style={st.tabE}>{e}</Text>
              <Text style={[st.tabTxt, view === name && { color: C.ink }]}>{name}</Text>
            </Pressable>
          ))}
        </View>

        <GiftModal
          item={nameOpen ? null : gift}
          onWear={() => { if (gift) A.wear(gift.skin); showNextGift(); }}
          onClose={showNextGift}
        />
        <NameModal
          visible={nameOpen}
          current={S.petName}
          skin={S.skin}
          onCancel={() => setNameOpen(false)}
          onSave={name => { S.petName = name; setNameOpen(false); save(); bump(); toast(`Hello, ${name}! 🍡`); }}
        />
      </View>
    </Ctx.Provider>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 3, borderTopColor: C.ink, paddingTop: 6, paddingHorizontal: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4, borderRadius: 14 },
  tabOn: { backgroundColor: '#D4F1E4' },
  tabE: { fontSize: 20 },
  tabTxt: { fontFamily: F.black, fontSize: 12, color: C.soft },
  toast: { position: 'absolute', alignSelf: 'center', backgroundColor: C.ink, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 18, maxWidth: '92%' },
  toastTxt: { fontFamily: F.black, color: C.bg, textAlign: 'center' },
});
