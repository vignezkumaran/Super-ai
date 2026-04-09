import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { MessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { ChatMessage } from '../types';
import { getColors, ResolvedTheme } from '../theme/colors';

interface Props {
  resolvedTheme: ResolvedTheme;
  messages: ChatMessage[];
  cloudProvider: 'openai' | 'claude';
  cloudModel: string;
  cloudModelOptions: string[];
  isTyping: boolean;
  isLocalAvailable: boolean;
  error: string | null;
  onCloudModelChange: (model: string) => Promise<void>;
  onSend: (prompt: string) => Promise<void>;
  onNewChat: () => Promise<void>;
}

export const ChatScreen = ({
  resolvedTheme,
  messages,
  cloudProvider,
  cloudModel,
  cloudModelOptions,
  isTyping,
  isLocalAvailable,
  error,
  onCloudModelChange,
  onSend,
  onNewChat,
}: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const insets = useSafeAreaInsets();

  const submit = async () => {
    const text = input.trim();
    if (!text) {
      return;
    }
    setInput('');
    await onSend(text);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const appendAttachmentTag = (label: string) => {
    setInput(prev => (prev ? `${prev}\n[Attachment] ${label}` : `[Attachment] ${label}`));
  };

  const pickDocument = async () => {
    try {
      const docs = await pick({ type: [types.allFiles], allowMultiSelection: false });
      const first = docs[0];
      if (first?.name) {
        appendAttachmentTag(first.name);
      }
    } catch (pickerError) {
      if (isErrorWithCode(pickerError) && pickerError.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      Alert.alert('File picker failed', 'Could not pick a file. Please try again.');
    }
  };

  const pickMedia = async (mediaType: 'photo' | 'video') => {
    const response = await launchImageLibrary({ mediaType, selectionLimit: 1 });
    if (response.didCancel) {
      return;
    }

    const first = response.assets?.[0];
    if (first?.fileName || first?.uri) {
      appendAttachmentTag(first.fileName ?? first.uri ?? 'media');
    }
  };

  const onAttachPress = () => {
    Alert.alert('Add attachment', 'Choose what to attach', [
      {
        text: 'Files',
        onPress: () => {
          pickDocument().catch(() => undefined);
        },
      },
      {
        text: 'Photos',
        onPress: () => {
          pickMedia('photo').catch(() => {
            Alert.alert('Photo picker failed', 'Could not open photos.');
          });
        },
      },
      {
        text: 'Videos',
        onPress: () => {
          pickMedia('video').catch(() => {
            Alert.alert('Video picker failed', 'Could not open videos.');
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 8),
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerSlot} />
        <View style={styles.cloudPickerWrap}>
          <Text style={styles.cloudProviderLabel}>{cloudProvider.toUpperCase()}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cloudModelsRow}>
            {cloudModelOptions.map(option => (
              <Pressable
                key={option}
                style={[styles.cloudModelChip, cloudModel === option && styles.cloudModelChipActive]}
                onPress={() => {
                  onCloudModelChange(option).catch(() => undefined);
                }}
              >
                <Text style={[styles.cloudModelText, cloudModel === option && styles.cloudModelTextActive]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <Pressable onPress={onNewChat} style={styles.headerButton}>
          <AppIcon name="plus" size={16} color={colors.primaryButtonText} strokeWidth={2.2} />
          <Text style={styles.headerButtonText}>New</Text>
        </Pressable>
      </View>

      {!isLocalAvailable && (
        <View style={styles.warnBox}>
          <Text style={styles.warnText}>Local model unavailable. Check Ollama connection.</Text>
        </View>
      )}

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        style={styles.messages}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble message={item} resolvedTheme={resolvedTheme} />}
        contentContainerStyle={styles.messageContainer}
        ListFooterComponent={isTyping ? <TypingIndicator resolvedTheme={resolvedTheme} /> : null}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.bottomRow}>
        <Pressable onPress={onAttachPress} style={styles.attachButton}>
          <AppIcon name="paperclip" size={16} color={colors.textSecondary} strokeWidth={2.2} />
        </Pressable>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask anything"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
        <Pressable onPress={submit} style={styles.sendButton}>
          <AppIcon name="send" size={16} color={colors.primaryButtonText} strokeWidth={2.2} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
    },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerSlot: {
    width: 56,
  },
  cloudPickerWrap: {
    flex: 1,
    alignItems: 'center',
  },
  cloudProviderLabel: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 6,
  },
  cloudModelsRow: {
    gap: 6,
  },
  cloudModelChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chipBackground,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cloudModelChipActive: {
    backgroundColor: colors.chipActiveBackground,
    borderColor: colors.chipActiveBackground,
  },
  cloudModelText: {
    color: colors.chipText,
    fontSize: 11,
    fontWeight: '600',
  },
  cloudModelTextActive: {
    color: colors.chipActiveText,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryButtonBackground,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: colors.primaryButtonText,
    fontWeight: '600',
  },
  warnBox: {
    marginTop: 8,
    backgroundColor: colors.warningBackground,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  warnText: {
    color: colors.warningText,
    fontSize: 13,
  },
  errorBox: {
    marginTop: 8,
    backgroundColor: colors.errorBackground,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    color: colors.errorText,
    fontSize: 13,
  },
  messages: {
    flex: 1,
    marginTop: 10,
  },
  messageContainer: {
    paddingBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryButtonBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.secondaryButtonBackground,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
