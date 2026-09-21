/* eslint-disable i18next/no-literal-string */
import { describe, expect, test } from 'vitest';
import { formatDetailCodeEditorValue } from './PageDetailCodeEditor';

describe('formatDetailCodeEditorValue', () => {
  test('preserves plain text that is not valid structured YAML (job stdout)', () => {
    const stdout = 'Installed: pkg1\nInstalled: pkg2';
    expect(formatDetailCodeEditorValue(stdout, 'yaml', false)).toBe(stdout);
    expect(formatDetailCodeEditorValue(stdout, 'json', false)).toBe(stdout);
  });

  test('formats valid JSON when toggling display language', () => {
    const json = '{"key": "value"}';
    const result = formatDetailCodeEditorValue(json, 'json', false);
    expect(result).toContain('"key"');
    expect(result).toContain('value');
  });
});
