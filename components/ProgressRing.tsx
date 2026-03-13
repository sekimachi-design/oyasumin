import { View, Text, StyleSheet } from 'react-native';

type Props = {
  score: number;
  size?: number;
  color?: string;
  bgColor?: string;
  textColor?: string;
};

export function ProgressRing({
  score,
  size = 160,
  color = '#FF7F6E',
  bgColor = '#F0D8C0',
  textColor = '#2D1810',
}: Props) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: bgColor,
            borderWidth: 12,
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: 'transparent',
            borderTopColor: color,
            borderRightColor: score > 25 ? color : 'transparent',
            borderBottomColor: score > 50 ? color : 'transparent',
            borderLeftColor: score > 75 ? color : 'transparent',
            borderWidth: 12,
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.score, { color: textColor }]}>{score}</Text>
        <Text style={[styles.label, { color: textColor, opacity: 0.6 }]}>
          スコア
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 40,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    marginTop: 2,
  },
});
