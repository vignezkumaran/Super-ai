import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import { getColors, ResolvedTheme } from '../theme/colors';
import { CloudProvider, Settings } from '../types';
import { CLOUD_PROVIDER_MODELS, CLOUD_PROVIDERS, PROVIDER_USAGE_LIMITS } from '../utils/constants';

interface Props {
  resolvedTheme: ResolvedTheme;
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => Promise<void>;
  appUserEmail: string;
}

const getProviderApiKey = (settings: Settings, provider: CloudProvider): string => {
  if (provider === 'openai') {
    return settings.openaiApiKey;
  }
  if (provider === 'deepseek') {
    return settings.deepseekApiKey;
  }
  return settings.claudeApiKey;
};

const getProviderSignedIn = (settings: Settings, provider: CloudProvider): boolean => {
  if (provider === 'openai') {
    return settings.openaiSignedIn;
  }
  if (provider === 'deepseek') {
    return settings.deepseekSignedIn;
  }
  return settings.claudeSignedIn;
};

const getProviderEmail = (settings: Settings, provider: CloudProvider): string => {
  if (provider === 'openai') {
    return settings.openaiAccountEmail;
  }
  if (provider === 'deepseek') {
    return settings.deepseekAccountEmail;
  }
  return settings.claudeAccountEmail;
};

export const ProvidersScreen = ({ resolvedTheme, settings, onUpdate, appUserEmail }: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  const provider = settings.cloudProvider;
  const modelOptions = CLOUD_PROVIDER_MODELS[provider];
  const isSignedIn = getProviderSignedIn(settings, provider);
  const accountEmail = getProviderEmail(settings, provider);
  const apiKey = getProviderApiKey(settings, provider);

  const runUpdate = (patch: Partial<Settings>) => {
    onUpdate(patch).catch(error => {
      const message = error instanceof Error ? error.message : 'Update failed.';
      Alert.alert('Provider update failed', message);
    });
  };

  const onProviderChange = (nextProvider: CloudProvider) => {
    const nextModels = CLOUD_PROVIDER_MODELS[nextProvider];
    const nextModel = nextModels.includes(settings.cloudModel) ? settings.cloudModel : nextModels[0];
    runUpdate({ cloudProvider: nextProvider, cloudModel: nextModel });
  };

  const onApiKeyChange = (value: string) => {
    if (provider === 'openai') {
      runUpdate({ openaiApiKey: value });
      return;
    }
    if (provider === 'deepseek') {
      runUpdate({ deepseekApiKey: value });
      return;
    }
    runUpdate({ claudeApiKey: value });
  };

  const setSignedOut = () => {
    if (provider === 'openai') {
      runUpdate({ openaiSignedIn: false, openaiAccountEmail: '' });
      return;
    }
    if (provider === 'deepseek') {
      runUpdate({ deepseekSignedIn: false, deepseekAccountEmail: '' });
      return;
    }
    runUpdate({ claudeSignedIn: false, claudeAccountEmail: '' });
  };

  const setSignedIn = (email: string) => {
    if (provider === 'openai') {
      runUpdate({ openaiSignedIn: true, openaiAccountEmail: email });
      return;
    }
    if (provider === 'deepseek') {
      runUpdate({ deepseekSignedIn: true, deepseekAccountEmail: email });
      return;
    }
    runUpdate({ claudeSignedIn: true, claudeAccountEmail: email });
  };

  const onSignIn = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        `Sign in to ${provider.toUpperCase()}`,
        'Enter account email',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign in',
            onPress: (value?: string) => {
              const email = (value || '').trim();
              if (!email) {
                return;
              }
              setSignedIn(email);
            },
          },
        ],
        'plain-text',
      );
      return;
    }

    Alert.alert(
      `Sign in to ${provider.toUpperCase()}`,
      'Sign-in uses native prompt on iOS. On Android, add API key and continue.',
    );
  };

  const canUseProvider = isSignedIn || !!apiKey.trim();
  const usageLimitText = PROVIDER_USAGE_LIMITS[provider];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        ...styles.content,
        paddingTop: Math.max(insets.top, 12),
        paddingBottom: Math.max(insets.bottom + 20, 24),
      }}
    >
      <View style={styles.headingRow}>
        <AppIcon name="cloud" size={18} color={colors.textPrimary} strokeWidth={2.2} />
        <Text style={styles.heading}>Cloud Providers</Text>
      </View>

      <Text style={styles.helper}>Use account login (Google/email) or API key for each provider.</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.section}>Provider</Text>
        <View style={styles.rowWrap}>
          {CLOUD_PROVIDERS.map(item => (
            <Pressable
              key={item}
              onPress={() => onProviderChange(item)}
              style={[styles.chip, provider === item && styles.chipActive]}
            >
              <Text style={[styles.chipText, provider === item && styles.chipTextActive]}>{item.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.section}>Account</Text>
        <Text style={styles.helper}>Current: {isSignedIn ? `Signed in as ${accountEmail}` : 'Not signed in'}</Text>
        <View style={styles.rowWrap}>
          <Pressable
            onPress={() => {
              if (!appUserEmail) {
                Alert.alert('Not logged in', 'Login with Google or email first to connect provider accounts.');
                return;
              }
              setSignedIn(appUserEmail);
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Connect with Logged-in Account</Text>
          </Pressable>
          <Pressable onPress={onSignIn} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Sign In Manually</Text>
          </Pressable>
          <Pressable onPress={setSignedOut} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Sign Out</Text>
          </Pressable>
        </View>
        <Text style={styles.usageHint}>{usageLimitText}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.section}>API Key (Optional)</Text>
        <TextInput
          value={apiKey}
          onChangeText={onApiKeyChange}
          placeholder="Enter API key"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
        />
        <Text style={styles.helper}>
          {canUseProvider
            ? 'Provider is ready to use in chat.'
            : 'Sign in or add an API key to use this provider.'}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.section}>Model</Text>
        {canUseProvider ? (
          <View style={styles.rowWrap}>
            {modelOptions.map(model => (
              <Pressable
                key={model}
                onPress={() => runUpdate({ cloudModel: model })}
                style={[styles.chip, settings.cloudModel === model && styles.chipActive]}
              >
                <Text style={[styles.chipText, settings.cloudModel === model && styles.chipTextActive]}>{model}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.helper}>Login to provider account or add API key to view/select models.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    content: {
      paddingHorizontal: 12,
    },
    heading: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
    },
    sectionCard: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.surface,
      padding: 12,
    },
    section: {
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: 8,
    },
    helper: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 4,
    },
    rowWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    chip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.chipBackground,
    },
    chipActive: {
      backgroundColor: colors.chipActiveBackground,
      borderColor: colors.chipActiveBackground,
    },
    chipText: {
      color: colors.chipText,
      fontSize: 12,
      fontWeight: '600',
    },
    chipTextActive: {
      color: colors.chipActiveText,
    },
    input: {
      marginTop: 8,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      color: colors.textPrimary,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    primaryButton: {
      backgroundColor: colors.primaryButtonBackground,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    primaryButtonText: {
      color: colors.primaryButtonText,
      fontWeight: '700',
    },
    secondaryButton: {
      backgroundColor: colors.secondaryButtonBackground,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.secondaryButtonText,
      fontWeight: '700',
    },
    usageHint: {
      color: colors.infoText,
      fontSize: 12,
      marginTop: 10,
    },
  });
