import Clipboard from '@react-native-clipboard/clipboard';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ChatMessage } from '../types';
import { getColors, ResolvedTheme } from '../theme/colors';

interface Props {
  message: ChatMessage;
  resolvedTheme: ResolvedTheme;
}

export const MessageBubble = ({ message, resolvedTheme }: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const markdownStyles = createMarkdownStyles(colors, resolvedTheme);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    Clipboard.setString(message.content);
    Alert.alert('Copied', 'Message copied to clipboard.');
  };

  return (
    <Pressable
      onLongPress={handleCopy}
      style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}
    >
      {isUser ? (
        <Text style={styles.userText}>{message.content}</Text>
      ) : (
        <Markdown style={markdownStyles}>{message.content}</Markdown>
      )}
      {!!message.modelUsed && !isUser && <Text style={styles.modelMeta}>{message.modelUsed}</Text>}
    </Pressable>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    bubble: {
      maxWidth: '86%',
      borderRadius: 14,
      marginVertical: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryButtonBackground,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userText: {
    color: colors.primaryButtonText,
    fontSize: 15,
    lineHeight: 22,
  },
  modelMeta: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 11,
  },
});

const createMarkdownStyles = (
  colors: ReturnType<typeof getColors>,
  resolvedTheme: ResolvedTheme,
) => ({
  body: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  code_inline: {
    backgroundColor: resolvedTheme === 'light' ? '#e9e9e9' : '#2e2e2e',
    color: colors.textPrimary,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: resolvedTheme === 'light' ? '#e9e9e9' : '#2e2e2e',
    color: colors.textPrimary,
    padding: 10,
    borderRadius: 8,
  },
  fence: {
    backgroundColor: resolvedTheme === 'light' ? '#e9e9e9' : '#2e2e2e',
    color: colors.textPrimary,
    padding: 10,
    borderRadius: 8,
  },
  link: {
    color: colors.linkText,
  },
  heading1: { color: colors.textPrimary },
  heading2: { color: colors.textPrimary },
  heading3: { color: colors.textPrimary },
  list_item: { color: colors.textPrimary },
});
