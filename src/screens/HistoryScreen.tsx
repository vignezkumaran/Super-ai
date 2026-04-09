import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '../components/AppIcon';
import { ConversationItem } from '../components/ConversationItem';
import { Conversation } from '../types';
import { getColors, ResolvedTheme } from '../theme/colors';

interface Props {
  resolvedTheme: ResolvedTheme;
  conversations: Conversation[];
  onSelect: (id: string) => Promise<void>;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const HistoryScreen = ({ resolvedTheme, conversations, onSelect, onRename, onDelete }: Props) => {
  const colors = getColors(resolvedTheme);
  const styles = createStyles(colors);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return conversations;
    }

    return conversations.filter(item => {
      const titleHit = item.title.toLowerCase().includes(normalized);
      const messageHit = item.messages.some(message =>
        message.content.toLowerCase().includes(normalized),
      );
      return titleHit || messageHit;
    });
  }, [conversations, query]);

  const openMenu = (id: string) => {
    Alert.alert('Conversation', 'Choose an action', [
      {
        text: 'Rename',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Alert.prompt('Rename conversation', undefined, async text => {
              await onRename(id, text || 'Untitled');
            });
            return;
          }

          Alert.alert(
            'Rename on Android',
            'Rename currently uses iOS prompt. Long press and use iOS simulator/device for custom rename, or update title from source for now.',
          );
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await onDelete(id);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.header}>
        <AppIcon name="clock" size={18} color={colors.textPrimary} strokeWidth={2.2} />
        <Text style={styles.title}>History</Text>
      </View>
      <View style={styles.searchWrap}>
        <AppIcon name="search" size={15} color={colors.textMuted} strokeWidth={2.2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          placeholder="Search conversations"
          placeholderTextColor={colors.textMuted}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            item={item}
            onPress={onSelect}
            onLongPress={openMenu}
            resolvedTheme={resolvedTheme}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No saved conversations yet.</Text>
          </View>
        }
      />
      <Pressable
        onPress={() => setQuery('')}
        style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
      >
        <View style={styles.clearRow}>
          <AppIcon name="x-circle" size={14} color={colors.secondaryButtonText} strokeWidth={2.2} />
          <Text style={styles.clearText}>Clear Search</Text>
        </View>
      </Pressable>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 12,
    },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  search: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 30,
  },
  emptyText: {
    color: colors.textMuted,
  },
  clearButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.secondaryButtonBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearText: {
    color: colors.secondaryButtonText,
    fontWeight: '600',
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
  },
});
