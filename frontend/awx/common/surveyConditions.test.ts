import { describe, expect, it } from 'vitest';
import type { Spec, SurveyCondition } from '../interfaces/Survey';
import {
  conditionValueToText,
  evaluateConditions,
  evaluateSingleCondition,
  pruneSurveyByConditions,
  textToConditionValue,
} from './surveyConditions';

function question(overrides: Partial<Spec>): Spec {
  return {
    question_name: 'Question',
    question_description: '',
    required: false,
    type: 'text',
    variable: 'question',
    min: 0,
    max: 1024,
    default: '',
    choices: '',
    new_question: false,
    ...overrides,
  };
}

function condition(
  operator: SurveyCondition['operator'],
  value?: SurveyCondition['value'],
  variable = 'answer'
): SurveyCondition {
  return { variable, operator, value };
}

describe('evaluateSingleCondition', () => {
  describe('is_set / is_not_set', () => {
    it.each([
      ['a string', 'value', true],
      ['zero', 0, true],
      ['a non-empty array', ['a'], true],
      ['an empty string', '', false],
      ['an empty array', [], false],
      ['null', null, false],
      ['undefined', undefined, false],
    ])('treats %s as set=%s', (_label, answer, expected) => {
      expect(evaluateSingleCondition(condition('is_set'), { answer })).toBe(expected);
      expect(evaluateSingleCondition(condition('is_not_set'), { answer })).toBe(!expected);
    });

    it('treats a missing variable as not set', () => {
      expect(evaluateSingleCondition(condition('is_set'), {})).toBe(false);
      expect(evaluateSingleCondition(condition('is_not_set'), {})).toBe(true);
    });
  });

  describe('value operators fail closed when the answer is missing', () => {
    it.each<SurveyCondition['operator']>(['eq', 'neq', 'in', 'notin', 'gt', 'lt', 'gte', 'lte'])(
      '%s returns false for a missing answer',
      (operator) => {
        expect(evaluateSingleCondition(condition(operator, 'x'), {})).toBe(false);
        expect(evaluateSingleCondition(condition(operator, 'x'), { answer: '' })).toBe(false);
      }
    );
  });

  describe('eq / neq', () => {
    it('compares as strings', () => {
      expect(evaluateSingleCondition(condition('eq', 'prod'), { answer: 'prod' })).toBe(true);
      expect(evaluateSingleCondition(condition('eq', 'prod'), { answer: 'dev' })).toBe(false);
      expect(evaluateSingleCondition(condition('eq', 5), { answer: '5' })).toBe(true);
      expect(evaluateSingleCondition(condition('eq', '5'), { answer: 5 })).toBe(true);
      expect(evaluateSingleCondition(condition('neq', 'prod'), { answer: 'dev' })).toBe(true);
      expect(evaluateSingleCondition(condition('neq', 'prod'), { answer: 'prod' })).toBe(false);
    });

    it('matches a multiselect answer when any selected value matches', () => {
      expect(evaluateSingleCondition(condition('eq', 'b'), { answer: ['a', 'b'] })).toBe(true);
      expect(evaluateSingleCondition(condition('eq', 'c'), { answer: ['a', 'b'] })).toBe(false);
      expect(evaluateSingleCondition(condition('neq', 'c'), { answer: ['a', 'b'] })).toBe(true);
      expect(evaluateSingleCondition(condition('neq', 'b'), { answer: ['a', 'b'] })).toBe(false);
    });
  });

  describe('in / notin', () => {
    it('checks membership in a list', () => {
      const list = ['dev', 'staging'];
      expect(evaluateSingleCondition(condition('in', list), { answer: 'dev' })).toBe(true);
      expect(evaluateSingleCondition(condition('in', list), { answer: 'prod' })).toBe(false);
      expect(evaluateSingleCondition(condition('notin', list), { answer: 'prod' })).toBe(true);
      expect(evaluateSingleCondition(condition('notin', list), { answer: 'dev' })).toBe(false);
    });

    it('treats a single value as a one-item list', () => {
      expect(evaluateSingleCondition(condition('in', 'dev'), { answer: 'dev' })).toBe(true);
      expect(evaluateSingleCondition(condition('notin', 'dev'), { answer: 'dev' })).toBe(false);
    });

    it('matches multiselect answers by any overlap', () => {
      const list = ['b', 'x'];
      expect(evaluateSingleCondition(condition('in', list), { answer: ['a', 'b'] })).toBe(true);
      expect(evaluateSingleCondition(condition('in', list), { answer: ['a', 'c'] })).toBe(false);
      expect(evaluateSingleCondition(condition('notin', list), { answer: ['a', 'c'] })).toBe(true);
      expect(evaluateSingleCondition(condition('notin', list), { answer: ['a', 'b'] })).toBe(false);
    });
  });

  describe('gt / lt / gte / lte', () => {
    it.each<[SurveyCondition['operator'], unknown, boolean]>([
      ['gt', '11', true],
      ['gt', '10', false],
      ['lt', '9', true],
      ['lt', '10', false],
      ['gte', '10', true],
      ['gte', '9.5', false],
      ['lte', 10, true],
      ['lte', '10.5', false],
    ])('%s 10 with answer %s is %s', (operator, answer, expected) => {
      expect(evaluateSingleCondition(condition(operator, '10'), { answer })).toBe(expected);
    });

    it('compares numerically, not lexically', () => {
      expect(evaluateSingleCondition(condition('gt', '9'), { answer: '10' })).toBe(true);
    });

    it('returns false when either side is not a number', () => {
      expect(evaluateSingleCondition(condition('gt', '1'), { answer: 'abc' })).toBe(false);
      expect(evaluateSingleCondition(condition('gt', 'abc'), { answer: '5' })).toBe(false);
      expect(evaluateSingleCondition(condition('lt', undefined), { answer: '5' })).toBe(false);
    });

    it('returns false for multiselect answers', () => {
      expect(evaluateSingleCondition(condition('gt', '1'), { answer: ['5'] })).toBe(false);
    });
  });

  it('returns false for an unknown operator', () => {
    const unknown = { variable: 'answer', operator: 'between', value: '1' } as unknown;
    expect(evaluateSingleCondition(unknown as SurveyCondition, { answer: '1' })).toBe(false);
  });
});

describe('evaluateConditions', () => {
  const met = condition('eq', 'yes', 'a');
  const unmet = condition('eq', 'yes', 'b');
  const data = { a: 'yes', b: 'no' };

  it('shows questions without conditions', () => {
    expect(evaluateConditions(question({}), data)).toBe(true);
    expect(evaluateConditions(question({ conditions: [] }), data)).toBe(true);
  });

  it('requires every condition with AND logic (the default)', () => {
    expect(evaluateConditions(question({ conditions: [met, met] }), data)).toBe(true);
    expect(evaluateConditions(question({ conditions: [met, unmet] }), data)).toBe(false);
    expect(
      evaluateConditions(question({ conditions: [met, unmet], condition_logic: 'and' }), data)
    ).toBe(false);
  });

  it('requires any condition with OR logic', () => {
    expect(
      evaluateConditions(question({ conditions: [met, unmet], condition_logic: 'or' }), data)
    ).toBe(true);
    expect(
      evaluateConditions(question({ conditions: [unmet, unmet], condition_logic: 'or' }), data)
    ).toBe(false);
  });
});

describe('pruneSurveyByConditions', () => {
  const spec = [
    question({ variable: 'mode' }),
    question({
      variable: 'db_host',
      conditions: [{ variable: 'mode', operator: 'eq', value: 'external' }],
    }),
    question({
      variable: 'debug_level',
      conditions: [{ variable: 'debug', operator: 'is_set' }],
    }),
  ];

  it('removes answers whose conditions are not met', () => {
    const result = pruneSurveyByConditions({ mode: 'internal', db_host: 'db1' }, spec);
    expect(result).toEqual({ mode: 'internal' });
  });

  it('keeps answers whose conditions are met', () => {
    const result = pruneSurveyByConditions({ mode: 'external', db_host: 'db1' }, spec);
    expect(result).toEqual({ mode: 'external', db_host: 'db1' });
  });

  it('evaluates conditions against the additional context', () => {
    const survey = { mode: 'internal', debug_level: '3' };
    expect(pruneSurveyByConditions(survey, spec)).toEqual({ mode: 'internal' });
    expect(pruneSurveyByConditions(survey, spec, { debug: true })).toEqual(survey);
  });

  it('lets survey answers override the context', () => {
    const result = pruneSurveyByConditions({ mode: 'internal', db_host: 'db1' }, spec, {
      mode: 'external',
    });
    expect(result).toEqual({ mode: 'internal' });
  });

  it('keeps answers that have no matching spec entry', () => {
    expect(pruneSurveyByConditions({ extra: 'x' }, spec)).toEqual({ extra: 'x' });
  });

  it('returns a copy when there is no spec', () => {
    const survey = { mode: 'internal' };
    const withoutSpec = pruneSurveyByConditions(survey, undefined);
    const withEmptySpec = pruneSurveyByConditions(survey, []);
    expect(withoutSpec).toEqual(survey);
    expect(withoutSpec).not.toBe(survey);
    expect(withEmptySpec).toEqual(survey);
  });

  it('does not mutate the input', () => {
    const survey = { mode: 'internal', db_host: 'db1' };
    pruneSurveyByConditions(survey, spec);
    expect(survey).toEqual({ mode: 'internal', db_host: 'db1' });
  });
});

describe('conditionValueToText', () => {
  it('converts stored values to editor text', () => {
    expect(conditionValueToText(undefined)).toBe('');
    expect(conditionValueToText('prod')).toBe('prod');
    expect(conditionValueToText(5)).toBe('5');
    expect(conditionValueToText(['a', 'b'])).toBe('a, b');
  });
});

describe('textToConditionValue', () => {
  it('drops the value for is_set / is_not_set', () => {
    expect(textToConditionValue('is_set', 'leftover')).toBeUndefined();
    expect(textToConditionValue('is_not_set', 'leftover')).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(textToConditionValue('eq', '')).toBeUndefined();
    expect(textToConditionValue('eq', '   ')).toBeUndefined();
    expect(textToConditionValue('eq', undefined)).toBeUndefined();
  });

  it('trims single values', () => {
    expect(textToConditionValue('eq', ' prod ')).toBe('prod');
    expect(textToConditionValue('gt', '10')).toBe('10');
  });

  it('splits comma-separated lists for in / notin', () => {
    expect(textToConditionValue('in', 'a, b ,c')).toEqual(['a', 'b', 'c']);
    expect(textToConditionValue('notin', 'a,,b,')).toEqual(['a', 'b']);
    expect(textToConditionValue('in', 'single')).toEqual(['single']);
  });

  it('round-trips with conditionValueToText', () => {
    const value = ['dev', 'staging'];
    expect(textToConditionValue('in', conditionValueToText(value))).toEqual(value);
  });
});
