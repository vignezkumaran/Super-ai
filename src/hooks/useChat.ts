import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateCloudResponse } from '../services/CloudService';
import { generateLocalResponse, isOllamaReachable } from '../services/LocalService';
import { routeMode } from '../services/RouterService';
import { ChatMessage, Conversation, Mode, SendChatResult, Settings } from '../types';
import {
  clearConversations,
  getActiveConversationId,
  getConversations,
  saveActiveConversationId,
  saveConversations,
} from '../utils/storage';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const makeConversationTitle = (prompt: string): string => {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return 'Untitled';
  }
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}...` : trimmed;
};

export const useChat = (settings: Settings, isLocalAvailable: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConversation = useMemo(
    () => conversations.find(item => item.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const persistState = useCallback(async (nextConversations: Conversation[], nextActiveId: string) => {
    // Keep UI state and AsyncStorage in sync on every conversation mutation.
    setConversations(nextConversations);
    setActiveConversationId(nextActiveId);
    await saveConversations(nextConversations);
    await saveActiveConversationId(nextActiveId);
  }, []);

  useEffect(() => {
    const init = async () => {
      const [storedConversations, storedActiveId] = await Promise.all([
        getConversations(),
        getActiveConversationId(),
      ]);

      setConversations(storedConversations);

      const fallbackId = storedConversations[0]?.id ?? null;
      const nextActiveId =
        storedActiveId && storedConversations.some(item => item.id === storedActiveId)
          ? storedActiveId
          : fallbackId;

      setActiveConversationId(nextActiveId);
      setMessages(storedConversations.find(item => item.id === nextActiveId)?.messages ?? []);
    };

    init();
  }, []);

  const upsertConversation = useCallback(
    async (nextMessages: ChatMessage[], prompt: string) => {
      const now = Date.now();
      const targetId = activeConversationId ?? createId();
      const exists = conversations.some(item => item.id === targetId);

      const nextConversation: Conversation = {
        id: targetId,
        title: exists
          ? conversations.find(item => item.id === targetId)?.title ?? makeConversationTitle(prompt)
          : makeConversationTitle(prompt),
        createdAt: exists
          ? conversations.find(item => item.id === targetId)?.createdAt ?? now
          : now,
        updatedAt: now,
        messages: nextMessages,
      };

      // Always bubble the latest updated thread to the top of history.
      const remaining = conversations.filter(item => item.id !== targetId);
      const updated = [nextConversation, ...remaining].sort((a, b) => b.updatedAt - a.updatedAt);
      await persistState(updated, targetId);
    },
    [activeConversationId, conversations, persistState],
  );

  const pickMode = useCallback(
    (prompt: string): Mode => {
      if (settings.mode === 'auto') {
        return routeMode(prompt);
      }
      return settings.mode;
    },
    [settings.mode],
  );

  const sendToModel = useCallback(
    async (prompt: string, history: ChatMessage[]): Promise<SendChatResult> => {
      const modeUsed = pickMode(prompt);

      if (modeUsed === 'local') {
        if (!isLocalAvailable) {
          throw new Error('Local mode is unavailable. Check Ollama host/port or start Ollama.');
        }

        const text = await generateLocalResponse(
          prompt,
          settings.localModel,
          settings.ollama.host,
          settings.ollama.port,
        );

        return {
          text,
          modelUsed: settings.localModel,
          modeUsed,
        };
      }

      const apiKey =
        settings.cloudProvider === 'openai'
          ? settings.openaiApiKey
          : settings.cloudProvider === 'deepseek'
            ? settings.deepseekApiKey
            : settings.claudeApiKey;
      const text = await generateCloudResponse(
        settings.cloudProvider,
        apiKey,
        settings.cloudModel,
        prompt,
        history,
      );

      return {
        text,
        modelUsed: settings.cloudModel,
        modeUsed,
      };
    },
    [isLocalAvailable, pickMode, settings],
  );

  const sendMessage = useCallback(
    async (prompt: string) => {
      const cleanPrompt = prompt.trim();
      if (!cleanPrompt || isTyping) {
        return;
      }

      const userMessage: ChatMessage = {
        id: createId(),
        role: 'user',
        content: cleanPrompt,
        createdAt: Date.now(),
      };

      const optimisticMessages = [...messages, userMessage];
      setMessages(optimisticMessages);
      setError(null);
      setIsTyping(true);

      try {
        if (settings.mode === 'local' || settings.mode === 'auto') {
          const reachable = await isOllamaReachable(settings.ollama.host, settings.ollama.port);
          if (!reachable && settings.mode === 'local') {
            throw new Error('Ollama is offline. Switch to cloud mode or start local service.');
          }
        }

        const response = await sendToModel(cleanPrompt, optimisticMessages);
        const assistantMessage: ChatMessage = {
          id: createId(),
          role: 'assistant',
          content: response.text,
          createdAt: Date.now(),
          modelUsed: `${response.modeUsed}:${response.modelUsed}`,
        };

        const finalMessages = [...optimisticMessages, assistantMessage];
        setMessages(finalMessages);
        await upsertConversation(finalMessages, cleanPrompt);
      } catch (err) {
        const fallbackMessage =
          err instanceof Error ? err.message : 'Unexpected error while generating response.';
        setError(fallbackMessage);
        await upsertConversation(optimisticMessages, cleanPrompt);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, messages, sendToModel, settings, upsertConversation],
  );

  const regenerateLast = useCallback(async () => {
    const reversed = [...messages].reverse();
    const lastUser = reversed.find(message => message.role === 'user');
    if (!lastUser) {
      return;
    }

    const cutIndex = messages.findIndex(message => message.id === lastUser.id);
    const trimmed = messages.slice(0, cutIndex + 1);
    setMessages(trimmed);
    await upsertConversation(trimmed, lastUser.content);
    await sendMessage(lastUser.content);
  }, [messages, sendMessage, upsertConversation]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      const target = conversations.find(item => item.id === conversationId);
      if (!target) {
        return;
      }
      setMessages(target.messages);
      await persistState(conversations, target.id);
    },
    [conversations, persistState],
  );

  const renameConversation = useCallback(
    async (conversationId: string, title: string) => {
      const next = conversations.map(item =>
        item.id === conversationId ? { ...item, title: title.trim() || item.title } : item,
      );
      setConversations(next);
      await saveConversations(next);
    },
    [conversations],
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      const next = conversations.filter(item => item.id !== conversationId);
      const nextActive = activeConversationId === conversationId ? next[0]?.id ?? null : activeConversationId;

      setConversations(next);
      setActiveConversationId(nextActive);
      setMessages(next.find(item => item.id === nextActive)?.messages ?? []);
      await saveConversations(next);

      if (nextActive) {
        await saveActiveConversationId(nextActive);
      }
    },
    [activeConversationId, conversations],
  );

  const startNewConversation = useCallback(async () => {
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  const clearAllConversations = useCallback(async () => {
    setMessages([]);
    setConversations([]);
    setActiveConversationId(null);
    await clearConversations();
  }, []);

  return {
    messages,
    conversations,
    activeConversation,
    isTyping,
    error,
    sendMessage,
    regenerateLast,
    loadConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations,
    startNewConversation,
  };
};
