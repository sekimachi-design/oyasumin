import { View, Text, StyleSheet } from 'react-native';

type DataPoint = {
  day: string;
  score: number;
};

type Props = {
  data: DataPoint[];
  barColor?: string;
  labelColor?: string;
  height?: number;
};

export function BarChart({
  data,
  barColor = '#FF7F6E',
  labelColor = '#2D1810',
  height = 120,
}: Props) {
  const maxScore = Math.max(...data.map((d) => d.score));

  return (
    <View style={styles.container}>
      <View style={[styles.barsRow, { height }]}>
        {data.map((item, i) => {
          const barHeight = (item.score / maxScore) * height * 0.85;
          const isToday = i === data.length - 1;
          return (
            <View key={item.day} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isToday ? barColor : barColor + '60',
                    borderRadius: 6,
                  },
                ]}
              />
              <Text style={[styles.dayLabel, { color: labelColor }]}>
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 28,
    minHeight: 8,
  },
  dayLabel: {
    fontSize: 12,
    marginTop: 6,
    opacity: 0.7,
  },
});
