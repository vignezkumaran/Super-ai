import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ResolvedTheme, getColors } from '../theme/colors';

interface Props {
  resolvedTheme: ResolvedTheme;
  onEmailLogin: (email: string, password: string) => Promise<unknown>;
  onEmailSignup: (email: string, password: string) => Promise<unknown>;
  onGoogleLogin: () => Promise<unknown>;
}

export const AuthScreen = ({ resolvedTheme, onEmailLogin, onEmailSignup, onGoogleLogin }: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    if (busy) {
      return;
    }

    setBusy(true);
    try {
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed.';
      Alert.alert('Authentication Error', message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Login with email or Google to continue.</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <Pressable
        style={styles.primaryButton}
        onPress={() => run(() => onEmailLogin(email.trim(), password))}
      >
        <Text style={styles.primaryButtonText}>{busy ? 'Please wait...' : 'Login with Email'}</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => run(() => onEmailSignup(email.trim(), password))}
      >
        <Text style={styles.secondaryButtonText}>Sign Up with Email</Text>
      </Pressable>

      <Pressable
        style={styles.googleButton}
        onPress={() => run(onGoogleLogin)}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      justifyContent: 'center',
      gap: 10,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      color: colors.textPrimary,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    primaryButton: {
      marginTop: 8,
      backgroundColor: colors.primaryButtonBackground,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: colors.primaryButtonText,
      fontWeight: '700',
    },
    secondaryButton: {
      backgroundColor: colors.secondaryButtonBackground,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.secondaryButtonText,
      fontWeight: '700',
    },
    googleButton: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingVertical: 11,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    googleButtonText: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
  });
