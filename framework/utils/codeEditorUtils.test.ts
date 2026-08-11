/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { jsonToYaml, isJsonString, yamlToJson, parseVariableField } from './codeEditorUtils';

describe('codeEditorUtils', () => {
  describe('jsonToYaml', () => {
    it('should convert JSON object to YAML', () => {
      const result = jsonToYaml('{"key": "value"}');
      expect(result).toContain('key: value');
    });

    it('should return empty string for empty JSON string', () => {
      expect(jsonToYaml('')).toBe('');
      expect(jsonToYaml('   ')).toBe('');
    });

    it('should return empty string for empty object', () => {
      expect(jsonToYaml('{}')).toBe('');
    });
  });

  describe('isJsonString', () => {
    it('should return true for valid JSON object string', () => {
      expect(isJsonString('{"key": "value"}')).toBe(true);
    });

    it('should return true for valid JSON array string', () => {
      expect(isJsonString('[1, 2, 3]')).toBe(true);
    });

    it('should return false for non-string input', () => {
      expect(isJsonString(123)).toBe(false);
      expect(isJsonString(null)).toBe(false);
      expect(isJsonString(undefined)).toBe(false);
    });

    it('should return false for invalid JSON string', () => {
      expect(isJsonString('not json')).toBe(false);
      expect(isJsonString('{invalid}')).toBe(false);
    });

    it('should return false for JSON primitive strings', () => {
      expect(isJsonString('"hello"')).toBe(false);
      expect(isJsonString('42')).toBe(false);
    });
  });

  describe('yamlToJson', () => {
    it('should convert YAML to JSON string', () => {
      const result = yamlToJson('key: value');
      expect(JSON.parse(result)).toEqual({ key: 'value' });
    });

    it('should return empty object for empty/null YAML', () => {
      expect(yamlToJson('')).toBe('{}');
    });

    it('should throw for non-object YAML', () => {
      expect(() => yamlToJson('just a string')).toThrow('yaml is not in object format');
    });
  });

  describe('parseVariableField', () => {
    it('should return empty object for "---"', () => {
      expect(parseVariableField('---')).toEqual({});
    });

    it('should return empty object for "{}"', () => {
      expect(parseVariableField('{}')).toEqual({});
    });

    it('should parse JSON string directly', () => {
      expect(parseVariableField('{"key": "value"}')).toEqual({ key: 'value' });
    });

    it('should convert YAML to object', () => {
      expect(parseVariableField('key: value')).toEqual({ key: 'value' });
    });
  });
});
