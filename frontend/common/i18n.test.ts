import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('i18next-http-backend', () => ({
  default: class HttpBackend {
    static readonly type = 'backend';
    type = 'backend';
    init = vi.fn();
    read = (
      _language: string,
      _namespace: string,
      callback: (error: null, data: boolean) => void
    ) => {
      callback(null, true);
    };
  },
}));

vi.mock('i18next-browser-languagedetector', () => ({
  default: {
    type: 'languageDetector',
    init: vi.fn(),
    detect: () => 'en',
  },
}));

describe('i18n configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('location', { search: '', pathname: '/', href: 'http://localhost/' });
    vi.stubGlobal('navigator', { language: 'en-US' });
  });

  it('should initialize i18next with pseudolocalization disabled by default', async () => {
    await import('./i18n');
    const i18n = (await import('i18next')).default;
    await i18n.changeLanguage('en');
    expect(i18n.t('hello')).toBe('hello');
  });

  it('should wrap translated strings when pseudolocalization query param is enabled', async () => {
    vi.resetModules();
    vi.stubGlobal('location', {
      search: '?pseudolocalization=true',
      pathname: '/',
      href: 'http://localhost/?pseudolocalization=true',
    });
    await import('./i18n');
    const i18n = (await import('i18next')).default;
    await i18n.changeLanguage('en');
    expect(i18n.t('hello')).toBe('»hello«');
  });
});
