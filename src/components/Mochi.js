import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { mochiSVG } from '../mochi';
import { MOCHI_RATIO } from '../theme';

/* Draws a mochi. `open` shows the squished, mouth-open face (only when canOpen). */
export default function Mochi({ skin, face = null, size = 120, open = false, canOpen = false, grow = 1, silhouette = false }) {
  const key = JSON.stringify([skin, face]);
  const closedXml = useMemo(() => mochiSVG(skin, true, '', face), [key]);
  const openXml = useMemo(() => (canOpen ? mochiSVG(skin, false, '', face, true) : null), [key, canOpen]);
  const h = size * MOCHI_RATIO;
  const layer = { transform: [{ translateY: h * (1 - grow) * 0.4 }, { scale: grow }] };
  return (
    <View style={{ width: size, height: h, opacity: silhouette ? 0.35 : 1 }} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, layer, { opacity: open && openXml ? 0 : 1 }]}>
        <SvgXml xml={silhouette ? closedXml.replace(/fill="#(?!3B1F4A)[0-9A-Fa-f]{3,6}"/g, 'fill="#3B1F4A"') : closedXml} width={size} height={h} />
      </View>
      {openXml ? (
        <View style={[StyleSheet.absoluteFill, layer, { opacity: open ? 1 : 0 }]}>
          <SvgXml xml={openXml} width={size} height={h} />
        </View>
      ) : null}
    </View>
  );
}
