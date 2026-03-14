import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { moodOptions } from '../../constants/Content';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { Card } from '../../components/Card';

const c = Colors.dark;

export default function LogScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [goodNight, setGoodNight] = useState(false);
  const { logs, addLog, todayLog } = useSleepLogs();
  const router = useRouter();

  const handleGoodNight = useCallback(async () => {
    await addLog(selectedMood, note);
    setGoodNight(true);
  }, [selectedMood, note, addLog]);

  const recentLogs = [...logs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>📝 おやすみログ</Text>
        <Text style={styles.subtitle}>毎日の記録を残そう</Text>

        {todayLog && !goodNight ? (
          <Card color={c.card}>
            <View style={styles.doneRow}>
              <Text style={styles.doneEmoji}>✅</Text>
              <View>
                <Text style={styles.doneTitle}>今日は記録済み</Text>
                <Text style={styles.doneSub}>
                  {todayLog.mood !== null
                    ? `気分: ${moodOptions[todayLog.mood]?.emoji ?? ''}`
                    : 'おやすみなさい'}
                  {todayLog.note ? ` — ${todayLog.note}` : ''}
                </Text>
              </View>
            </View>
          </Card>
        ) : !goodNight ? (
          <>
            <Card color={c.card}>
              <Text style={styles.cardTitle}>🌙 今日の締めくくり</Text>
              <Text style={styles.cardSub}>気分を選んで、今日を終えよう</Text>
              <View style={styles.moodRow}>
                {moodOptions.map((mood, i) => (
                  <Pressable
                    key={i}
                    style={[
                      styles.moodButton,
                      selectedMood === i && styles.moodSelected,
                    ]}
                    onPress={() => setSelectedMood(i)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[
                      styles.moodLabel,
                      selectedMood === i && { color: c.accent },
                    ]}>
                      {mood.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                style={styles.noteInput}
                placeholder="今日の一言（任意）..."
                placeholderTextColor={c.textSecondary}
                value={note}
                onChangeText={setNote}
              />
            </Card>

            <Pressable
              style={({ pressed }) => [
                styles.goodNightButton,
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleGoodNight}
            >
              <Text style={styles.goodNightText}>おやすみ 🌙</Text>
            </Pressable>
          </>
        ) : (
          <Card color={c.card}>
            <View style={styles.goodNightMessage}>
              <Text style={styles.goodNightDone}>おやすみなさい 💤</Text>
              <Text style={styles.goodNightSub}>また明日ね</Text>
              <Pressable
                style={styles.backButton}
                onPress={() => {
                  setGoodNight(false);
                  router.push('/(tabs)');
                }}
              >
                <Text style={styles.backButtonText}>ホームに戻る</Text>
              </Pressable>
            </View>
          </Card>
        )}

        {recentLogs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>最近の記録</Text>
            {recentLogs.map((log) => (
              <Card key={log.date} color={c.card}>
                <View style={styles.logRow}>
                  <Text style={styles.logDate}>{formatDate(log.date)}</Text>
                  <Text style={styles.logMood}>
                    {log.mood !== null ? moodOptions[log.mood]?.emoji ?? '—' : '—'}
                  </Text>
                  <Text style={styles.logNote} numberOfLines={1}>
                    {log.note || '—'}
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}

        {recentLogs.length === 0 && (todayLog || goodNight) === false && (
          <Card color={c.card} style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌟</Text>
            <Text style={styles.emptyText}>
              上の「おやすみ」ボタンで{'\n'}最初の記録をつけよう
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
  title: {
    fontSize: 24,
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
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  moodSelected: {
    backgroundColor: c.accent + '30',
    borderWidth: 1,
    borderColor: c.accent,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 11,
    color: c.textSecondary,
    marginTop: 4,
  },
  noteInput: {
    backgroundColor: c.bg,
    borderRadius: 10,
    padding: 12,
    color: c.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: c.border,
  },
  goodNightButton: {
    backgroundColor: '#6E5AE8',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  goodNightText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goodNightMessage: {
    alignItems: 'center',
    padding: 16,
  },
  goodNightDone: {
    fontSize: 24,
    fontWeight: '700',
    color: c.accent,
  },
  goodNightSub: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 4,
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: c.border,
  },
  backButtonText: {
    fontSize: 14,
    color: c.text,
    fontWeight: '500',
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doneEmoji: {
    fontSize: 28,
  },
  doneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },
  doneSub: {
    fontSize: 13,
    color: c.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: c.text,
    marginTop: 24,
    marginBottom: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
    width: 40,
  },
  logMood: {
    fontSize: 20,
    width: 30,
  },
  logNote: {
    fontSize: 14,
    color: c.text,
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
