import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { useStats } from '../../hooks/useStats';
import { Card } from '../../components/Card';
import { ProgressRing } from '../../components/ProgressRing';
import { BarChart } from '../../components/BarChart';

const c = Colors.morning;

export default function ReportScreen() {
  const { logs } = useSleepLogs();
  const stats = useStats(logs);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>おはよう ☀️</Text>
        <Text style={styles.subtitle}>昨夜のレポート</Text>

        <Card color={c.card}>
          <Text style={styles.cardTitle}>スリープスコア</Text>
          <View style={styles.ringContainer}>
            <ProgressRing
              score={stats.sleepScore}
              color={c.accent}
              bgColor={c.border}
              textColor={c.text}
            />
          </View>
        </Card>

        <Card color={c.card}>
          <Text style={styles.cardTitle}>📊 週間スコア</Text>
          <BarChart
            data={stats.weeklyData}
            barColor={c.accent}
            labelColor={c.text}
          />
        </Card>

        <Card color={c.card}>
          <Text style={styles.cardTitle}>✨ ハイライト</Text>
          {stats.highlights.map((item, i) => (
            <View key={i} style={styles.highlightRow}>
              <View>
                <Text style={styles.highlightLabel}>{item.label}</Text>
                <Text style={styles.highlightChange}>{item.change}</Text>
              </View>
              <Text style={styles.highlightValue}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {logs.length === 0 && (
          <Card color={c.card} style={styles.messageCard}>
            <Text style={styles.messageText}>
              まだ記録がありません{'\n'}
              今夜から「おやすみ」を{'\n'}
              タップして始めよう 🌙
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: c.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
    marginBottom: 12,
  },
  ringContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  highlightLabel: {
    fontSize: 14,
    color: c.text,
    fontWeight: '500',
  },
  highlightChange: {
    fontSize: 12,
    color: '#6EE7B7',
    marginTop: 2,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: c.accent,
  },
  messageCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  messageText: {
    fontSize: 16,
    color: c.text,
    textAlign: 'center',
    lineHeight: 26,
  },
});
