import { describe, expect, it } from 'vitest';
import { omitBlankSurveyAnswers } from './omitBlankSurveyAnswers';

describe('omitBlankSurveyAnswers', () => {
  it('returns an empty object for nullish survey', () => {
    expect(omitBlankSurveyAnswers(undefined)).toEqual({});
    expect(omitBlankSurveyAnswers(null)).toEqual({});
  });

  it('keeps filled answers including 0 and false', () => {
    expect(
      omitBlankSurveyAnswers({
        text: 'filled',
        count: 0,
        enabled: false,
        choices: ['a'],
      })
    ).toEqual({
      text: 'filled',
      count: 0,
      enabled: false,
      choices: ['a'],
    });
  });

  it('drops blank string, null, undefined, and empty array answers', () => {
    expect(
      omitBlankSurveyAnswers({
        blank: '',
        missing: null,
        unset: undefined,
        emptyList: [],
        keep: 'value',
      })
    ).toEqual({ keep: 'value' });
  });
});
