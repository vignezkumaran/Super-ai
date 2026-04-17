export type Sender = 'user' | 'assistant';
export type Mode = 'local' | 'cloud' | 'auto';
export type CloudProvider = 'openai' | 'claude' | 'deepseek';
export type OpenSourceModelSource = 'ollama' | 'huggingface';
export type ThemeMode = 'system' | 'dark' | 'light';

export interface ChatMessage {
  id: string;
  role: Sender;
  content: string;
  createdAt: number;
  modelUsed?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface OllamaConfig {
  host: string;
  port: string;
}

export interface Settings {
  openaiApiKey: string;
  claudeApiKey: string;
  deepseekApiKey: string;
  openaiSignedIn: boolean;
  claudeSignedIn: boolean;
  deepseekSignedIn: boolean;
  openaiAccountEmail: string;
  claudeAccountEmail: string;
  deepseekAccountEmail: string;
  cloudProvider: CloudProvider;
  cloudModel: string;
  mode: Mode;
  themeMode: ThemeMode;
  ollama: OllamaConfig;
  localModel: string;
}

export interface SendChatInput {
  prompt: string;
  history: ChatMessage[];
  settings: Settings;
}

export interface SendChatResult {
  text: string;
  modelUsed: string;
  modeUsed: Mode;
}

export interface OpenSourceModel {
  id: string;
  title: string;
  source: OpenSourceModelSource;
  description: string;
  license: string;
  ollamaName?: string;
  hfRepoId?: string;
  hfFilename?: string;
  sourceUrl?: string;
  supportNote?: string;
  estimatedSizeGB?: number;
  recommendedMinRamGB?: number;
}

export interface ModelDownloadStatus {
  state: 'idle' | 'downloading' | 'completed' | 'failed';
  progress: number;
  message?: string;
  filePath?: string;
}
