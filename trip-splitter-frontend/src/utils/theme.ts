export type Theme = 'light' | 'dark';
export const THEME_KEY = 'goa-trip-theme';

export function readTheme(): Theme {
  try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function saveTheme(theme: Theme): boolean {
  applyTheme(theme);
  try { localStorage.setItem(THEME_KEY, theme); return true; }
  catch { return false; }
}
