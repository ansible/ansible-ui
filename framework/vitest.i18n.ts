import { vi } from 'vitest';

vi.mock('react-i18next', () => {
  const stableT = vi.fn((key: string, options?: Record<string, unknown>) => {
    if (options && typeof options === 'object') {
      let result = key;
      Object.entries(options).forEach(([param, value]) => {
        result = result.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
      return result;
    }
    return key;
  });

  const stableI18n = {
    changeLanguage: vi.fn(),
    language: 'en',
  };

  return {
    useTranslation: vi.fn(() => ({
      t: stableT,
      i18n: stableI18n,
    })),
    Trans: ({ children }: { children: React.ReactNode }) => children,
    initReactI18next: {
      type: '3rdParty',
      init: vi.fn(),
    },
  };
});
