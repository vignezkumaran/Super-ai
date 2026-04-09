import { Mode } from '../types';
import { COMPLEX_KEYWORDS, SIMPLE_KEYWORDS } from '../utils/constants';

const includesKeyword = (input: string, keywords: string[]): boolean => {
  const lower = input.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
};

export const routeMode = (prompt: string): Mode => {
  const cleanedPrompt = prompt.trim().toLowerCase();
  if (!cleanedPrompt) {
    return 'local';
  }

  // Keep low-risk informational prompts local whenever possible.
  if (includesKeyword(cleanedPrompt, SIMPLE_KEYWORDS)) {
    return 'local';
  }

  // Escalate heavier reasoning/build-oriented prompts to cloud models.
  if (includesKeyword(cleanedPrompt, COMPLEX_KEYWORDS)) {
    return 'cloud';
  }

  if (cleanedPrompt.split(/\s+/).length < 5) {
    return 'local';
  }

  return 'local';
};
