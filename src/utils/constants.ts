import { CloudProvider, OpenSourceModel, Settings } from '../types';

export const STORAGE_KEYS = {
  SETTINGS: '@superai/settings',
  CONVERSATIONS: '@superai/conversations',
  ACTIVE_CONVERSATION: '@superai/active-conversation',
};

export const DEFAULT_SETTINGS: Settings = {
  openaiApiKey: '',
  claudeApiKey: '',
  deepseekApiKey: '',
  openaiSignedIn: false,
  claudeSignedIn: false,
  deepseekSignedIn: false,
  openaiAccountEmail: '',
  claudeAccountEmail: '',
  deepseekAccountEmail: '',
  cloudProvider: 'openai',
  cloudModel: 'gpt-3.5-turbo',
  mode: 'auto',
  themeMode: 'system',
  ollama: {
    host: 'http://localhost',
    port: '11434',
  },
  localModel: 'llama3.2:3b',
};

export const DEFAULT_CLAUDE_MODEL = 'claude-3-haiku-20240307';
export const CLAUDE_MODEL_OPTIONS = [
  'claude-3-haiku-20240307',
  'claude-3-5-sonnet-20240620',
];

export const OPENAI_MODEL_OPTIONS = ['gpt-3.5-turbo', 'gpt-4'];
export const DEEPSEEK_MODEL_OPTIONS = ['deepseek-chat', 'deepseek-reasoner'];

export const CLOUD_PROVIDERS: CloudProvider[] = ['openai', 'deepseek', 'claude'];

export const CLOUD_PROVIDER_MODELS: Record<CloudProvider, string[]> = {
  openai: OPENAI_MODEL_OPTIONS,
  deepseek: DEEPSEEK_MODEL_OPTIONS,
  claude: CLAUDE_MODEL_OPTIONS,
};

export const PROVIDER_USAGE_LIMITS: Record<CloudProvider, string> = {
  openai: 'Usage limit: account-based credits/quota (synced at login).',
  deepseek: 'Usage limit: account-based credits/quota (synced at login).',
  claude: 'Usage limit: account-based message/token quota (synced at login).',
};

export const SIMPLE_KEYWORDS = ['what is', 'define', 'explain', 'who is', 'when did', 'where is'];
export const COMPLEX_KEYWORDS = ['code', 'build', 'design', 'architecture', 'system', 'analyze'];

export const OPEN_SOURCE_MODELS: OpenSourceModel[] = [
  {
    id: 'ollama-llama3.2-3b',
    title: 'Llama 3.2 3B (Ollama)',
    source: 'ollama',
    description: 'Fast local general-purpose model pulled via Ollama.',
    license: 'Llama community license',
    ollamaName: 'llama3.2:3b',
    sourceUrl: 'https://ollama.com/library/llama3.2',
    supportNote: 'Good default for mobile-class local inference.',
    estimatedSizeGB: 2.0,
    recommendedMinRamGB: 4,
  },
  {
    id: 'ollama-qwen2.5-3b',
    title: 'Qwen 2.5 3B (Ollama)',
    source: 'ollama',
    description: 'Compact multilingual model suitable for local inference.',
    license: 'Apache-2.0',
    ollamaName: 'qwen2.5:3b',
    sourceUrl: 'https://ollama.com/library/qwen2.5',
    supportNote: 'Small enough for most devices when run via Ollama host.',
    estimatedSizeGB: 2.3,
    recommendedMinRamGB: 4,
  },
  {
    id: 'hf-tinyllama-gguf',
    title: 'TinyLlama 1.1B Chat GGUF (Hugging Face)',
    source: 'huggingface',
    description: 'Download GGUF file to your device for offline runtimes.',
    license: 'Apache-2.0',
    hfRepoId: 'TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF',
    hfFilename: 'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    sourceUrl: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF',
    supportNote: 'Very lightweight GGUF option.',
    estimatedSizeGB: 0.9,
    recommendedMinRamGB: 3,
  },
  {
    id: 'hf-phi3-mini-gguf',
    title: 'Phi-3 Mini Instruct GGUF (Hugging Face)',
    source: 'huggingface',
    description: 'Higher quality small model file for local-compatible runtimes.',
    license: 'MIT',
    hfRepoId: 'QuantFactory/Phi-3-mini-4k-instruct-GGUF',
    hfFilename: 'Phi-3-mini-4k-instruct.Q4_K_M.gguf',
    sourceUrl: 'https://huggingface.co/QuantFactory/Phi-3-mini-4k-instruct-GGUF',
    supportNote: 'Balanced quality/size quantized model.',
    estimatedSizeGB: 2.5,
    recommendedMinRamGB: 6,
  },
];
