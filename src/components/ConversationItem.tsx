import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Conversation } from '../types';
import { getColors, ResolvedTheme } from '../theme/colors';

interface Props {
  resolvedTheme: ResolvedTheme;
  item: Conversation;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}

export const ConversationItem = ({ resolvedTheme, item, onPress, onLongPress }: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const subtitle = item.messages[item.messages.length - 1]?.content ?? 'No messages yet';

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      onLongPress={() => onLongPress(item.id)}
      style={styles.card}
    >
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{new Date(item.updatedAt).toLocaleString()}</Text>
      </View>
    </Pressable>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    card: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: 10,
    },
  title: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
