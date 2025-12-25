import { useThemeStore } from '../hooks/store/use-theme.store';

export function ThemeToggle() {
  const { theme, setTheme, getEffectiveTheme } = useThemeStore();
  const effectiveTheme = getEffectiveTheme();
  const isDark = effectiveTheme === 'dark';

  const handleToggle = () => {
    // 현재 효과적인 테마의 반대로 전환
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center w-16 h-9 rounded-full overflow-hidden transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      style={{
        backgroundColor: isDark ? '#293547' : '#F7F7F7',
      }}
      title={isDark ? '다크 모드' : '라이트 모드'}
      aria-label={isDark ? '다크 모드' : '라이트 모드'}
    >
      {/* 비활성 태양 아이콘 (왼쪽) - 다크 모드일 때만 표시 */}
      {isDark && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-0">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="#9ca3af"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
      )}

      {/* 비활성 달 아이콘 (오른쪽) - 라이트 모드일 때만 표시 */}
      {!isDark && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-0">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="#9ca3af"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>
      )}

      {/* 토글 thumb (원형 버튼) */}
      {/* 버튼 너비 64px (w-16), thumb 너비 28px (w-7), 좌우 패딩 4px로 동일하게 설정 */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-500 transition-transform duration-300 flex items-center justify-center shadow-sm z-10 ${
          isDark ? 'translate-x-[32px]' : 'translate-x-1'
        }`}
      >
        {isDark ? (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </div>
    </button>
  );
}

