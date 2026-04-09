import AsyncStorage from '@react-native-async-storage/async-storage';
import { Conversation, Settings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';

export const getSettings = async (): Promise<Settings> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as Settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getConversations = async (): Promise<Conversation[]> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  if (!raw) {
    return [];
  }

  try {
    const data = JSON.parse(raw) as Conversation[];
    return data.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
};

export const saveConversations = async (conversations: Conversation[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
};

export const saveActiveConversationId = async (id: string): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
};

export const getActiveConversationId = async (): Promise<string | null> => {
  return AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
};

export const clearConversations = async (): Promise<void> => {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.CONVERSATIONS),
    AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION),
  ]);
};
