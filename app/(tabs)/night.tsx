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
import { useLocalSearchParams } from 'expo-router';
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

  const stretchIndexRef = useRef(0);
  const phaseIndexRef = useRef(0);
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
    stretchIndexRef.current = 0;
    phaseIndexRef.current = 0;
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
          const si = stretchIndexRef.current;
          const pi = phaseIndexRef.current;
          const stretch = stretches[si];

          if (pi < stretch.phases.length - 1) {
            const nextPi = pi + 1;
            const dur = stretch.phases[nextPi].duration;
            phaseIndexRef.current = nextPi;
            setCurrentPhaseIndex(nextPi);
            setPhaseDuration(dur);
            startRingAnim(dur);
            return dur;
          }

          if (si < stretches.length - 1) {
            const nextSi = si + 1;
            const dur = stretches[nextSi].phases[0].duration;
            stretchIndexRef.current = nextSi;
            phaseIndexRef.current = 0;
            setCurrentStretchIndex(nextSi);
            setCurrentPhaseIndex(0);
            setPhaseDuration(dur);
            startRingAnim(dur);
            return dur;
          }

          setStretchDone(true);
          fadeOutBgm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [stretchMode, stretchDone, clearTimer, startRingAnim, fadeOutBgm]);

  const handleCloseStretch = () => {
    clearTimer();
    fadeOutBgm();
    setStretchMode(false);
    setCurrentStretchIndex(0);
    setCurrentPhaseIndex(0);
    setStretchDone(false);
  };

  const handleSkip = () => {
    const si = stretchIndexRef.current;
    if (si < stretches.length - 1) {
      const next = si + 1;
      const dur = stretches[next].phases[0].duration;
      stretchIndexRef.current = next;
      phaseIndexRef.current = 0;
      setCurrentStretchIndex(next);
      setCurrentPhaseIndex(0);
      setCountdown(dur);
      setPhaseDuration(dur);
      startRingAnim(dur);
    } else {
      setStretchDone(true);
      fadeOutBgm();
    }
  };

  const totalDuration = (si: number) =>
    stretches[si].phases.reduce((sum, p) => sum + p.duration, 0);

  const formatDur = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}秒`;
  };

  const remainingTotal = (() => {
    if (!stretchMode || stretchDone) return 0;
    let rem = countdown;
    for (let p = currentPhaseIndex + 1; p < currentStretch.phases.length; p++) {
      rem += currentStretch.phases[p].duration;
    }
    for (let s = currentStretchIndex + 1; s < stretches.length; s++) {
      rem += totalDuration(s);
    }
    return rem;
  })();

  const currentStretchProgress = (() => {
    if (!stretchMode || stretchDone) return 0;
    const total = totalDuration(currentStretchIndex);
    let remaining = countdown;
    for (let p = currentPhaseIndex + 1; p < currentStretch.phases.length; p++) {
      remaining += currentStretch.phases[p].duration;
    }
    return ((total - remaining) / total) * 100;
  })();


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
                <Text style={styles.remainingText}>
                  残り {formatDur(remainingTotal)}
                </Text>

                <View style={styles.segmentBar}>
                  {stretches.map((s, i) => (
                    <View
                      key={i}
                      style={[
                        styles.segment,
                        { flex: totalDuration(i) },
                        i < currentStretchIndex && styles.segmentDone,
                      ]}
                    >
                      {i === currentStretchIndex && (
                        <View
                          style={[
                            styles.segmentFill,
                            { width: `${currentStretchProgress}%` },
                          ]}
                        />
                      )}
                    </View>
                  ))}
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
                  <Text style={styles.stepText}>
                    {currentPhase?.text.replace(/\n/g, ' ')}
                  </Text>
                </View>


                <View style={styles.timeline}>
                  {stretches.map((s, i) => (
                    <View
                      key={i}
                      style={[
                        styles.timelineItem,
                        i === currentStretchIndex && styles.timelineItemActive,
                      ]}
                    >
                      <Text style={[
                        styles.timelineEmoji,
                        i < currentStretchIndex && styles.timelineDone,
                      ]}>
                        {i < currentStretchIndex ? '✓' : s.emoji}
                      </Text>
                      <Text
                        style={[
                          styles.timelineName,
                          i === currentStretchIndex && styles.timelineNameActive,
                          i < currentStretchIndex && styles.timelineDone,
                        ]}
                        numberOfLines={1}
                      >
                        {s.name}
                      </Text>
                      <Text style={[
                        styles.timelineDur,
                        i < currentStretchIndex && styles.timelineDone,
                      ]}>
                        {formatDur(totalDuration(i))}
                      </Text>
                    </View>
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
              <Text style={styles.headerTitle}>おやすみサウンド</Text>
              <Text style={styles.headerSub}>聴きたい音をタップ</Text>
            </View>

            {TRACKS.filter(t => ['rain', 'fire', 'ocean'].includes(t.id)).map((track) => {
              const isActive = audio.currentTrack?.id === track.id;
              return (
                <Pressable
                  key={track.id}
                  onPress={() => {
                    if (isActive) {
                      audio.togglePlayPause();
                    } else {
                      handleTrackSelect(track.id);
                    }
                  }}
                >
                  <ImageBackground
                    source={track.image}
                    style={[styles.soundCard, isActive && styles.soundCardActive]}
                    imageStyle={styles.soundCardBg}
                  >
                    <View style={[styles.soundOverlay, isActive && styles.soundOverlayActive]}>
                      <Text style={styles.soundIcon}>{track.icon}</Text>
                      <Text style={styles.soundTitle}>{track.title}</Text>
                      {isActive && (
                        <Text style={styles.soundBadge}>
                          {audio.isPlaying ? '▶ 再生中' : '⏸ 停止中'}
                        </Text>
                      )}
                    </View>
                  </ImageBackground>
                </Pressable>
              );
            })}

            {audio.currentTrack && (
              <View style={styles.miniPlayer}>
                <View style={styles.miniPlayerLeft}>
                  <Text style={styles.miniPlayerIcon}>{audio.currentTrack.icon}</Text>
                  <Text style={styles.miniPlayerTitle}>{audio.currentTrack.title}</Text>
                  {audio.remainingSeconds > 0 && (
                    <Text style={styles.miniPlayerTime}>
                      {audio.formatRemaining()}
                    </Text>
                  )}
                </View>
                <View style={styles.miniPlayerRight}>
                  <Pressable style={styles.miniPlayerBtn} onPress={audio.togglePlayPause}>
                    <Text style={styles.miniPlayerBtnText}>
                      {audio.isPlaying ? '⏸' : '▶'}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.miniPlayerStopBtn} onPress={audio.stop}>
                    <Text style={styles.miniPlayerStopText}>⏹</Text>
                  </Pressable>
                </View>
              </View>
            )}

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

            <View style={styles.stretchDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>もっとリラックスしたいときは</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.stretchOptionBtn} onPress={startStretch}>
              <Text style={styles.stretchOptionEmoji}>🧘</Text>
              <View style={styles.stretchOptionInfo}>
                <Text style={styles.stretchOptionTitle}>おやすみストレッチ</Text>
                <Text style={styles.stretchOptionDesc}>5分で体をほぐして眠りやすく</Text>
              </View>
              <Text style={styles.stretchOptionArrow}>▶</Text>
            </Pressable>
          </>
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
  soundCard: {
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  soundCardActive: {
    borderColor: c.accent,
  },
  soundCardBg: {
    borderRadius: 14,
  },
  soundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  soundOverlayActive: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  soundIcon: {
    fontSize: 32,
  },
  soundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  soundBadge: {
    fontSize: 12,
    color: c.accent,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: c.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  miniPlayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniPlayerIcon: {
    fontSize: 20,
  },
  miniPlayerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
  },
  miniPlayerTime: {
    fontSize: 12,
    color: c.accent,
  },
  miniPlayerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniPlayerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayerBtnText: {
    fontSize: 14,
    color: '#1E1612',
  },
  miniPlayerStopBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayerStopText: {
    fontSize: 12,
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
  stretchDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: c.border,
  },
  dividerText: {
    fontSize: 12,
    color: c.textSecondary,
  },
  stretchOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
  },
  stretchOptionEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  stretchOptionInfo: {
    flex: 1,
  },
  stretchOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
  },
  stretchOptionDesc: {
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 2,
  },
  stretchOptionArrow: {
    fontSize: 14,
    color: c.textSecondary,
    marginLeft: 8,
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
    marginTop: 12,
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
  remainingText: {
    fontSize: 12,
    color: c.textSecondary,
    marginTop: 4,
    marginBottom: 10,
  },
  segmentBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    gap: 2,
    marginBottom: 12,
  },
  segment: {
    height: 4,
    borderRadius: 2,
    backgroundColor: c.border,
  },
  segmentDone: {
    backgroundColor: c.accent,
  },
  segmentFill: {
    height: '100%',
    backgroundColor: c.accent,
    borderRadius: 2,
  },
  timeline: {
    marginTop: 16,
    gap: 6,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  timelineItemActive: {
    backgroundColor: c.accent + '15',
    borderWidth: 1,
    borderColor: c.accent + '40',
  },
  timelineEmoji: {
    fontSize: 16,
    width: 28,
    textAlign: 'center',
  },
  timelineName: {
    flex: 1,
    fontSize: 13,
    color: c.textSecondary,
    marginLeft: 6,
  },
  timelineNameActive: {
    color: c.accent,
    fontWeight: '600',
  },
  timelineDur: {
    fontSize: 12,
    color: c.textSecondary,
    marginLeft: 8,
  },
  timelineDone: {
    opacity: 0.4,
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
});
