import { useEffect } from 'react';
import { ReactNode } from 'react';
import { useThemeStore, applyThemeToDocument } from '../hooks/store/use-theme.store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, applyTheme } = useThemeStore();

  useEffect(() => {
    // 테마 변경 시 적용
    applyTheme();
  }, [theme, applyTheme]);

  useEffect(() => {
    // 시스템 테마 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyThemeToDocument('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return <>{children}</>;
}

