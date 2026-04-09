import axios from 'axios';

interface OllamaModelResponse {
  models?: Array<{ name: string }>;
}

interface OllamaGenerateResponse {
  response?: string;
}

const makeBaseUrl = (host: string, port: string): string => {
  const normalizedHost = host.replace(/\/+$/, '');
  return `${normalizedHost}:${port}`;
};

export const getLocalModels = async (host: string, port: string): Promise<string[]> => {
  const baseURL = makeBaseUrl(host, port);
  const { data } = await axios.get<OllamaModelResponse>(`${baseURL}/api/tags`, {
    timeout: 5000,
  });

  return data.models?.map(model => model.name) ?? [];
};

export const isOllamaReachable = async (host: string, port: string): Promise<boolean> => {
  try {
    await getLocalModels(host, port);
    return true;
  } catch {
    return false;
  }
};

export const generateLocalResponse = async (
  prompt: string,
  model: string,
  host: string,
  port: string,
): Promise<string> => {
  const baseURL = makeBaseUrl(host, port);
  const { data } = await axios.post<OllamaGenerateResponse>(
    `${baseURL}/api/generate`,
    {
      model,
      prompt,
      stream: false,
    },
    { timeout: 45000 },
  );

  if (!data.response) {
    throw new Error('Local model returned an empty response.');
  }

  return data.response;
};

export const pullLocalModel = async (
  model: string,
  host: string,
  port: string,
): Promise<void> => {
  const baseURL = makeBaseUrl(host, port);
  await axios.post(
    `${baseURL}/api/pull`,
    {
      name: model,
      stream: false,
    },
    { timeout: 60000 },
  );
};
