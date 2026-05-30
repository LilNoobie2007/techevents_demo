import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sync with localStorage on initial load
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('app-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('app-theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="theme-switch-wrapper" onClick={toggleTheme} title="Switch to Dark/Light Mode">
      <div className="morph-icon"></div>
      <span className="theme-text">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
    </div>
  );
}