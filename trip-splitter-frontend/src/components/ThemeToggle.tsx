import { useEffect, useState } from 'react';
import { applyTheme, readTheme, saveTheme } from '../utils/theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme);
  const [failed, setFailed] = useState(false);
  useEffect(() => { applyTheme(theme); }, [theme]);
  return <div className="theme-control">
    <button type="button" className="theme-toggle" aria-label="Dark mode" aria-pressed={theme === 'dark'} onClick={() => {
      const next = theme === 'light' ? 'dark' : 'light';
      setTheme(next);
      setFailed(!saveTheme(next));
    }}><span aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span> {theme === 'dark' ? 'Dark' : 'Light'}</button>
    {failed && <span role="status" className="error">Theme applies to this visit; preference could not be saved.</span>}
  </div>;
}
