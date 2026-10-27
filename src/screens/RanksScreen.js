import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '../context';
import Mochi from '../components/Mochi';
import { C, F } from '../theme';
import { cleanSkin, presetOf } from '../mochi';
import { MOOD_E, fmt } from '../game';

export default function RanksScreen() {
  const { S, board, boardOn } = useGame();
  if (!boardOn) {
    return (
      <ScrollView contentContainerStyle={st.wrap}>
        <Text style={st.h2}>Live rankings</Text>
        <View style={st.card}>
          <Text style={st.body}>Rankings turn on when the app is connected to Firebase, the free online database that shares everyone's pops.</Text>
          <Text style={st.body}>Follow the "Turn on the leaderboard" steps in README.md, paste your settings into src/firebaseConfig.js, and restart the app.</Text>
          <Text style={[st.body, { marginBottom: 0 }]}>Everything else works without it.</Text>
        </View>
      </ScrollView>
    );
  }
  return (
    <ScrollView contentContainerStyle={st.wrap}>
      <Text style={st.h2}>Live rankings</Text>
      <Text style={st.lede}>Top 50 solo poppers. Top 3 get a gold, silver or bronze ring on their aura.</Text>
      {board.length === 0 ? <Text style={st.body}>Nobody on the board yet. Start popping.</Text> : null}
      {board.map((p, i) => {
        const me = p.id === S.deviceId;
        const skin = cleanSkin(p.skin);
        return (
          <View key={p.id} style={[st.row, i < 3 && { backgroundColor: ['#FBE7B0', '#EEF1F5', '#F4D9C6'][i] }, me && st.me]}>
            <Text style={st.rk}>{['🥇', '🥈', '🥉'][i] || i + 1}</Text>
            <Mochi skin={skin} face={{ aura: { id: typeof p.aura === 'string' ? p.aura : '', pw: typeof p.ap === 'number' ? p.ap : 0.6, rank: i < 3 ? i + 1 : 0 } }} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={st.nm} numberOfLines={1}>{String(p.name || 'Mochi').slice(0, 16)}{me ? ' (you)' : ''}</Text>
              <Text style={st.sm} numberOfLines={1}>{MOOD_E[p.mood] || ''} Lv {Number(p.lv) || 1} · {presetOf(skin)?.n || 'custom look'}</Text>
            </View>
            <Text style={st.pt}>{fmt(Number(p.solo) || 0)}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40 },
  h2: { fontFamily: F.display, fontSize: 22, color: C.ink, marginBottom: 4 },
  lede: { fontFamily: F.bold, fontSize: 13.5, color: C.soft, marginBottom: 10 },
  card: { backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 20, padding: 14, marginTop: 8 },
  body: { fontFamily: F.bold, fontSize: 14, color: C.ink, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 18, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 7 },
  me: { borderColor: C.mint },
  rk: { fontFamily: F.display, fontSize: 17, width: 30, textAlign: 'center', color: C.ink },
  nm: { fontFamily: F.black, fontSize: 14.5, color: C.ink },
  sm: { fontFamily: F.bold, fontSize: 12, color: C.soft },
  pt: { fontFamily: F.display, fontSize: 16, color: C.ink },
});
