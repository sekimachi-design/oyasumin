import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SleepLog } from '../constants/Types';

const STORAGE_KEY = '@oyasumin_logs';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function useSleepLogs() {
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setLogs(JSON.parse(raw));
      setLoading(false);
    });
  }, []);

  const save = useCallback(async (next: SleepLog[]) => {
    setLogs(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addLog = useCallback(
    async (mood: number | null, note: string) => {
      const date = todayKey();
      const entry: SleepLog = { date, mood, note, loggedAt: new Date().toISOString() };
      const filtered = logs.filter((l) => l.date !== date);
      await save([...filtered, entry]);
    },
    [logs, save],
  );

  const todayLog = logs.find((l) => l.date === todayKey()) ?? null;

  return { logs, addLog, todayLog, loading };
}
