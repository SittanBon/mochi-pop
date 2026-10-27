import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { C, F } from '../theme';

export function Bar({ value, color = C.mint, height = 10, style }) {
  return (
    <View style={[{ height, borderRadius: 99, backgroundColor: C.track, overflow: 'hidden' }, style]}>
      <View style={{ width: `${Math.max(2, Math.min(100, value))}%`, height: '100%', backgroundColor: color, borderRadius: 99 }} />
    </View>
  );
}

export function Btn({ title, onPress, disabled, ghost, small, style, textStyle }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn, small && s.btnSm, ghost && s.btnGhost,
        disabled && { opacity: 0.45 }, pressed && !disabled && { transform: [{ scale: 0.96 }] }, style,
      ]}>
      <Text style={[s.btnTxt, small && { fontSize: 13 }, ghost && { color: C.ink }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

export function Pill({ children, style }) {
  return <View style={[s.pill, style]}><Text style={s.pillTxt}>{children}</Text></View>;
}

/* A little text that floats up and fades away. */
export function Floater({ p, onDone }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: p.big ? 1100 : 700, useNativeDriver: true }).start(() => onDone(p.id));
  }, []);
  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        s.float, p.big && s.say,
        { left: p.x - 16, top: p.y - 34, color: p.color || C.ink, fontSize: p.size || 22 },
        p.glow && { textShadowColor: p.glow, textShadowRadius: 8 },
        {
          opacity: a.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.8, 0] }),
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) },
            { translateX: a.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx || 0] }) },
          ],
        },
      ]}>
      {p.text}
    </Animated.Text>
  );
}

export const s = StyleSheet.create({
  btn: { backgroundColor: C.ink, borderColor: C.ink, borderWidth: 3, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16, alignItems: 'center' },
  btnSm: { paddingVertical: 5, paddingHorizontal: 11, borderWidth: 2 },
  btnGhost: { backgroundColor: 'transparent' },
  btnTxt: { color: C.card, fontFamily: F.black, fontSize: 15 },
  pill: { backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
  pillTxt: { fontFamily: F.display, fontSize: 16, color: C.ink },
  float: { position: 'absolute', fontFamily: F.display, zIndex: 10 },
  say: { fontFamily: F.black, fontSize: 16, backgroundColor: C.card, borderColor: C.ink, borderWidth: 3, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, overflow: 'hidden' },
});
