import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { moodOptions } from '../../constants/Content';
import { useSettings } from '../../hooks/useSettings';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { useStats } from '../../hooks/useStats';
import { Card } from '../../components/Card';

const c = Colors.dark;

const moodResponses = [
  'いい調子！このまま穏やかに過ごそう',
  'もうひと息。ゆっくり眠りに向かおう',
  'よく頑張ったね。今日はもうおしまい',
  'そんな日もあるよ。深呼吸してみよう',
];

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const router = useRouter();
  const { settings } = useSettings();
  const { logs } = useSleepLogs();
  const stats = useStats(logs);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>
          {settings.name || 'ゲスト'}さん、おつかれさま
        </Text>
        <Text style={styles.subGreeting}>今日もよく頑張りました</Text>

        <Card color={c.card}>
          <Text style={styles.cardTitle}>今夜のおやすみプラン</Text>
          <View style={styles.planRow}>
            <View style={styles.planItem}>
              <Text style={styles.planValue}>{settings.targetTime}</Text>
              <Text style={styles.planLabel}>目標時刻</Text>
            </View>
            <View style={styles.planDivider} />
            <View style={styles.planItem}>
              <Text style={styles.planValue}>{stats.streak}日</Text>
              <Text style={styles.planLabel}>連続記録</Text>
            </View>
          </View>
        </Card>

        <Card color={c.card}>
          <Text style={styles.cardTitle}>今の気分は？</Text>
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
          {selectedMood !== null && (
            <View style={styles.moodResponse}>
              <Text style={styles.moodResponseText}>
                {moodResponses[selectedMood]}
              </Text>
            </View>
          )}
        </Card>

        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => router.push('/night')}
        >
          <Text style={styles.ctaEmoji}>🌙</Text>
          <Text style={styles.ctaText}>おやすみ準備をはじめる</Text>
        </Pressable>
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
    fontSize: 24,
    fontWeight: '700',
    color: c.text,
    marginTop: 8,
  },
  subGreeting: {
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
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planItem: {
    flex: 1,
    alignItems: 'center',
  },
  planValue: {
    fontSize: 28,
    fontWeight: '700',
    color: c.accent,
  },
  planLabel: {
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 4,
  },
  planDivider: {
    width: 1,
    height: 40,
    backgroundColor: c.border,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    minWidth: 68,
  },
  moodSelected: {
    backgroundColor: c.accent + '30',
    borderWidth: 1,
    borderColor: c.accent,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: 11,
    color: c.textSecondary,
    marginTop: 4,
  },
  moodResponse: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: c.border,
    alignItems: 'center',
  },
  moodResponseText: {
    fontSize: 14,
    color: c.accent,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: c.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  ctaEmoji: {
    fontSize: 28,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#120A26',
  },
});
