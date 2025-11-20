import { describe, expect, it } from 'vitest';
import { safeDump, safeLoad } from './yamlSchema';

describe('yamlSchema', () => {
  describe('safeLoad', () => {
    it('should parse small integers as numbers', () => {
      const yaml = 'value: 12345';
      const result = safeLoad(yaml) as { value: number };
      expect(result.value).toBe(12345);
      expect(typeof result.value).toBe('number');
    });

    it('should parse large integers (>16 digits) as strings', () => {
      const yaml = 'value: 12341234123412341234123412341235';
      const result = safeLoad(yaml) as { value: string };
      expect(result.value).toBe('12341234123412341234123412341235');
      expect(typeof result.value).toBe('string');
    });

    it('should preserve 32-digit integers as strings', () => {
      const yaml = `number_list:
  - 12341234123412341234123412341235
  - 12341234123412341234123412341236
  - 12341234123412341234123412341237`;
      const result = safeLoad(yaml) as { number_list: string[] };
      expect(result.number_list).toEqual([
        '12341234123412341234123412341235',
        '12341234123412341234123412341236',
        '12341234123412341234123412341237',
      ]);
      expect(typeof result.number_list[0]).toBe('string');
    });

    it('should parse negative large integers as strings', () => {
      const yaml = 'value: -12341234123412341234123412341235';
      const result = safeLoad(yaml) as { value: string };
      expect(result.value).toBe('-12341234123412341234123412341235');
      expect(typeof result.value).toBe('string');
    });

    it('should handle mixed small and large integers', () => {
      const yaml = `small: 123
large: 12341234123412341234123412341235`;
      const result = safeLoad(yaml) as { small: number; large: string };
      expect(result.small).toBe(123);
      expect(typeof result.small).toBe('number');
      expect(result.large).toBe('12341234123412341234123412341235');
      expect(typeof result.large).toBe('string');
    });

    it('should handle strings normally', () => {
      const yaml = 'value: "some string"';
      const result = safeLoad(yaml) as { value: string };
      expect(result.value).toBe('some string');
      expect(typeof result.value).toBe('string');
    });
  });

  describe('safeDump', () => {
    it('should serialize small integers as unquoted numbers', () => {
      const obj = { value: 12345 };
      const yaml = safeDump(obj);
      expect(yaml).toBe('value: 12345\n');
    });

    it('should serialize large integer strings as unquoted numbers', () => {
      const obj = { value: '12341234123412341234123412341235' };
      const yaml = safeDump(obj);
      expect(yaml).toBe('value: 12341234123412341234123412341235\n');
    });

    it('should serialize arrays of large integers without quotes', () => {
      const obj = {
        number_list: [
          '12341234123412341234123412341235',
          '12341234123412341234123412341236',
          '12341234123412341234123412341237',
        ],
      };
      const yaml = safeDump(obj);
      expect(yaml).toContain('12341234123412341234123412341235');
      expect(yaml).not.toContain('"12341234123412341234123412341235"');
      expect(yaml).not.toContain("'12341234123412341234123412341235'");
    });

    it('should handle negative large integers', () => {
      const obj = { value: '-12341234123412341234123412341235' };
      const yaml = safeDump(obj);
      expect(yaml).toBe('value: -12341234123412341234123412341235\n');
    });

    it('should serialize regular strings with quotes when needed', () => {
      const obj = { value: 'some string' };
      const yaml = safeDump(obj);
      expect(yaml).toContain('some string');
    });
  });

  describe('round-trip preservation', () => {
    it('should preserve large integers through load and dump', () => {
      const originalYaml = `number_list:
  - 12341234123412341234123412341235
  - 12341234123412341234123412341236
  - 12341234123412341234123412341237`;
      const loaded = safeLoad(originalYaml) as { number_list: string[] };
      const dumped = safeDump(loaded).trim();

      const reloaded = safeLoad(dumped) as { number_list: string[] };
      expect(reloaded.number_list).toEqual([
        '12341234123412341234123412341235',
        '12341234123412341234123412341236',
        '12341234123412341234123412341237',
      ]);
    });

    it('should preserve precision for 32-digit integers', () => {
      const original = '12341234123412341234123412341235';
      const yaml = safeDump({ value: original });
      const result = safeLoad(yaml) as { value: string };
      expect(result.value).toBe(original);
    });
  });

  describe('security', () => {
    it('should not allow backtracking with malicious input', () => {
      const maliciousInputs = [
        '  -' + ' '.repeat(100),
        'value:' + ' '.repeat(100),
        '  -     \t    \t    \t    \t    \t    \t    \t    \t    ',
      ];

      maliciousInputs.forEach((input) => {
        const start = performance.now();
        safeLoad(input);
        const duration = performance.now() - start;
        expect(duration).toBeLessThan(100);
      });
    });
  });
});
