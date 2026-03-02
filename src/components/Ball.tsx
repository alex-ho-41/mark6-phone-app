import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getBallColor } from '../utils/lotteryUtils';
import { scale } from '../utils/scale';

interface BallProps {
  number: number;
  size?: 'default' | 'small';
}

/**
 * 中式燈籠造型的號碼容器
 * 參考 assets/code.html 的設計
 */
export const Ball: React.FC<BallProps> = React.memo(({ number, size = 'default' }) => {
  const baseColor = getBallColor(number);
  const isSmall = size === 'small';

  const lanternW = isSmall ? scale(36) : scale(48);
  const lanternH = isSmall ? scale(47) : scale(62);
  const fontSize = isSmall ? scale(17) : scale(22);
  const capH = isSmall ? scale(4) : scale(6);
  const capTop = isSmall ? scale(-3) : scale(-4);
  const capBot = isSmall ? scale(-3) : scale(-4);
  const stringH = isSmall ? scale(8) : scale(10);
  const tasselSize = isSmall ? scale(6) : scale(7);

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      <View
        style={[
          styles.lantern,
          { width: lanternW, height: lanternH, backgroundColor: baseColor, borderColor: '#d4af37' },
        ]}
      >
        <View style={[styles.goldCapTop, { height: capH, top: capTop }]} />
        <View style={styles.stripe} />
        <Text style={[styles.text, { fontSize }]}>{number}</Text>
        <View style={[styles.goldCapBottom, { height: capH, bottom: capBot }]} />
      </View>

      <View style={[styles.string, { height: stringH }]} />
      <View
        style={[
          styles.tassel,
          { width: tasselSize, height: tasselSize, borderRadius: tasselSize / 2, backgroundColor: baseColor },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerSmall: {},
  lantern: {
    borderRadius: 8,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    position: 'relative',
  },
  goldCapTop: {
    position: 'absolute',
    width: '60%',
    backgroundColor: '#d4af37',
    borderRadius: 2,
  },
  goldCapBottom: {
    position: 'absolute',
    width: '60%',
    backgroundColor: '#d4af37',
    borderRadius: 2,
  },
  stripe: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    left: '48%',
  },
  text: {
    color: '#fcd34d',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
  string: {
    width: 2,
    backgroundColor: '#d4af37',
  },
  tassel: {
    borderWidth: 1,
    borderColor: '#d4af37',
  },
});
