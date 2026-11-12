import { getFormattedChoices, isMultiSelect } from './TemplateSurveyValidation';
import { describe, expect, it } from 'vitest';
import type { Spec } from '../../../interfaces/Survey';

const createSpec = (overrides: Partial<Spec> = {}): Spec => ({
  question_name: 'Question',
  question_description: '',
  required: false,
  type: 'multiselect',
  variable: 'question',
  min: 0,
  max: 0,
  default: '',
  choices: [],
  new_question: false,
  ...overrides,
});

describe('isMultiSelect', () => {
  it.each(['multiselect', 'multiplechoice'])('returns true for %s', (type) => {
    expect(isMultiSelect(type)).toBe(true);
  });

  it.each(['text', 'singlechoice', ''])('returns false for %s', (type) => {
    expect(isMultiSelect(type)).toBe(false);
  });
});

describe('getFormattedChoices', () => {
  it('returns undefined when the question is undefined or not multiselect', () => {
    expect(getFormattedChoices(undefined)).toBeUndefined();
    expect(getFormattedChoices(createSpec({ type: 'text' }))).toBeUndefined();
  });

  it('formats choice arrays and array defaults with stable ids', () => {
    const question = {
      ...createSpec({ choices: ['One', 'Two', 'Three'] }),
      default: ['Two', 'Three'],
    } as unknown as Spec;

    expect(getFormattedChoices(question)).toEqual([
      { id: '0', name: 'One', default: false },
      { id: '1', name: 'Two', default: true },
      { id: '2', name: 'Three', default: true },
    ]);
  });

  it('splits newline-delimited choices and string defaults', () => {
    const question = createSpec({
      choices: 'One\nTwo\nThree',
      default: 'One\nThree',
    });

    expect(getFormattedChoices(question)).toEqual([
      { id: '0', name: 'One', default: true },
      { id: '1', name: 'Two', default: false },
      { id: '2', name: 'Three', default: true },
    ]);
  });

  it('marks all choices as non-default for an empty default', () => {
    const question = createSpec({ choices: ['One', 'Two'], default: '' });

    expect(getFormattedChoices(question)).toEqual([
      { id: '0', name: 'One', default: false },
      { id: '1', name: 'Two', default: false },
    ]);
  });
});
