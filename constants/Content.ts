export const moodOptions = [
  { emoji: '😊', label: 'いい感じ' },
  { emoji: '😴', label: 'もう眠い' },
  { emoji: '😤', label: 'まだやりたい' },
  { emoji: '😢', label: 'もやもや' },
];

export const recommendedContent = [
  {
    id: '1',
    title: '雨音',
    subtitle: '環境音 · ループ再生',
    icon: '🌧️',
    trackId: 'rain',
    image: require('../assets/images/rain.jpg'),
  },
  {
    id: '2',
    title: '焚き火',
    subtitle: '環境音 · ループ再生',
    icon: '🔥',
    trackId: 'fire',
    image: require('../assets/images/fire.jpg'),
  },
  {
    id: '3',
    title: '波の音',
    subtitle: '環境音 · ループ再生',
    icon: '🌊',
    trackId: 'ocean',
    image: require('../assets/images/ocean.jpg'),
  },
];

export type StretchPhase = {
  text: string;
  duration: number;
  flipImage?: boolean;
};

export type Stretch = {
  id: string;
  name: string;
  emoji: string;
  image: ReturnType<typeof require>;
  phases: StretchPhase[];
};

export const stretches: Stretch[] = [
  {
    id: 'breathing',
    name: '深呼吸と瞑想',
    emoji: '🧘',
    image: require('../assets/images/stretch/kneehug.png'),
    phases: [
      { text: '目を閉じて楽な姿勢で座ります', duration: 20 },
      { text: '鼻から吸って 口からふーっと吐きます', duration: 20 },
      { text: '呼吸だけに集中 何も考えなくてOK', duration: 20 },
    ],
  },
  {
    id: 'shoulder_front',
    name: '肩のストレッチ',
    emoji: '🙆',
    image: require('../assets/images/stretch/neck.png'),
    phases: [
      { text: '右腕をまっすぐ前に伸ばし\n左手でひじを体に引き寄せます', duration: 30 },
      { text: '反対の腕も同じように\nゆっくり伸ばします', duration: 30, flipImage: true },
    ],
  },
  {
    id: 'shoulder_roll',
    name: '肩回し',
    emoji: '💆',
    image: require('../assets/images/stretch/shoulder.png'),
    phases: [
      { text: '両手を肩に置いて\nひじで後ろにゆっくり回します', duration: 30 },
      { text: 'そのまま前方向にも\nゆっくり回します', duration: 30, flipImage: true },
    ],
  },
  {
    id: 'twist',
    name: 'ひねりストレッチ',
    emoji: '🔄',
    image: require('../assets/images/stretch/twist.png'),
    phases: [
      { text: '右ひざを立てて左足の外側へ\n上体を右にゆっくりひねります', duration: 30 },
      { text: '反対側も同じように\n上体を左にひねります', duration: 30, flipImage: true },
    ],
  },
  {
    id: 'relax',
    name: 'おやすみポーズ',
    emoji: '😌',
    image: require('../assets/images/stretch/relax.png'),
    phases: [
      { text: '仰向けで手足を楽に広げます', duration: 20 },
      { text: 'つま先から順に\nゆっくり力を抜いていきます', duration: 20 },
      { text: '全身リラックス\nそのまま眠ってもOK', duration: 20 },
    ],
  },
];
