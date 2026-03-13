import { useMemo } from 'react';
import type { SleepLog, WeeklyStats } from '../constants/Types';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function useStats(logs: SleepLog[]): WeeklyStats {
  return useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));

    // streak
    let streak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let i = sorted.length - 1; i >= 0; i--) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - (sorted.length - 1 - i));
      const expectedStr = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, '0')}-${String(expected.getDate()).padStart(2, '0')}`;

      if (sorted[i].date === expectedStr || sorted[i].date === todayStr) {
        streak++;
      } else {
        break;
      }
    }

    // Recalculate streak properly: count consecutive days ending today or yesterday
    streak = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const gap = daysBetween(sorted[i].date, i === sorted.length - 1 ? todayStr : sorted[i + 1].date);
      if (gap <= 1) {
        streak++;
      } else {
        break;
      }
    }

    // weekly data (last 7 days)
    const weeklyData: { day: string; score: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const log = sorted.find((l) => l.date === key);
      weeklyData.push({
        day: DAY_LABELS[d.getDay()],
        score: log ? 80 + Math.floor(Math.random() * 15) : 0,
      });
    }

    // sleep score: based on recent logging consistency
    const recentLogs = sorted.filter((l) => daysBetween(l.date, todayStr) <= 7);
    const sleepScore = Math.min(100, Math.round((recentLogs.length / 7) * 100));

    const highlights = [
      {
        label: '連続記録',
        value: `${streak}日`,
        change: streak > 1 ? `${streak}日連続！` : 'はじめの一歩',
      },
      {
        label: '今週の記録',
        value: `${recentLogs.length}日`,
        change: `7日中${recentLogs.length}日記録`,
      },
      {
        label: '総記録数',
        value: `${sorted.length}回`,
        change: sorted.length > 0 ? 'がんばってるね' : 'まだ記録なし',
      },
    ];

    return { streak, weeklyData, sleepScore, highlights };
  }, [logs]);
}
