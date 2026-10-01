import type { Page, TestInfo } from '@playwright/test';
import {
  type FieldMetadata,
  type PageFormOptionsData,
  fetchAwxOptions,
  findValueFailingPattern,
  getOptionsFieldMetadata,
  isRecord,
  readOptionsFieldMetadata,
} from './optionsDrivenValidation';

/** Mirrors ``frontend/awx/common/surveySpecOptions.ts`` (not importable from Playwright at runtime). */
export const SURVEY_SPEC_QUESTION_FIELD_KEYS = [
  'question_name',
  'question_description',
  'variable',
] as const;

export const SURVEY_LAUNCH_TEXT_OPTIONS_FIELD = 'survey_response';

function extractSurveySpecOptionsFields(
  optionsData?: PageFormOptionsData
): Record<string, FieldMetadata> {
  const fields: Record<string, FieldMetadata> = {};

  for (const key of ['name', 'description'] as const) {
    const metadata = getOptionsFieldMetadata(optionsData, key);
    if (metadata) {
      fields[key] = metadata;
    }
  }

  const specSchema = optionsData?.actions?.POST?.spec;
  if (isRecord(specSchema)) {
    for (const key of SURVEY_SPEC_QUESTION_FIELD_KEYS) {
      const metadata = readOptionsFieldMetadata(specSchema[key]);
      if (metadata) {
        fields[key] = metadata;
      }
    }
  }

  if (fields.question_name) {
    fields[SURVEY_LAUNCH_TEXT_OPTIONS_FIELD] = { ...fields.question_name };
  }

  return fields;
}

export type SurveySpecNestedPatternGate = {
  options: PageFormOptionsData;
  fields: Record<string, FieldMetadata>;
  questionName: FieldMetadata;
  launchText: FieldMetadata;
};

/**
 * True when Controller advertises Tier 2 patterns on nested ``actions.POST.spec`` keys
 * (not only top-level OPTIONS fields).
 */
export function surveySpecNestedQuestionPatternsAvailable(
  optionsData?: PageFormOptionsData
): boolean {
  const specSchema = optionsData?.actions?.POST?.spec;
  if (!isRecord(specSchema)) {
    return false;
  }
  return SURVEY_SPEC_QUESTION_FIELD_KEYS.some((key) => {
    const nested = specSchema[key];
    return isRecord(nested) && typeof nested.pattern === 'string' && nested.pattern.length > 0;
  });
}

export async function fetchJobTemplateSurveySpecOptions(
  page: Page,
  jobTemplateId: number | string
): Promise<PageFormOptionsData> {
  return fetchAwxOptions(page, `/job_templates/${jobTemplateId}/survey_spec/`);
}

/**
 * Load nested survey_spec OPTIONS metadata and skip the test when patterns are absent.
 */
export async function requireSurveySpecNestedPatterns(
  page: Page,
  jobTemplateId: number | string,
  test: TestInfo
): Promise<SurveySpecNestedPatternGate> {
  const options = await fetchJobTemplateSurveySpecOptions(page, jobTemplateId);

  if (!surveySpecNestedQuestionPatternsAvailable(options)) {
    test.skip(
      true,
      'survey_spec OPTIONS does not advertise nested question_name (or sibling) pattern metadata'
    );
  }

  const fields = extractSurveySpecOptionsFields(options);
  const questionName = fields.question_name;
  const launchText = fields[SURVEY_LAUNCH_TEXT_OPTIONS_FIELD];

  if (!questionName?.pattern || !questionName.pattern_description) {
    test.skip(
      true,
      'survey_spec nested question_name pattern or pattern_description missing after extraction'
    );
  }
  if (!launchText?.pattern || !launchText.pattern_description) {
    test.skip(true, 'survey_spec launch text (survey_response) pattern metadata missing');
  }

  return { options, fields, questionName, launchText };
}

export { findValueFailingPattern };
