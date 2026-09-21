import type { PageFormOptionsData } from '@ansible/ansible-ui-framework/PageForm/PageFormOptionsContext';
import { describe, expect, it } from 'vitest';
import {
  SURVEY_LAUNCH_TEXT_OPTIONS_FIELD,
  extractSurveySpecOptionsFields,
  surveySpecOptionsToPageFormData,
} from './surveySpecOptions';

/** Raw ``/survey_spec/`` OPTIONS (nested ``POST.spec``) before normalization for PageForm. */
function surveySpecOptionsResponse(data: unknown): PageFormOptionsData {
  return data as PageFormOptionsData;
}

const tier2Pattern = '^[^<]*$';
const tier2Description = 'No HTML allowed';

describe('extractSurveySpecOptionsFields', () => {
  it('returns an empty map when optionsData is undefined', () => {
    expect(extractSurveySpecOptionsFields()).toEqual({});
  });

  it('extracts top-level name and description from POST', () => {
    const fields = extractSurveySpecOptionsFields({
      actions: {
        POST: {
          name: { pattern: '^a$', pattern_description: 'name rule' },
        },
      },
    });
    expect(fields.name?.pattern).toBe('^a$');
  });

  it('extracts nested question editor fields from actions.POST.spec', () => {
    const fields = extractSurveySpecOptionsFields(
      surveySpecOptionsResponse({
        actions: {
          POST: {
            spec: {
              type: 'json',
              question_name: {
                pattern: tier2Pattern,
                pattern_description: tier2Description,
                flags: 'i',
              },
              question_description: {
                pattern: tier2Pattern,
                pattern_description: tier2Description,
              },
              variable: {
                pattern: tier2Pattern,
                pattern_description: tier2Description,
              },
            },
          },
        },
      })
    );
    expect(fields.question_name).toEqual({
      pattern: tier2Pattern,
      pattern_description: tier2Description,
      flags: 'i',
    });
    expect(fields.variable?.pattern).toBe(tier2Pattern);
    expect(fields[SURVEY_LAUNCH_TEXT_OPTIONS_FIELD]).toEqual(fields.question_name);
  });

  it('does not add launch text metadata when question_name has no pattern', () => {
    const fields = extractSurveySpecOptionsFields(
      surveySpecOptionsResponse({
        actions: {
          POST: {
            spec: {
              type: 'json',
              question_name: { type: 'string', required: true },
            },
          },
        },
      })
    );
    expect(fields[SURVEY_LAUNCH_TEXT_OPTIONS_FIELD]).toBeUndefined();
  });
});

describe('surveySpecOptionsToPageFormData', () => {
  it('returns undefined when no patterns are present', () => {
    expect(surveySpecOptionsToPageFormData({ actions: { POST: {} } })).toBeUndefined();
  });

  it('returns POST actions suitable for PageForm optionsData', () => {
    const data = surveySpecOptionsToPageFormData(
      surveySpecOptionsResponse({
        actions: {
          POST: {
            spec: {
              question_name: { pattern: '^x$', pattern_description: 'x' },
            },
          },
        },
      })
    );
    expect(data?.actions?.POST?.question_name?.pattern).toBe('^x$');
  });
});
