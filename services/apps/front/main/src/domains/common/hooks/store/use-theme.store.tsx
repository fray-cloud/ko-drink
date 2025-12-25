import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  getEffectiveTheme: () => 'light' | 'dark';
  applyTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 테마 적용 함수 (외부에서도 사용 가능)
export const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return;
  
  const root = window.document.documentElement;
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  
  // 모든 테마 클래스 제거
  root.classList.remove('light', 'dark');
  
  // 새로운 테마 클래스 추가
  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    // light 모드일 때는 dark 클래스만 제거
    // Tailwind CSS는 기본적으로 light 모드이므로 dark 클래스가 없으면 light 모드
    root.classList.remove('dark');
  }
  
  // data-theme 속성도 설정 (추가 호환성을 위해)
  root.setAttribute('data-theme', effectiveTheme);
  
  // color-scheme 속성도 설정 (브라우저 기본 스타일링을 위해)
  root.style.colorScheme = effectiveTheme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        // 테마 변경 시 즉시 적용
        applyThemeToDocument(theme);
      },
      getEffectiveTheme: () => {
        const { theme } = get();
        return theme === 'system' ? getSystemTheme() : theme;
      },
      applyTheme: () => {
        const { theme } = get();
        applyThemeToDocument(theme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 스토어 복원 후 테마 적용
          setTimeout(() => {
            applyThemeToDocument(state.theme);
          }, 0);
        }
      },
    }
  )
);

// 초기 테마 적용 (스토어가 로드되기 전)
if (typeof window !== 'undefined') {
  // localStorage에서 테마 읽기
  const stored = localStorage.getItem('theme-storage');
  let initialTheme: ThemeMode = 'system';
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.theme) {
        initialTheme = parsed.state.theme;
      }
    } catch (e) {
      // 파싱 실패 시 기본값 사용
    }
  }
  
  // 초기 로드 시 즉시 적용
  applyThemeToDocument(initialTheme);
}

