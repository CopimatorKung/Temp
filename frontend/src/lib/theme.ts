export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'pitchsmith-theme';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.dataset.theme = mode;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}
