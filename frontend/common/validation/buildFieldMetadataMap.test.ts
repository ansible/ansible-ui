import { describe, expect, it } from 'vitest';
import { buildFieldMetadataMap, SchemaFieldWithPattern } from './buildFieldMetadataMap';

describe('buildFieldMetadataMap', () => {
  it('returns an empty map when fields is undefined', () => {
    expect(buildFieldMetadataMap(undefined)).toEqual({});
  });

  it('returns an empty map when fields is an empty array', () => {
    expect(buildFieldMetadataMap([])).toEqual({});
  });

  it('skips fields without a pattern', () => {
    const fields: SchemaFieldWithPattern[] = [
      { id: 'host', pattern_description: 'desc but no pattern' },
      { id: 'port' },
    ];
    expect(buildFieldMetadataMap(fields)).toEqual({});
  });

  it('extracts pattern and pattern_description from fields keyed by id', () => {
    const fields: SchemaFieldWithPattern[] = [
      { id: 'host', pattern: '^[a-z]+$', pattern_description: 'Lowercase only' },
      { id: 'port', pattern: String.raw`^\d+$` },
    ];
    const result = buildFieldMetadataMap(fields);
    expect(result).toEqual({
      host: { pattern: '^[a-z]+$', pattern_description: 'Lowercase only' },
      port: { pattern: String.raw`^\d+$`, pattern_description: undefined },
    });
  });

  it('extracts fields keyed by name when keyProp is "name"', () => {
    const fields: SchemaFieldWithPattern[] = [
      { name: 'CLIENT_ID', pattern: '^[A-Z0-9]+$', pattern_description: 'Uppercase only' },
      { name: 'SECRET', pattern: '^.{8,}$' },
    ];
    const result = buildFieldMetadataMap(fields, 'name');
    expect(result).toEqual({
      CLIENT_ID: { pattern: '^[A-Z0-9]+$', pattern_description: 'Uppercase only' },
      SECRET: { pattern: '^.{8,}$', pattern_description: undefined },
    });
  });

  it('skips fields with an invalid regex pattern', () => {
    const fields: SchemaFieldWithPattern[] = [
      { id: 'good', pattern: '^[a-z]+$', pattern_description: 'Valid' },
      { id: 'bad', pattern: '[invalid(', pattern_description: 'Bad regex' },
    ];
    const result = buildFieldMetadataMap(fields);
    expect(result).toEqual({
      good: { pattern: '^[a-z]+$', pattern_description: 'Valid' },
    });
    expect(result).not.toHaveProperty('bad');
  });

  it('skips fields where the key property is missing or empty', () => {
    const fields: SchemaFieldWithPattern[] = [
      { pattern: '^[a-z]+$' },
      { id: '', pattern: '^[a-z]+$' },
    ];
    expect(buildFieldMetadataMap(fields)).toEqual({});
  });

  it('ignores non-string pattern values', () => {
    const fields = [{ id: 'host', pattern: 42 as unknown as string }];
    expect(buildFieldMetadataMap(fields)).toEqual({});
  });

  it('ignores non-string pattern_description values', () => {
    const fields: SchemaFieldWithPattern[] = [
      { id: 'host', pattern: '^[a-z]+$', pattern_description: true as unknown as string },
    ];
    const result = buildFieldMetadataMap(fields);
    expect(result.host?.pattern_description).toBeUndefined();
  });

  it('works with credential type fields that also have other properties', () => {
    const fields = [
      {
        id: 'host',
        label: 'Host',
        type: 'string',
        secret: false,
        help_text: 'Help',
        pattern: '^https://',
        pattern_description: 'Must start with https://',
      },
      {
        id: 'password',
        label: 'Password',
        type: 'string',
        secret: true,
        help_text: 'Password help',
      },
    ];
    const result = buildFieldMetadataMap(fields);
    expect(Object.keys(result)).toEqual(['host']);
    expect(result.host).toEqual({
      pattern: '^https://',
      pattern_description: 'Must start with https://',
    });
  });

  it('gracefully handles no patterns from backend (toggle off)', () => {
    const fields: SchemaFieldWithPattern[] = [{ id: 'host' }, { id: 'port' }, { id: 'username' }];
    const result = buildFieldMetadataMap(fields);
    expect(result).toEqual({});
    expect(Object.keys(result).length).toBe(0);
  });

  it('accepts camelCase patternDescription (Gateway authenticator API format)', () => {
    const fields: SchemaFieldWithPattern[] = [
      { name: 'CLIENT_ID', pattern: '^[A-Z0-9]+$', patternDescription: 'Uppercase alphanumeric' },
    ];
    const result = buildFieldMetadataMap(fields, 'name');
    expect(result.CLIENT_ID?.pattern_description).toBe('Uppercase alphanumeric');
  });

  it('prefers snake_case pattern_description over camelCase when both are present', () => {
    const fields: SchemaFieldWithPattern[] = [
      {
        name: 'URL',
        pattern: '^https://',
        pattern_description: 'snake wins',
        patternDescription: 'camel loses',
      },
    ];
    const result = buildFieldMetadataMap(fields, 'name');
    expect(result.URL?.pattern_description).toBe('snake wins');
  });

  it('includes flags when present', () => {
    const fields: SchemaFieldWithPattern[] = [
      { id: 'host', pattern: String.raw`^\p{L}+$`, flags: 'u' },
    ];
    const result = buildFieldMetadataMap(fields);
    expect(result.host?.flags).toBe('u');
  });

  it('works with Gateway authenticator schema shape (name + patternDescription + flags)', () => {
    const fields: SchemaFieldWithPattern[] = [
      {
        name: 'CALLBACK_URL',
        pattern: '^https?://',
        patternDescription: 'Must be an HTTP(S) URL',
        flags: 'i',
      },
      { name: 'SECRET_KEY', pattern: '^.{8,}$', patternDescription: 'At least 8 characters' },
    ];
    const result = buildFieldMetadataMap(fields, 'name');
    expect(result).toEqual({
      CALLBACK_URL: {
        pattern: '^https?://',
        pattern_description: 'Must be an HTTP(S) URL',
        flags: 'i',
      },
      SECRET_KEY: {
        pattern: '^.{8,}$',
        pattern_description: 'At least 8 characters',
        flags: undefined,
      },
    });
  });
});
