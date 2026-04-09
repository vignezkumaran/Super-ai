export type ResolvedTheme = 'dark' | 'light';

export interface AppColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputBackground: string;
  primaryButtonBackground: string;
  primaryButtonText: string;
  secondaryButtonBackground: string;
  secondaryButtonText: string;
  chipBackground: string;
  chipText: string;
  chipActiveBackground: string;
  chipActiveText: string;
  warningBackground: string;
  warningBorder: string;
  warningText: string;
  errorBackground: string;
  errorBorder: string;
  errorText: string;
  infoText: string;
  successText: string;
  dangerBackground: string;
  dangerBorder: string;
  dangerText: string;
  linkText: string;
  tabBackground: string;
  tabBorder: string;
  tabActive: string;
  tabInactive: string;
}

const darkColors: AppColors = {
  background: '#0f0f0f',
  surface: '#151515',
  surfaceAlt: '#1a1a1a',
  border: '#2f2f2f',
  textPrimary: '#f2f2f2',
  textSecondary: '#d5d5d5',
  textMuted: '#8f8f8f',
  inputBackground: '#1a1a1a',
  primaryButtonBackground: '#efefef',
  primaryButtonText: '#111111',
  secondaryButtonBackground: '#1b1b1b',
  secondaryButtonText: '#d0d0d0',
  chipBackground: '#171717',
  chipText: '#d5d5d5',
  chipActiveBackground: '#efefef',
  chipActiveText: '#121212',
  warningBackground: '#2a2620',
  warningBorder: '#58420f',
  warningText: '#f7d48d',
  errorBackground: '#2a1f1f',
  errorBorder: '#6a2d2d',
  errorText: '#ffb3b3',
  infoText: '#9dc5ff',
  successText: '#a2e6b4',
  dangerBackground: '#2b1f1f',
  dangerBorder: '#5c2f2f',
  dangerText: '#ffb6b6',
  linkText: '#9dc5ff',
  tabBackground: '#111111',
  tabBorder: '#242424',
  tabActive: '#efefef',
  tabInactive: '#808080',
};

const lightColors: AppColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceAlt: '#f1f1f1',
  border: '#d7d7d7',
  textPrimary: '#121212',
  textSecondary: '#2f2f2f',
  textMuted: '#6f6f6f',
  inputBackground: '#ffffff',
  primaryButtonBackground: '#121212',
  primaryButtonText: '#f5f5f5',
  secondaryButtonBackground: '#ececec',
  secondaryButtonText: '#2d2d2d',
  chipBackground: '#ececec',
  chipText: '#2f2f2f',
  chipActiveBackground: '#121212',
  chipActiveText: '#f5f5f5',
  warningBackground: '#f7f1e2',
  warningBorder: '#d2b87b',
  warningText: '#6e541b',
  errorBackground: '#f9eaea',
  errorBorder: '#d1a0a0',
  errorText: '#8b2f2f',
  infoText: '#355f9d',
  successText: '#2d7a4b',
  dangerBackground: '#f9ebeb',
  dangerBorder: '#d3aaaa',
  dangerText: '#8d3434',
  linkText: '#2f5f9d',
  tabBackground: '#ffffff',
  tabBorder: '#d8d8d8',
  tabActive: '#121212',
  tabInactive: '#7f7f7f',
};

export const getColors = (theme: ResolvedTheme): AppColors => {
  return theme === 'light' ? lightColors : darkColors;
};
