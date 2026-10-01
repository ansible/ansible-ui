import {
  extractPageFormOptionsFields,
  FieldMetadata,
  PageFormOptionsData,
  PageFormOptionsFieldMetadata,
} from '@ansible/ansible-ui-framework/PageForm/PageFormOptionsContext';

/** Survey question editor strings advertised under OPTIONS ``actions.POST.spec`` on ``/survey_spec/``. */
export const SURVEY_SPEC_QUESTION_FIELD_KEYS = [
  'question_name',
  'question_description',
  'variable',
] as const;

/**
 * OPTIONS lookup key for free-text survey answers at job launch (text/textarea).
 * Controller does not advertise ``default`` on ``/survey_spec/``; launch answers use the
 * same Tier 2 pattern as ``question_name`` when enhanced validation is enabled.
 */
export const SURVEY_LAUNCH_TEXT_OPTIONS_FIELD = 'survey_response';

function extractFieldMetadataFromSchema(schema: unknown): FieldMetadata | undefined {
  if (!schema || typeof schema !== 'object') {
    return undefined;
  }
  const extracted = extractPageFormOptionsFields({
    actions: { POST: { field: schema as PageFormOptionsFieldMetadata } },
  });
  return extracted.field;
}

/**
 * Flatten ``/survey_spec/`` OPTIONS into field metadata for PageForm.
 * Top-level ``name`` / ``description`` plus nested question editor keys under ``spec``.
 */
export function extractSurveySpecOptionsFields(
  optionsData?: PageFormOptionsData
): Record<string, FieldMetadata> {
  const fields: Record<string, FieldMetadata> = {
    ...extractPageFormOptionsFields(optionsData),
  };

  const specSchema = optionsData?.actions?.POST?.spec;
  if (specSchema && typeof specSchema === 'object') {
    const specRecord = specSchema as Record<string, unknown>;
    for (const key of SURVEY_SPEC_QUESTION_FIELD_KEYS) {
      const metadata = extractFieldMetadataFromSchema(specRecord[key]);
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

/** Shape OPTIONS for ``AwxPageForm`` / ``PageForm`` ``optionsData`` from ``/survey_spec/``. */
export function surveySpecOptionsToPageFormData(
  optionsData?: PageFormOptionsData
): PageFormOptionsData | undefined {
  const fields = extractSurveySpecOptionsFields(optionsData);
  if (Object.keys(fields).length === 0) {
    return undefined;
  }
  return {
    actions: {
      POST: fields as Record<string, PageFormOptionsFieldMetadata>,
    },
  };
}
