import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
import { Colors } from '../../constants/Colors';
import { stretches } from '../../constants/Content';
import { Card } from '../../components/Card';
import { useAudioPlayer } from 'expo-audio';
import { useAudio, TRACKS, TIMER_OPTIONS } from '../../hooks/useAudio';

const stretchBgm = require('../../assets/audio/stretch_bgm.mp3');

const c = Colors.sepia;
const screenWidth = Dimensions.get('window').width;
const cardGap = 10;
const cardWidth = (screenWidth - 40 - cardGap) / 2;

export default function NightScreen() {
  const [selectedTimer, setSelectedTimer] = useState(15);
  const [stretchMode, setStretchMode] = useState(false);
  const [currentStretchIndex, setCurrentStretchIndex] = useState(0);
  const [stretchDone, setStretchDone] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phaseDuration, setPhaseDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const params = useLocalSearchParams<{ trackId?: string; openStretch?: string }>();
  const audio = useAudio();

  const handleTrackSelect = (trackId: string) => {
    const track = TRACKS.find((t) => t.id === trackId);
    if (!track) return;
    audio.play(track, selectedTimer);
  };

  if (params.trackId && !audio.currentTrack) {
    const track = TRACKS.find((t) => t.id === params.trackId);
    if (track) audio.play(track, selectedTimer);
  }

  useEffect(() => {
    if (params.openStretch === 'true' && !stretchMode) {
      startStretch();
    }
  }, [params.openStretch]);

  const bgmPlayer = useAudioPlayer(stretchBgm);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const currentStretch = stretches[currentStretchIndex];
  const currentPhase = currentStretch?.phases[currentPhaseIndex];

  const bgmVolume = useRef(new Animated.Value(1)).current;

  const fadeOutBgm = useCallback(() => {
    Animated.timing(bgmVolume, {
      toValue: 0,
      duration: 3000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start(() => {
      bgmPlayer.pause();
      bgmPlayer.seekTo(0);
      bgmPlayer.volume = 1;
      bgmVolume.setValue(1);
    });

    const listenerId = bgmVolume.addListener(({ value }) => {
      bgmPlayer.volume = value;
    });
    setTimeout(() => bgmVolume.removeListener(listenerId), 3500);
  }, [bgmPlayer, bgmVolume]);

  const startRingAnim = useCallback((seconds: number) => {
    ringAnim.stopAnimation();
    ringAnim.setValue(1);
    Animated.timing(ringAnim, {
      toValue: 0,
      duration: seconds * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [ringAnim]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startStretch = useCallback(() => {
    bgmPlayer.loop = true;
    bgmPlayer.play();
    setStretchMode(true);
    setStretchDone(false);
    setCurrentStretchIndex(0);
    setCurrentPhaseIndex(0);
    const dur = stretches[0].phases[0].duration;
    setCountdown(dur);
    setPhaseDuration(dur);
    startRingAnim(dur);
  }, [bgmPlayer, startRingAnim]);

  useEffect(() => {
    if (!stretchMode || stretchDone) {
      clearTimer();
      return;
    }
    clearTimer();
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCurrentPhaseIndex((pi) => {
            const stretch = stretches[currentStretchIndex];
            if (pi < stretch.phases.length - 1) {
              const nextPi = pi + 1;
              const dur = stretch.phases[nextPi].duration;
              setCountdown(dur);
              setPhaseDuration(dur);
              startRingAnim(dur);
              return nextPi;
            }
            setCurrentStretchIndex((si) => {
              if (si < stretches.length - 1) {
                const nextSi = si + 1;
                const dur = stretches[nextSi].phases[0].duration;
                setCurrentPhaseIndex(0);
                setCountdown(dur);
                setPhaseDuration(dur);
                startRingAnim(dur);
                return nextSi;
              }
              setStretchDone(true);
              fadeOutBgm();
              return si;
            });
            return pi;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [stretchMode, stretchDone, currentStretchIndex, clearTimer]);

  const handleCloseStretch = () => {
    clearTimer();
    fadeOutBgm();
    setStretchMode(false);
    setCurrentStretchIndex(0);
    setCurrentPhaseIndex(0);
    setStretchDone(false);
  };

  const handleSkip = () => {
    if (currentStretchIndex < stretches.length - 1) {
      const next = currentStretchIndex + 1;
      const dur = stretches[next].phases[0].duration;
      setCurrentStretchIndex(next);
      setCurrentPhaseIndex(0);
      setCountdown(dur);
      setPhaseDuration(dur);
      startRingAnim(dur);
    } else {
      setStretchDone(true);
    }
  };

  const timerSize = 80;
  const timerStroke = 5;
  const timerRadius = (timerSize - timerStroke) / 2;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const animatedDashOffset = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [timerCircumference, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {stretchMode || stretchDone ? (
          <Card color={c.card}>
            {stretchDone ? (
              <View style={styles.stretchDoneContainer}>
                <Text style={styles.stretchDoneEmoji}>🌙</Text>
                <Text style={styles.stretchDoneTitle}>おやすみの準備ができました</Text>
                <Text style={styles.stretchDoneDesc}>
                  あとは目を閉じるだけ。{'\n'}いい夢を…
                </Text>
                <Pressable
                  style={styles.stretchCloseBtn}
                  onPress={handleCloseStretch}
                >
                  <Text style={styles.stretchCloseBtnText}>おやすみ</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <View style={styles.stretchTopRow}>
                  <Text style={styles.stretchName}>
                    {currentStretch.emoji} {currentStretch.name}
                  </Text>
                  <Pressable
                    style={styles.stretchCloseXBtn}
                    onPress={handleCloseStretch}
                  >
                    <Text style={styles.stretchCloseX}>✕</Text>
                  </Pressable>
                </View>

                <View style={styles.stretchImageContainer}>
                  <Image
                    source={currentStretch.image}
                    style={[
                      styles.stretchImage,
                      currentPhase?.flipImage && { transform: [{ scaleX: -1 }] },
                    ]}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.stepCard}>
                  <Text style={styles.phaseLabel}>
                    {currentPhaseIndex + 1} / {currentStretch.phases.length}
                  </Text>
                  <Text style={styles.stepText}>
                    {currentPhase?.text.replace(/\n/g, ' ')}
                  </Text>
                </View>

                <View style={styles.timerContainer}>
                  <Svg width={timerSize} height={timerSize}>
                    <Circle
                      cx={timerSize / 2}
                      cy={timerSize / 2}
                      r={timerRadius}
                      stroke={c.border}
                      strokeWidth={timerStroke}
                      fill="none"
                    />
                    <AnimatedCircle
                      cx={timerSize / 2}
                      cy={timerSize / 2}
                      r={timerRadius}
                      stroke={c.accent}
                      strokeWidth={timerStroke}
                      fill="none"
                      strokeDasharray={timerCircumference}
                      strokeDashoffset={animatedDashOffset}
                      strokeLinecap="round"
                      rotation="-90"
                      origin={`${timerSize / 2}, ${timerSize / 2}`}
                    />
                  </Svg>
                  <Text style={styles.clockText}>{countdown}</Text>
                </View>

                <View style={styles.stretchProgressDots}>
                  {stretches.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === currentStretchIndex && styles.dotActive,
                        i < currentStretchIndex && styles.dotDone,
                      ]}
                    />
                  ))}
                </View>

                <Pressable style={styles.skipBtn} onPress={handleSkip}>
                  <Text style={styles.skipBtnText}>スキップ ▶</Text>
                </Pressable>
              </View>
            )}
          </Card>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🌙 ナイトモード</Text>
              <Text style={styles.headerSub}>リラックスして眠りに備えよう</Text>
            </View>

            <Card color={c.card}>
              <Text style={styles.cardLabel}>サウンド</Text>
              <View style={styles.trackGrid}>
                {TRACKS.map((track) => (
                  <Pressable
                    key={track.id}
                    style={{ width: cardWidth }}
                    onPress={() => handleTrackSelect(track.id)}
                  >
                    <ImageBackground
                      source={track.image}
                      style={[
                        styles.trackCard,
                        audio.currentTrack?.id === track.id && styles.trackCardActive,
                      ]}
                      imageStyle={styles.trackCardImage}
                    >
                      <View style={[
                        styles.trackOverlay,
                        audio.currentTrack?.id === track.id && styles.trackOverlayActive,
                      ]}>
                        <Text style={styles.trackIcon}>{track.icon}</Text>
                        <Text style={styles.trackTitle}>{track.title}</Text>
                      </View>
                    </ImageBackground>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.cardLabel, { marginTop: 12 }]}>タイマー</Text>
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

            {audio.currentTrack && (
              <Card color={c.card}>
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
                </View>
              </Card>
            )}

            <Card color={c.card}>
              <Pressable
                style={styles.stretchEntryRow}
                onPress={startStretch}
              >
                <View>
                  <Text style={styles.stretchHeader}>🌙 おやすみルーティン</Text>
                  <Text style={styles.stretchDesc}>深呼吸＋ストレッチで眠りやすい体に</Text>
                </View>
                <View style={styles.stretchStartBtn}>
                  <Text style={styles.stretchStartText}>はじめる</Text>
                </View>
              </Pressable>
            </Card>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.bottomCta,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => router.push('/log')}
        >
          <Text style={styles.bottomCtaText}>おやすみ記録をつける</Text>
          <Text style={styles.bottomCtaArrow}>→</Text>
        </Pressable>
      </View>
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
    paddingBottom: 100,
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
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: c.textSecondary,
    marginTop: 8,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: c.textSecondary,
    marginBottom: 10,
  },
  trackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: cardGap,
  },
  trackCard: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  trackCardActive: {
    borderColor: c.accent,
  },
  trackCardImage: {
    borderRadius: 10,
  },
  trackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackOverlayActive: {
    backgroundColor: 'rgba(200,160,100,0.25)',
  },
  trackIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  trackTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerTitle: {
    fontSize: 17,
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
    alignItems: 'center',
    gap: 10,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnIcon: {
    fontSize: 18,
    color: '#1E1612',
  },
  stopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtnIcon: {
    fontSize: 14,
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
    marginTop: 4,
  },
  stretchEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stretchHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: c.text,
    marginBottom: 4,
  },
  stretchDesc: {
    fontSize: 13,
    color: c.textSecondary,
  },
  stretchStartBtn: {
    backgroundColor: c.accent + '25',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: c.accent,
  },
  stretchStartText: {
    fontSize: 14,
    fontWeight: '600',
    color: c.accent,
  },
  stretchDoneContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  stretchDoneEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  stretchDoneTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
    marginBottom: 4,
  },
  stretchDoneDesc: {
    fontSize: 14,
    color: c.textSecondary,
    marginBottom: 16,
  },
  stretchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stretchName: {
    fontSize: 18,
    fontWeight: '600',
    color: c.text,
  },
  stretchCloseXBtn: {
    padding: 8,
  },
  stretchCloseX: {
    fontSize: 18,
    color: c.textSecondary,
  },
  stretchImageContainer: {
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: c.bg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: c.border,
  },
  stretchImage: {
    width: 160,
    height: 160,
  },
  stepCard: {
    backgroundColor: c.bg,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    gap: 8,
  },
  phaseLabel: {
    fontSize: 12,
    color: c.accent,
    fontWeight: '600',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 16,
    color: c.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  clockText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '700',
    color: c.accent,
  },
  stretchProgressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.border,
  },
  dotActive: {
    backgroundColor: c.accent,
    width: 20,
  },
  dotDone: {
    backgroundColor: c.accent + '60',
  },
  skipBtn: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipBtnText: {
    fontSize: 13,
    color: c.textSecondary,
  },
  stretchCloseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: c.border,
  },
  stretchCloseBtnText: {
    fontSize: 14,
    color: c.textSecondary,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.bg,
  },
  bottomCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.accent,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  bottomCtaText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1612',
  },
  bottomCtaArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1612',
  },
});
