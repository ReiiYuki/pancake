import { useEffect, useState } from 'react'
import { useThemeContext } from './theme/ThemeProvider'

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useThemeContext();

  useEffect(() => {
    // Sync with html class for Tailwind compatibility
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const label = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5"
    >
      {isDarkMode ? 'Dark' : 'Light'}
    </button>
  )
}
