import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '../context';
import Mochi from '../components/Mochi';
import { Btn } from '../components/UI';
import { C, F } from '../theme';
import { PRESETS, PRICE, skinKey, cleanSkin, presetOf, auraOf } from '../mochi';
import { levelInfo, phaseOf, myFace, fmt } from '../game';

export default function ShopScreen() {
  const { S, A, askName, myRank } = useGame();
  const li = levelInfo(S.pet.xp), ph = phaseOf(li.L), au = auraOf(S.lifetime);
  const owned = PRESETS.filter(c => S.owned[c.id]).length;
  const cur = skinKey(S.skin);

  return (
    <ScrollView contentContainerStyle={st.wrap}>
      <View style={st.hero}>
        <Mochi skin={S.skin} face={myFace(S, myRank)} size={260} grow={ph.s} />
        <Pressable onPress={askName} style={st.nameRow} accessibilityLabel="Rename your mochi">
          <Text style={st.name}>{S.petName || 'Mochi'}</Text><Text style={{ fontSize: 17 }}>✏️</Text>
        </Pressable>
        <Text style={st.sub}>
          Lv {li.L} {ph.n} {ph.e}{au.id ? ` · ${au.e} ${au.n} aura` : ''} · wearing {presetOf(S.skin)?.n || 'a custom look'}
        </Text>
      </View>
      <View style={st.wallet}>
        <View style={st.candy}><Text style={st.candyTxt}>🍬 {fmt(S.pet.candy)}</Text></View>
        <Text style={st.sub}>{owned} of {PRESETS.length} mochi collected</Text>
      </View>

      <Text style={st.h2}>Mochi shop</Text>
      <Text style={st.lede}>Spend candy to collect new mochi. Get candy from popping, candy chests, walks and petting.</Text>
      <View style={st.grid}>
        {PRESETS.map(c => {
          const own = !!S.owned[c.id], s = cleanSkin(c.s), wearing = skinKey(s) === cur;
          const price = PRICE[c.id] || 0, can = S.pet.candy >= price;
          return (
            <View key={c.id} style={[st.card, wearing && st.cardOn]}>
              <View style={{ alignItems: 'center' }}><Mochi skin={s} size={118} /></View>
              <Text style={st.cardT}>{c.n}</Text>
              <Text style={st.cardD} numberOfLines={3}>{c.t}</Text>
              {own ? (
                <Btn small title={wearing ? 'Wearing' : 'Wear'} disabled={wearing} onPress={() => A.wear(s)} style={{ alignSelf: 'flex-start' }} />
              ) : (
                <View>
                  <Btn small title={`Buy · 🍬 ${fmt(price)}`} disabled={!can} onPress={() => A.buy(c)} style={{ alignSelf: 'flex-start' }} />
                  {!can ? <Text style={st.need}>{fmt(price - S.pet.candy)} more 🍬 needed</Text> : null}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40 },
  hero: { alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  name: { fontFamily: F.display, fontSize: 26, color: C.ink },
  sub: { fontFamily: F.bold, fontSize: 13, color: C.soft, textAlign: 'center' },
  wallet: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  candy: { backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 12 },
  candyTxt: { fontFamily: F.display, fontSize: 16, color: C.ink },
  h2: { fontFamily: F.display, fontSize: 21, color: C.ink, marginTop: 18 },
  lede: { fontFamily: F.bold, fontSize: 13.5, color: C.soft, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  card: { width: '48.5%', backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 22, padding: 10, gap: 4 },
  cardOn: { borderColor: C.mint },
  cardT: { fontFamily: F.display, fontSize: 14, color: C.ink },
  cardD: { fontFamily: F.bold, fontSize: 12, color: C.soft, minHeight: 46 },
  need: { fontFamily: F.bold, fontSize: 11.5, color: C.soft, marginTop: 3 },
});
