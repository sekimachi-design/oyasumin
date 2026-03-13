export type SleepLog = {
  date: string; // YYYY-MM-DD
  mood: number | null;
  note: string;
  loggedAt: string; // ISO timestamp
};

export type Settings = {
  name: string;
  targetTime: string; // HH:MM
  onboardingDone: boolean;
};

export type WeeklyStats = {
  streak: number;
  weeklyData: { day: string; score: number }[];
  sleepScore: number;
  highlights: { label: string; value: string; change: string }[];
};
