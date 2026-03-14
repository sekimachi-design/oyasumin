import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

const c = Colors.dark;

function newProblem() {
  const a = Math.floor(Math.random() * 90) + 10;
  const b = Math.floor(Math.random() * 90) + 10;
  return { a, b, answer: a + b };
}

function toDigits(n: number, len: number): (number | null)[] {
  const s = n.toString();
  const arr: (number | null)[] = [];
  for (let i = 0; i < len - s.length; i++) arr.push(null);
  for (const ch of s) arr.push(Number(ch));
  return arr;
}

export default function DrillScreen() {
  const [problem, setProblem] = useState(newProblem);
  const [input, setInput] = useState<number[]>([]);
  const [status, setStatus] = useState<'input' | 'correct' | 'wrong'>('input');
  const [score, setScore] = useState(0);

  const ansLen = problem.answer.toString().length;
  const cols = ansLen;

  const aDigits = toDigits(problem.a, cols);
  const bDigits = toDigits(problem.b, cols);

  const ansDisplay: (number | null)[] = [];
  for (let i = 0; i < cols; i++) {
    const fromRight = cols - 1 - i;
    ansDisplay.push(fromRight < input.length ? input[fromRight] : null);
  }

  const tapDigit = (d: number) => {
    if (status === 'correct') return;
    if (input.length >= ansLen) return;
    if (status === 'wrong') setStatus('input');

    const next = [...input, d];
    setInput(next);

    if (next.length === ansLen) {
      let val = 0;
      for (let i = 0; i < next.length; i++) val += next[i] * (10 ** i);
      if (val === problem.answer) {
        setStatus('correct');
        setScore(s => s + 1);
      } else {
        setStatus('wrong');
      }
    }
  };

  const tapUndo = () => {
    if (status === 'correct') return;
    setStatus('input');
    setInput(prev => prev.slice(0, -1));
  };

  const tapNext = () => {
    setProblem(newProblem());
    setInput([]);
    setStatus('input');
  };

  const CELL = 56;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>純太郎専用計算ドリル</Text>
        <Text style={styles.scoreText}>🎯 {score}もん</Text>
      </View>

      <View style={styles.problemArea}>
        <View style={styles.digitRow}>
          <View style={{ width: CELL }} />
          {aDigits.map((d, i) => (
            <View key={i} style={[styles.cell, { width: CELL }]}>
              <Text style={styles.digit}>{d ?? ''}</Text>
            </View>
          ))}
        </View>

        <View style={styles.digitRow}>
          <View style={[styles.cell, { width: CELL }]}>
            <Text style={styles.operator}>+</Text>
          </View>
          {bDigits.map((d, i) => (
            <View key={i} style={[styles.cell, { width: CELL }]}>
              <Text style={styles.digit}>{d ?? ''}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.line, { width: CELL * (cols + 1) }]} />

        <View style={styles.digitRow}>
          <View style={{ width: CELL }} />
          {ansDisplay.map((d, i) => (
            <View
              key={i}
              style={[
                styles.cell,
                { width: CELL },
                styles.answerCell,
                d !== null && styles.answerFilled,
                status === 'correct' && styles.answerCorrect,
                status === 'wrong' && styles.answerWrong,
              ]}
            >
              <Text style={[styles.digit, styles.answerDigit]}>
                {d ?? ''}
              </Text>
            </View>
          ))}
        </View>

        {status === 'correct' && (
          <Pressable onPress={tapNext} style={styles.feedback}>
            <Text style={styles.correctText}>⭕ せいかい！</Text>
            <Text style={styles.nextHint}>タップでつぎへ</Text>
          </Pressable>
        )}
        {status === 'wrong' && (
          <View style={styles.feedback}>
            <Text style={styles.wrongText}>❌ もういちど！</Text>
          </View>
        )}
      </View>

      <View style={styles.pad}>
        {[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((row, ri) => (
          <View key={ri} style={styles.padRow}>
            {row.map(d => (
              <Pressable
                key={d}
                style={({ pressed }) => [styles.padBtn, pressed && styles.padPressed]}
                onPress={() => tapDigit(d)}
              >
                <Text style={styles.padText}>{d}</Text>
              </Pressable>
            ))}
          </View>
        ))}
        <View style={styles.padRow}>
          <Pressable
            style={({ pressed }) => [styles.padBtn, styles.undoBtn, pressed && styles.padPressed]}
            onPress={tapUndo}
          >
            <Text style={styles.undoText}>⌫</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.padBtn, pressed && styles.padPressed]}
            onPress={() => tapDigit(0)}
          >
            <Text style={styles.padText}>0</Text>
          </Pressable>
          {status === 'correct' ? (
            <Pressable
              style={({ pressed }) => [styles.padBtn, styles.nextBtn, pressed && styles.padPressed]}
              onPress={tapNext}
            >
              <Text style={styles.nextBtnText}>つぎ →</Text>
            </Pressable>
          ) : (
            <View style={[styles.padBtn, { backgroundColor: 'transparent' }]} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: c.accent,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
  },
  problemArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitRow: {
    flexDirection: 'row',
  },
  cell: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digit: {
    fontSize: 38,
    fontWeight: '700',
    color: c.text,
  },
  operator: {
    fontSize: 32,
    fontWeight: '600',
    color: c.textSecondary,
  },
  line: {
    height: 3,
    backgroundColor: c.text,
    marginVertical: 8,
    borderRadius: 2,
  },
  answerCell: {
    borderBottomWidth: 2,
    borderBottomColor: c.border,
    marginHorizontal: 3,
    borderRadius: 4,
  },
  answerFilled: {
    borderBottomColor: c.accent,
  },
  answerCorrect: {
    backgroundColor: c.accent + '20',
    borderBottomColor: c.accent,
  },
  answerWrong: {
    backgroundColor: '#FF444420',
    borderBottomColor: '#FF4444',
  },
  answerDigit: {
    color: c.accent,
  },
  feedback: {
    marginTop: 20,
    alignItems: 'center',
  },
  correctText: {
    fontSize: 24,
    fontWeight: '700',
    color: c.accent,
  },
  nextHint: {
    fontSize: 13,
    color: c.textSecondary,
    marginTop: 4,
  },
  wrongText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  pad: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  padRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  padBtn: {
    width: 80,
    height: 56,
    borderRadius: 14,
    backgroundColor: c.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padPressed: {
    opacity: 0.6,
  },
  padText: {
    fontSize: 26,
    fontWeight: '600',
    color: c.text,
  },
  undoBtn: {
    backgroundColor: c.border,
  },
  undoText: {
    fontSize: 24,
    color: c.text,
  },
  nextBtn: {
    backgroundColor: c.accent,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#120A26',
  },
});
