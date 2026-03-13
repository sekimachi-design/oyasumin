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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { moodOptions } from '../../constants/Content';
import { useSleepLogs } from '../../hooks/useSleepLogs';
import { Card } from '../../components/Card';

const c = Colors.dark;

export default function LogScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [goodNight, setGoodNight] = useState(false);
  const { addLog, todayLog } = useSleepLogs();

  const opacity = useSharedValue(1);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: 1 - opacity.value,
  }));

  const handleGoodNight = useCallback(async () => {
    await addLog(selectedMood, note);
    opacity.value = withTiming(0, { duration: 2000 });
    setGoodNight(true);
  }, [opacity, selectedMood, note, addLog]);

  if (todayLog && !goodNight) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>💤</Text>
          <Text style={styles.doneTitle}>今日は記録済み</Text>
          <Text style={styles.doneSub}>おやすみなさい</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🌙 締めくくりセレモニー</Text>
        <Text style={styles.subtitle}>今日の自分をねぎらおう</Text>

        <Card color={c.card}>
          <Text style={styles.cardTitle}>今日の気分は？</Text>
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
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="今日の一言..."
            placeholderTextColor={c.textSecondary}
            value={note}
            onChangeText={setNote}
          />
        </Card>

        {!goodNight ? (
          <Pressable
            style={({ pressed }) => [
              styles.goodNightButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleGoodNight}
          >
            <Text style={styles.goodNightText}>おやすみ 🌙</Text>
          </Pressable>
        ) : (
          <View style={styles.goodNightMessage}>
            <Text style={styles.goodNightDone}>おやすみなさい 💤</Text>
            <Text style={styles.goodNightSub}>また明日ね</Text>
          </View>
        )}
      </ScrollView>

      {goodNight && (
        <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />
      )}
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
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  moodButton: {
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
    marginTop: 20,
  },
  goodNightText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  goodNightMessage: {
    alignItems: 'center',
    marginTop: 20,
    padding: 24,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  doneTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: c.text,
  },
  doneSub: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 4,
  },
});
