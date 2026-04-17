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
import { ChatMessage, CloudProvider, Conversation } from '../types';
import { getColors, ResolvedTheme } from '../theme/colors';
import { ConversationItem } from '../components/ConversationItem';

interface Props {
  resolvedTheme: ResolvedTheme;
  messages: ChatMessage[];
  conversations: Conversation[];
  cloudProvider: CloudProvider;
  cloudModel: string;
  cloudModelOptions: string[];
  isTyping: boolean;
  isLocalAvailable: boolean;
  error: string | null;
  onCloudModelChange: (model: string) => Promise<void>;
  onSend: (prompt: string) => Promise<void>;
  onNewChat: () => Promise<void>;
  onSelectConversation: (id: string) => Promise<void>;
  onRenameConversation: (id: string, title: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
}

export const ChatScreen = ({
  resolvedTheme,
  messages,
  conversations,
  cloudProvider,
  cloudModel,
  cloudModelOptions,
  isTyping,
  isLocalAvailable,
  error,
  onCloudModelChange,
  onSend,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const [input, setInput] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
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

  const openConversationMenu = (id: string) => {
    Alert.alert('Conversation', 'Choose an action', [
      {
        text: 'Rename',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Alert.prompt('Rename conversation', undefined, async text => {
              await onRenameConversation(id, text || 'Untitled');
            });
            return;
          }

          Alert.alert('Rename', 'Rename prompt is currently available on iOS.');
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await onDeleteConversation(id);
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
        <Pressable onPress={() => setShowHistorySidebar(true)} style={styles.iconButton}>
          <AppIcon name="clock" size={16} color={colors.textPrimary} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.cloudPickerWrap}>
          <Pressable
            style={styles.dropdownTrigger}
            onPress={() => setShowModelDropdown(prev => !prev)}
          >
            <Text style={styles.dropdownProviderText}>{cloudProvider.toUpperCase()}</Text>
            <Text numberOfLines={1} style={styles.dropdownTriggerText}>{cloudModel}</Text>
            <AppIcon name="chevron-down" size={14} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>

          {showModelDropdown && (
            <View style={styles.dropdownMenu}>
              <ScrollView style={styles.dropdownScroll}>
                {cloudModelOptions.map(option => {
                  const active = cloudModel === option;
                  return (
                    <Pressable
                      key={option}
                      style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                      onPress={() => {
                        onCloudModelChange(option).catch(() => undefined);
                        setShowModelDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
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

      {showHistorySidebar && (
        <View style={styles.historyOverlay}>
          <View style={styles.historySidebar}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>History</Text>
              <Pressable onPress={() => setShowHistorySidebar(false)} style={styles.iconButton}>
                <AppIcon name="x-circle" size={16} color={colors.textPrimary} strokeWidth={2.2} />
              </Pressable>
            </View>
            <FlatList
              data={conversations}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ConversationItem
                  item={item}
                  resolvedTheme={resolvedTheme}
                  onPress={id => {
                    onSelectConversation(id).catch(() => undefined);
                    setShowHistorySidebar(false);
                  }}
                  onLongPress={openConversationMenu}
                />
              )}
              ListEmptyComponent={<Text style={styles.historyEmpty}>No saved conversations yet.</Text>}
            />
          </View>
          <Pressable style={styles.historyBackdrop} onPress={() => setShowHistorySidebar(false)} />
        </View>
      )}
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
      gap: 8,
      zIndex: 10,
    },
    iconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    cloudPickerWrap: {
      flex: 1,
      position: 'relative',
    },
    dropdownTrigger: {
      borderRadius: 999,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 7,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    dropdownProviderText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    dropdownTriggerText: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    dropdownMenu: {
      position: 'absolute',
      top: 44,
      left: 0,
      right: 0,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 12,
      maxHeight: 220,
      zIndex: 20,
    },
    dropdownScroll: {
      padding: 6,
    },
    dropdownItem: {
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 8,
    },
    dropdownItemActive: {
      backgroundColor: colors.chipActiveBackground,
    },
    dropdownItemText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    dropdownItemTextActive: {
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
    historyOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 40,
      flexDirection: 'row',
    },
    historyBackdrop: {
      flex: 1,
      backgroundColor: '#00000055',
    },
    historySidebar: {
      width: '80%',
      maxWidth: 360,
      backgroundColor: colors.background,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      paddingHorizontal: 12,
      paddingTop: Math.max(16, insetsStaticPadding),
      paddingBottom: 20,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    historyTitle: {
      color: colors.textPrimary,
      fontWeight: '700',
      fontSize: 18,
    },
    historyEmpty: {
      color: colors.textMuted,
      marginTop: 10,
    },
  });

const insetsStaticPadding = 8;
