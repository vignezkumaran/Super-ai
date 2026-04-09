import axios from 'axios';
import { ChatMessage, CloudProvider } from '../types';

const mapMessagesForApi = (history: ChatMessage[], prompt: string) => {
  const mapped = history.slice(-12).map(message => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
  }));

  mapped.push({ role: 'user', content: prompt });
  return mapped;
};

export const generateCloudResponse = async (
  provider: CloudProvider,
  apiKey: string,
  model: string,
  prompt: string,
  history: ChatMessage[],
): Promise<string> => {
  if (!apiKey.trim()) {
    throw new Error(`${provider.toUpperCase()} API key is missing.`);
  }

  const messages = mapMessagesForApi(history, prompt);

  if (provider === 'openai') {
    const { data } = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      },
    );

    const text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('OpenAI returned an empty response.');
    }
    return text;
  }

  const claudeMessages = messages.map(message => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
  }));

  const { data } = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model,
      max_tokens: 1024,
      messages: claudeMessages,
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 45000,
    },
  );

  const text = data?.content?.[0]?.text;
  if (!text) {
    throw new Error('Claude returned an empty response.');
  }

  return text;
};
