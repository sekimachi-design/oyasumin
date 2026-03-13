import { View, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  color?: string;
};

export function Card({ children, style, color = '#231941' }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: color }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
});
