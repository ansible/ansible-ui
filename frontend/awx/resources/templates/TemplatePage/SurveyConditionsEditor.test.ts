import { describe, expect, it } from 'vitest';
import type { Spec } from '../../../interfaces/Survey';
import { getConditionalFormValues, toConditionalSpecFields } from './SurveyConditionsEditor';

const baseQuestion: Spec = {
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
};

describe('getConditionalFormValues', () => {
  it('returns defaults for a new question', () => {
    expect(getConditionalFormValues(undefined)).toEqual({
      category: '',
      page: 1,
      conditions: [],
      condition_logic: 'and',
    });
  });

  it('converts stored conditions into editor values', () => {
    const values = getConditionalFormValues({
      ...baseQuestion,
      category: 'Network',
      page: 3,
      condition_logic: 'or',
      conditions: [
        { variable: 'env', operator: 'in', value: ['dev', 'staging'] },
        { variable: 'size', operator: 'gt', value: 4 },
        { variable: 'debug', operator: 'is_set' },
      ],
    });
    expect(values).toEqual({
      category: 'Network',
      page: 3,
      condition_logic: 'or',
      conditions: [
        { variable: 'env', operator: 'in', value: 'dev, staging' },
        { variable: 'size', operator: 'gt', value: '4' },
        { variable: 'debug', operator: 'is_set', value: '' },
      ],
    });
  });
});

describe('toConditionalSpecFields', () => {
  it('omits empty category, page and conditions', () => {
    expect(
      toConditionalSpecFields({ category: '', page: '', conditions: [], condition_logic: 'or' })
    ).toEqual({ category: undefined, page: undefined });
  });

  it('converts editor values into spec fields', () => {
    expect(
      toConditionalSpecFields({
        category: 'Network',
        page: '2',
        condition_logic: 'or',
        conditions: [
          { variable: 'env', operator: 'in', value: 'dev, prod' },
          { variable: 'debug', operator: 'is_set', value: 'ignored' },
          { variable: 'size', operator: 'gte', value: '4' },
        ],
      })
    ).toEqual({
      category: 'Network',
      page: 2,
      condition_logic: 'or',
      conditions: [
        { variable: 'env', operator: 'in', value: ['dev', 'prod'] },
        { variable: 'debug', operator: 'is_set', value: undefined },
        { variable: 'size', operator: 'gte', value: '4' },
      ],
    });
  });

  it('drops incomplete condition rows and defaults the logic to AND', () => {
    expect(
      toConditionalSpecFields({
        conditions: [
          { variable: '', operator: 'eq', value: 'x' },
          { variable: 'env', operator: 'eq', value: 'prod' },
        ],
      })
    ).toEqual({
      category: undefined,
      page: undefined,
      condition_logic: 'and',
      conditions: [{ variable: 'env', operator: 'eq', value: 'prod' }],
    });
  });
});
