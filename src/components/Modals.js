import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Mochi from './Mochi';
import { Btn } from './UI';
import { C, F } from '../theme';

export function GiftModal({ item, onWear, onClose }) {
  if (!item) return null;
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <View style={st.back}>
        <View style={st.card}>
          <Text style={st.kicker}>{item.k}</Text>
          <View style={st.art}>
            {item.emoji ? <Text style={{ fontSize: 110 }}>{item.emoji}</Text> : <Mochi skin={item.skin} face={item.face} size={210} />}
          </View>
          <Text style={st.title}>{item.n}</Text>
          <Text style={st.body}>{item.t}</Text>
          <View style={st.row}>
            {item.wear ? <Btn title="Wear now" onPress={onWear} /> : null}
            <Btn title={item.wear ? 'Later' : 'Yay!'} ghost onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function NameModal({ visible, current, skin, onSave, onCancel }) {
  const [v, setV] = useState(current || '');
  const [err, setErr] = useState('');
  useEffect(() => { if (visible) { setV(current || ''); setErr(''); } }, [visible]);
  const save = () => {
    const name = v.replace(/\s+/g, ' ').trim();
    if (!name) { setErr('Give your mochi a name first.'); return; }
    onSave(name.slice(0, 16));
  };
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={() => current && onCancel()}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={st.back}>
        <View style={st.card}>
          <Mochi skin={skin} face={{ sprout: true }} size={130} />
          <Text style={st.title}>Name your mochi</Text>
          <Text style={st.body}>It grows up with you, from a tiny baby to a grand old mochi.</Text>
          <TextInput
            value={v} onChangeText={setV} maxLength={16} placeholder="Mochi-chan" placeholderTextColor="#B9A6C2"
            style={st.input} autoFocus returnKeyType="done" onSubmitEditing={save} />
          {err ? <Text style={st.err}>{err}</Text> : null}
          <View style={st.row}>
            <Btn title="Save name" onPress={save} />
            {current ? <Btn title="Cancel" ghost onPress={onCancel} /> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const st = StyleSheet.create({
  back: { flex: 1, backgroundColor: 'rgba(30,10,40,.55)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 28, padding: 18, width: '100%', maxWidth: 360, alignItems: 'center' },
  kicker: { fontFamily: F.black, color: C.soft, fontSize: 13, textAlign: 'center' },
  art: { marginVertical: 6, alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  title: { fontFamily: F.display, fontSize: 22, color: C.ink, textAlign: 'center', marginTop: 4 },
  body: { fontFamily: F.bold, fontSize: 14, color: C.ink, textAlign: 'center', marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  input: { fontFamily: F.display, fontSize: 20, color: C.ink, borderColor: C.ink, borderWidth: 3, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, width: '100%', textAlign: 'center', backgroundColor: '#fff', marginBottom: 8 },
  err: { fontFamily: F.black, color: C.hot, fontSize: 13, marginBottom: 8 },
});
