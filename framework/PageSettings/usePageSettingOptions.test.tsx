import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePageSettingsOptions } from './usePageSettingOptions';

const englishLanguageNames = new Intl.DisplayNames('en', { type: 'language' });

describe('usePageSettingsOptions', () => {
  it('returns language options sorted by English name with native labels', () => {
    const { result } = renderHook(() => usePageSettingsOptions());
    const language = result.current.find((option) => option.name === 'language');

    expect(language).toBeDefined();
    expect(language?.defaultValue).toBe('browser');
    expect(language?.disableSortOptions).toBe(true);
    expect(language?.options[0]).toMatchObject({
      label: 'Follow browser',
      value: 'browser',
      dividerAfter: true,
    });

    const languageOptions = language?.options.slice(1) ?? [];
    const languageValues = languageOptions.map((option) => String(option.value));
    const sortedValues = [...languageValues].sort((a, b) =>
      (englishLanguageNames.of(a) ?? a).localeCompare(englishLanguageNames.of(b) ?? b, 'en')
    );

    expect(languageValues).toEqual(sortedValues);
    expect(languageOptions.map((option) => option.value)).toEqual(
      expect.arrayContaining(['en', 'es', 'fr', 'ja', 'ko', 'nl', 'zh'])
    );
    expect(languageOptions.find((option) => option.value === 'es')?.label).toContain('español');
  });

  it('uses the language code when Intl has no display name', () => {
    const displayName = vi.spyOn(Intl.DisplayNames.prototype, 'of').mockReturnValue(undefined);

    try {
      const { result } = renderHook(() => usePageSettingsOptions());
      const language = result.current.find((option) => option.name === 'language');

      expect(language?.options.find((option) => option.value === 'en')?.label).toBe('en');
    } finally {
      displayName.mockRestore();
    }
  });

  it('returns the existing non-language settings', () => {
    const { result } = renderHook(() => usePageSettingsOptions());

    expect(result.current.map((option) => option.name)).toEqual([
      'language',
      'refreshInterval',
      'theme',
      'tableLayout',
      'formColumns',
      'dateFormat',
      'dataEditorFormat',
    ]);
  });
});
