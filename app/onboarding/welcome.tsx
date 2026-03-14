import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

const c = Colors.dark;

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.floor((i * 37 + 13) % 100)}%` as const,
  top: `${Math.floor((i * 53 + 7) % 100)}%` as const,
  size: (i % 3) + 1,
  opacity: 0.3 + (i % 5) * 0.15,
}));

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#0B0620', '#1A0E3A', '#2D1654', '#120A26']}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      {STARS.map((star) => (
        <View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🌙</Text>
          <Text style={styles.title}>おやすみん</Text>
          <Text style={styles.subtitle}>
            毎晩のおやすみ習慣を{'\n'}やさしくサポートします
          </Text>
        </View>
        <View style={styles.bottom}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => router.push('/onboarding/setup')}
          >
            <Text style={styles.buttonText}>はじめる</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  star: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: c.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  bottom: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: c.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#120A26',
  },
});
