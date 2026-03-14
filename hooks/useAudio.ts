import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioPlayer, AudioModule } from 'expo-audio';

export type Track = {
  id: string;
  title: string;
  icon: string;
  image: ReturnType<typeof require>;
  file: ReturnType<typeof require>;
};

export const TRACKS: Track[] = [
  { id: 'rain', title: '雨音', icon: '🌧️', image: require('../assets/images/rain.jpg'), file: require('../assets/audio/rain.mp3') },
  { id: 'fire', title: '焚き火', icon: '🔥', image: require('../assets/images/fire.jpg'), file: require('../assets/audio/fire.mp3') },
  { id: 'ocean', title: '波の音', icon: '🌊', image: require('../assets/images/ocean.jpg'), file: require('../assets/audio/ocean.mp3') },
  { id: 'forest', title: '森林', icon: '🌲', image: require('../assets/images/forest.jpg'), file: require('../assets/audio/forest.mp3') },
  { id: 'whitenoise', title: 'ホワイトノイズ', icon: '🌀', image: require('../assets/images/whitenoise.jpg'), file: require('../assets/audio/whitenoise.mp3') },
];

export const TIMER_OPTIONS = [
  { label: '5分', minutes: 5 },
  { label: '10分', minutes: 10 },
  { label: '15分', minutes: 15 },
  { label: '20分', minutes: 20 },
  { label: '30分', minutes: 30 },
  { label: 'なし', minutes: 0 },
];

export function useAudio() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const player = useAudioPlayer(currentTrack?.file ?? null);

  useEffect(() => {
    AudioModule.setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  useEffect(() => {
    if (!currentTrack) return;
    player.loop = true;
    player.play();
    setIsPlaying(true);
  }, [currentTrack]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const play = useCallback((track: Track, timer: number = 0) => {
    setCurrentTrack(track);
    setTimerMinutes(timer);
    if (timer > 0) {
      setRemainingSeconds(timer * 60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            player.pause();
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, player]);

  const stop = useCallback(() => {
    player.pause();
    setIsPlaying(false);
    setCurrentTrack(null);
    setRemainingSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [player]);

  const formatRemaining = useCallback(() => {
    if (remainingSeconds <= 0) return '';
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [remainingSeconds]);

  return {
    currentTrack,
    isPlaying,
    timerMinutes,
    remainingSeconds,
    play,
    togglePlayPause,
    stop,
    formatRemaining,
  };
}
