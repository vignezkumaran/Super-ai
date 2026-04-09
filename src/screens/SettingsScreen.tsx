import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import { CloudProvider, Settings, ThemeMode } from '../types';
import { getColors, ResolvedTheme } from '../theme/colors';

interface Props {
  resolvedTheme: ResolvedTheme;
  settings: Settings;
  localModels: string[];
  isLocalAvailable: boolean;
  settingsError: string | null;
  onUpdate: (patch: Partial<Settings>) => Promise<void>;
  onPullModel: (modelName: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
}

const CLOUD_PROVIDERS: CloudProvider[] = ['openai', 'claude'];

export const SettingsScreen = ({
  resolvedTheme,
  settings,
  localModels,
  isLocalAvailable,
  settingsError,
  onUpdate,
  onPullModel,
  onClearHistory,
}: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const [modelToPull, setModelToPull] = useState('llama3.2:3b');
  const insets = useSafeAreaInsets();
  const [hostDraft, setHostDraft] = useState(settings.ollama.host);
  const [portDraft, setPortDraft] = useState(settings.ollama.port);
  const themeModes: ThemeMode[] = ['system', 'dark', 'light'];

  const cycleThemeMode = () => {
    const currentIndex = themeModes.indexOf(settings.themeMode);
    const nextMode = themeModes[(currentIndex + 1) % themeModes.length];
    runUpdate({ themeMode: nextMode });
  };

  useEffect(() => {
    setHostDraft(settings.ollama.host);
    setPortDraft(settings.ollama.port);
  }, [settings.ollama.host, settings.ollama.port]);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Request failed. Please try again.';
  };

  const runUpdate = (patch: Partial<Settings>) => {
    onUpdate(patch).catch(error => {
      Alert.alert('Settings update failed', getErrorMessage(error));
    });
  };

  const saveOllamaHost = async () => {
    const nextHost = hostDraft.trim();
    if (!nextHost || nextHost === settings.ollama.host) {
      return;
    }

    await onUpdate({ ollama: { ...settings.ollama, host: nextHost } });
  };

  const saveOllamaPort = async () => {
    const nextPort = portDraft.trim();
    if (!nextPort || nextPort === settings.ollama.port) {
      return;
    }

    await onUpdate({ ollama: { ...settings.ollama, port: nextPort } });
  };

  const openPrivacy = () => {
    Linking.openURL('https://github.com/your-org/superai/blob/main/PRIVACY.md').catch(() => {
      Alert.alert('Could not open link', 'Please check your internet connection.');
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom + 24, 30),
        },
      ]}
    >
      <View style={styles.headingRow}>
        <AppIcon name="settings" size={18} color={colors.textPrimary} strokeWidth={2.2} />
        <Text style={styles.heading}>Settings</Text>
      </View>

      {!!settingsError && <Text style={styles.errorText}>{settingsError}</Text>}

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <AppIcon name="cloud" size={14} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.section}>Cloud Provider APIs</Text>
        </View>
        <View style={styles.row}>
          {CLOUD_PROVIDERS.map(provider => (
            <Pressable
              key={provider}
              onPress={() => runUpdate({ cloudProvider: provider })}
              style={[
                styles.chip,
                settings.cloudProvider === provider ? styles.chipActive : undefined,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  settings.cloudProvider === provider ? styles.chipTextActive : undefined,
                ]}
              >
                {provider.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>OpenAI API Key</Text>
        <TextInput
          value={settings.openaiApiKey}
          onChangeText={text => runUpdate({ openaiApiKey: text })}
          placeholder="sk-..."
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
        />

        <Text style={styles.label}>Claude API Key</Text>
        <TextInput
          value={settings.claudeApiKey}
          onChangeText={text => runUpdate({ claudeApiKey: text })}
          placeholder="sk-ant-..."
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <AppIcon name="info" size={14} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.section}>Appearance</Text>
        </View>
        <Pressable onPress={cycleThemeMode} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>
            Theme: {settings.themeMode.toUpperCase()} (Tap to cycle)
          </Text>
        </Pressable>
        <View style={styles.rowWrap}>
          {themeModes.map(mode => (
            <Pressable
              key={mode}
              onPress={() => runUpdate({ themeMode: mode })}
              style={[styles.chip, settings.themeMode === mode && styles.chipActive]}
            >
              <Text style={[styles.chipText, settings.themeMode === mode && styles.chipTextActive]}>
                {mode.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <AppIcon name="cpu" size={14} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.section}>Cloud Model Defaults</Text>
        </View>
        <View style={styles.rowWrap}>
          {(settings.cloudProvider === 'openai'
            ? ['gpt-3.5-turbo', 'gpt-4']
            : ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20240620']
          ).map(model => (
            <Pressable
              key={model}
              onPress={() => runUpdate({ cloudModel: model })}
              style={[styles.chip, settings.cloudModel === model && styles.chipActive]}
            >
              <Text style={[styles.chipText, settings.cloudModel === model && styles.chipTextActive]}>
                {model}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <AppIcon name="hard-drive" size={14} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.section}>Local Runtime (Ollama)</Text>
        </View>
        <Text style={styles.label}>Host</Text>
        <TextInput
          value={hostDraft}
          onChangeText={setHostDraft}
          onBlur={() => {
            saveOllamaHost().catch(error => {
              Alert.alert('Host update failed', getErrorMessage(error));
            });
          }}
          style={styles.input}
          placeholder="http://localhost"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.label}>Port</Text>
        <TextInput
          value={portDraft}
          onChangeText={setPortDraft}
          onBlur={() => {
            saveOllamaPort().catch(error => {
              Alert.alert('Port update failed', getErrorMessage(error));
            });
          }}
          style={styles.input}
          keyboardType="number-pad"
          placeholder="11434"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.status}>
          {isLocalAvailable ? 'Local Status: Available' : 'Local Status: Unavailable'}
        </Text>

        <Text style={styles.label}>Pull New Model</Text>
        <View style={styles.inlineRow}>
          <TextInput
            value={modelToPull}
            onChangeText={setModelToPull}
            style={[styles.input, styles.inlineInput]}
            placeholder="model name"
            placeholderTextColor={colors.textMuted}
          />
          <Pressable
            onPress={async () => {
              try {
                await onPullModel(modelToPull);
                Alert.alert('Model pull requested', modelToPull);
              } catch (error) {
                Alert.alert('Model pull failed', getErrorMessage(error));
              }
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Pull</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Installed Local Models</Text>
        <View style={styles.rowWrap}>
          {localModels.length ? (
            localModels.map(model => (
              <Pressable
                key={model}
                onPress={() => runUpdate({ localModel: model })}
                style={[styles.chip, settings.localModel === model && styles.chipActive]}
              >
                <Text style={[styles.chipText, settings.localModel === model && styles.chipTextActive]}>
                  {model}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.helperText}>No models detected from Ollama.</Text>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <AppIcon name="shuffle" size={14} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.section}>Runtime Routing Mode</Text>
        </View>
        <View style={styles.rowWrap}>
          {(['local', 'cloud', 'auto'] as const).map(mode => (
            <Pressable
              key={mode}
              onPress={() => runUpdate({ mode })}
              style={[styles.chip, settings.mode === mode && styles.chipActive]}
            >
              <Text style={[styles.chipText, settings.mode === mode && styles.chipTextActive]}>
                {mode.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={onClearHistory}
        style={styles.dangerButton}
      >
        <View style={styles.buttonRow}>
          <AppIcon name="trash-2" size={14} color={colors.dangerText} strokeWidth={2.2} />
          <Text style={styles.dangerText}>Clear Conversation History</Text>
        </View>
      </Pressable>

      <Pressable onPress={openPrivacy} style={styles.linkButton}>
        <View style={styles.buttonRow}>
          <AppIcon name="shield" size={14} color={colors.linkText} strokeWidth={2.2} />
          <Text style={styles.linkText}>Privacy Policy</Text>
        </View>
      </Pressable>

      <View style={styles.aboutBox}>
        <View style={styles.sectionHeader}>
          <AppIcon name="info" size={14} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={styles.aboutTitle}>About Rocket</Text>
        </View>
        <Text style={styles.aboutText}>
          Privacy-first chat app combining local Ollama models and cloud AI providers in one place.
        </Text>
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
  content: {
    padding: 12,
  },
  heading: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.errorText,
    marginBottom: 10,
    lineHeight: 20,
  },
  section: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 12,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 8,
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
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  status: {
    marginTop: 10,
    color: colors.infoText,
    fontWeight: '600',
  },
  helperText: {
    color: colors.textMuted,
    marginBottom: 8,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineInput: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: colors.primaryButtonBackground,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: colors.primaryButtonText,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerButton: {
    marginTop: 18,
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerText: {
    color: colors.dangerText,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: colors.linkText,
    fontWeight: '600',
  },
  aboutBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 12,
  },
  aboutTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  aboutText: {
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
