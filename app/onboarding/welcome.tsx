import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

const c = Colors.dark;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
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
