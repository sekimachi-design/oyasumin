import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Card } from '../../components/Card';
import { useAudio, TRACKS, TIMER_OPTIONS } from '../../hooks/useAudio';

const c = Colors.sepia;

export default function NightScreen() {
  const [breathing, setBreathing] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState(15);
  const router = useRouter();
  const params = useLocalSearchParams<{ trackId?: string }>();
  const audio = useAudio();

  const handleTrackSelect = (trackId: string) => {
    const track = TRACKS.find((t) => t.id === trackId);
    if (!track) return;
    audio.play(track, selectedTimer);
  };

  // Auto-play from home screen recommendation
  if (params.trackId && !audio.currentTrack) {
    const track = TRACKS.find((t) => t.id === params.trackId);
    if (track) audio.play(track, selectedTimer);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌙 ナイトモード</Text>
          <Text style={styles.headerSub}>リラックスして眠りに備えよう</Text>
        </View>

        <Card color={c.card}>
          <Text style={styles.cardLabel}>サウンド選択</Text>
          <View style={styles.trackGrid}>
            {TRACKS.map((track) => (
              <Pressable
                key={track.id}
                style={[
                  styles.trackButton,
                  audio.currentTrack?.id === track.id && styles.trackActive,
                ]}
                onPress={() => handleTrackSelect(track.id)}
              >
                <Text style={styles.trackIcon}>{track.icon}</Text>
                <Text style={[
                  styles.trackTitle,
                  audio.currentTrack?.id === track.id && styles.trackTitleActive,
                ]}>
                  {track.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {audio.currentTrack && (
          <Card color={c.card}>
            <Text style={styles.cardLabel}>再生中</Text>
            <View style={styles.playerRow}>
              <Text style={styles.playerIcon}>{audio.currentTrack.icon}</Text>
              <View style={styles.playerInfo}>
                <Text style={styles.playerTitle}>{audio.currentTrack.title}</Text>
                {audio.remainingSeconds > 0 && (
                  <Text style={styles.playerSub}>
                    残り {audio.formatRemaining()}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.controlsRow}>
              <Pressable
                style={styles.playBtn}
                onPress={audio.togglePlayPause}
              >
                <Text style={styles.playBtnIcon}>
                  {audio.isPlaying ? '⏸' : '▶'}
                </Text>
              </Pressable>
              <Pressable style={styles.stopBtn} onPress={audio.stop}>
                <Text style={styles.stopBtnIcon}>⏹</Text>
              </Pressable>
            </View>
          </Card>
        )}

        <Card color={c.card}>
          <Text style={styles.cardLabel}>タイマー</Text>
          <View style={styles.timerRow}>
            {TIMER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.minutes}
                style={[
                  styles.timerButton,
                  selectedTimer === opt.minutes && styles.timerActive,
                ]}
                onPress={() => setSelectedTimer(opt.minutes)}
              >
                <Text style={[
                  styles.timerText,
                  selectedTimer === opt.minutes && styles.timerTextActive,
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card color={c.card}>
          <Text style={styles.cardLabel}>SNSを見たくなったら...</Text>
          <Pressable
            style={[
              styles.breathButton,
              breathing && styles.breathButtonActive,
            ]}
            onPress={() => setBreathing(!breathing)}
          >
            <Text style={styles.breathEmoji}>{breathing ? '🫁' : '🌬️'}</Text>
            <Text style={styles.breathText}>
              {breathing ? '吸って... 吐いて...' : '深呼吸してみよう'}
            </Text>
          </Pressable>
          {breathing && (
            <Text style={styles.breathHint}>
              4秒吸って、7秒止めて、8秒吐く
            </Text>
          )}
        </Card>

        <Pressable
          style={({ pressed }) => [
            styles.ceremonyButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => router.push('/log')}
        >
          <Text style={styles.ceremonyText}>セレモニーへ進む</Text>
          <Text style={styles.ceremonyArrow}>→</Text>
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
  header: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: c.text,
  },
  headerSub: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 4,
  },
  cardLabel: {
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: 10,
  },
  trackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trackButton: {
    alignItems: 'center',
    backgroundColor: c.bg,
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    borderWidth: 1,
    borderColor: c.border,
  },
  trackActive: {
    borderColor: c.accent,
    backgroundColor: c.accent + '20',
  },
  trackIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  trackTitle: {
    fontSize: 12,
    color: c.textSecondary,
  },
  trackTitleActive: {
    color: c.accent,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: c.text,
  },
  playerSub: {
    fontSize: 13,
    color: c.accent,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnIcon: {
    fontSize: 22,
    color: '#1E1612',
  },
  stopBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtnIcon: {
    fontSize: 18,
    color: c.text,
  },
  timerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timerButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: c.bg,
    borderWidth: 1,
    borderColor: c.border,
  },
  timerActive: {
    borderColor: c.accent,
    backgroundColor: c.accent + '20',
  },
  timerText: {
    fontSize: 14,
    color: c.textSecondary,
  },
  timerTextActive: {
    color: c.accent,
  },
  breathButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
  },
  breathButtonActive: {
    borderColor: c.accent,
    backgroundColor: c.accent + '15',
  },
  breathEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  breathText: {
    fontSize: 16,
    color: c.text,
    fontWeight: '500',
  },
  breathHint: {
    fontSize: 13,
    color: c.accent,
    textAlign: 'center',
    marginTop: 10,
  },
  ceremonyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.accent,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
  },
  ceremonyText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1612',
  },
  ceremonyArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1612',
  },
});
