import { PageFormSelect, PageFormTextArea, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormMultiSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormFieldMetadataProvider } from '@ansible/ansible-ui-framework/PageForm/PageFormOptionsContext';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { Card, CardBody, CardTitle, Stack } from '@patternfly/react-core';
import { CSSProperties, useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { Spec, Survey } from '../interfaces/Survey';
import { WizardFormValues } from '../resources/templates/WorkflowVisualizer/types';
import { awxAPI } from './api/awx-utils';
import { evaluateConditions } from './surveyConditions';
import {
  SURVEY_LAUNCH_TEXT_OPTIONS_FIELD,
  extractSurveySpecOptionsFields,
} from './surveySpecOptions';

type SurveyValue = string | string[] | number;

/** Category cards span the full width of the wizard step grid. */
const fullWidthStyle: CSSProperties = { gridColumn: '1 / -1' };

function getJobType(resource: WizardFormValues['resource']) {
  if (!resource) return;

  if ('type' in resource) {
    if (resource?.type === 'job_template') {
      return 'job_templates';
    } else if (resource?.type === 'workflow_job_template') {
      return 'workflow_job_templates';
    }
  }

  if ('unified_job_type' in resource) {
    if (resource?.unified_job_type === 'job') {
      return 'job_templates';
    } else if (resource?.unified_job_type === 'workflow_job') {
      return 'workflow_job_templates';
    }
  }
}

/**
 * Read a survey variable's value from the wizard step that owns it. Each survey
 * page is a separate wizard step (`survey_page_<n>`, or `survey` for a single
 * page), so a variable defined on page N is authoritative only in that step's
 * snapshot. Reading from the owning step avoids stale duplicates that other
 * pages' snapshots may still hold after the value changed.
 */
function getOwnedSurveyValue(
  variable: string,
  page: number,
  stepData: Record<string, unknown>
): unknown {
  const ownerStep = (stepData[`survey_page_${page}`] ?? stepData['survey']) as
    | { survey?: Record<string, unknown> }
    | undefined;
  if (ownerStep?.survey && variable in ownerStep.survey) {
    return ownerStep.survey[variable];
  }
  return undefined;
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Resolve the value of every survey variable for condition evaluation.
 * Live form values win for the current page; every other variable is read from
 * the step that owns it, then from the merged wizard data, then from its default.
 */
export function buildSurveyConditionData(
  spec: Spec[],
  options: {
    pageNumber?: number;
    liveValues?: Record<string, unknown>;
    stepData: Record<string, unknown>;
    wizardSurvey?: Record<string, unknown>;
  }
): Record<string, unknown> {
  const { pageNumber, liveValues, stepData, wizardSurvey } = options;
  const data: Record<string, unknown> = {};
  for (const item of spec) {
    const itemPage = item.page ?? 1;
    const isCurrentPage = pageNumber === undefined || itemPage === pageNumber;

    if (isCurrentPage && liveValues && item.variable in liveValues) {
      data[item.variable] = liveValues[item.variable];
      continue;
    }
    const owned = getOwnedSurveyValue(item.variable, itemPage, stepData);
    if (owned !== undefined) {
      data[item.variable] = owned;
      continue;
    }
    if (wizardSurvey && item.variable in wizardSurvey) {
      data[item.variable] = wizardSurvey[item.variable];
      continue;
    }
    if (hasValue(item.default)) {
      data[item.variable] = item.default;
    }
  }
  return data;
}

function getChoiceOptions(element: Spec): PageSelectOption<string>[] {
  let choices: string[] = [];
  if (Array.isArray(element.choices)) {
    choices = element.choices;
  } else if (typeof element.choices === 'string') {
    choices = element.choices.split('\n');
  }
  return choices.map((choice) => ({ value: choice, label: choice }));
}

/**
 * Renders a single survey question.
 *
 * `question_name` comes from the API and is rendered as-is (not passed through `t()`),
 * because i18next would treat a `:` in the label as a namespace separator.
 */
function SurveyField({ element }: Readonly<{ element: Spec }>) {
  const { t } = useTranslation();
  const name = `survey.${element.variable}`;
  const choiceOptions = useMemo(() => getChoiceOptions(element), [element]);

  switch (element.type) {
    case 'text':
      return (
        <PageFormTextInput
          name={name}
          optionsFieldName={SURVEY_LAUNCH_TEXT_OPTIONS_FIELD}
          label={element.question_name}
          labelHelp={element.question_description}
          labelHelpTitle=""
          isRequired={element.required}
          type="text"
          maxLength={element.max}
          minLength={element.min}
        />
      );
    case 'integer':
    case 'float':
      return (
        <PageFormTextInput
          name={name}
          label={element.question_name}
          labelHelp={element.question_description}
          labelHelpTitle=""
          isRequired={element.required}
          type="number"
          max={element.max}
          min={element.min}
        />
      );
    case 'password':
      return (
        <PageFormTextInput
          name={name}
          label={element.question_name}
          labelHelp={element.question_description}
          labelHelpTitle=""
          isRequired={element.required}
          type="password"
          maxLength={element.max}
          minLength={element.min}
        />
      );
    case 'textarea':
      return (
        <PageFormTextArea
          name={name}
          optionsFieldName={SURVEY_LAUNCH_TEXT_OPTIONS_FIELD}
          label={element.question_name}
          labelHelp={element.question_description}
          labelHelpTitle=""
          isRequired={element.required}
          maxLength={element.max}
          minLength={element.min}
        />
      );
    case 'multiplechoice':
      return (
        <PageFormSelect
          name={name}
          placeholderText={t('Select option')}
          label={element.question_name}
          labelHelp={element.question_description}
          labelHelpTitle=""
          options={choiceOptions}
          isRequired={element.required}
        />
      );
    case 'multiselect':
      return (
        <PageFormMultiSelect
          name={name}
          placeholder={t('Select option(s)')}
          label={element.question_name}
          labelHelp={element.question_description}
          labelHelpTitle=""
          options={choiceOptions}
          isRequired={element.required}
        />
      );
    default:
      return null;
  }
}

/** Group questions by category, preserving the order in which categories first appear. */
function groupByCategory(elements: Spec[]): { category: string; elements: Spec[] }[] {
  const groups = new Map<string, Spec[]>();
  for (const element of elements) {
    const category = element.category ?? '';
    const group = groups.get(category);
    if (group) {
      group.push(element);
    } else {
      groups.set(category, [element]);
    }
  }
  return Array.from(groups, ([category, groupElements]) => ({
    category,
    elements: groupElements,
  }));
}

export function SurveyStep({
  templateId,
  jobType,
  singleColumn,
  pageNumber,
  surveySpecData,
}: Readonly<{
  templateId?: string;
  jobType?: string;
  singleColumn?: boolean;
  /** When set, only questions on this survey page are rendered. */
  pageNumber?: number;
  /** Survey spec that was already loaded by the caller; skips fetching it again. */
  surveySpecData?: Survey;
}>) {
  const { wizardData, stepData } = usePageWizard();
  const { reset, unregister } = useFormContext();

  let { resource } = wizardData as WizardFormValues;
  if (!resource && stepData?.nodePromptsStep) {
    resource = (stepData?.nodePromptsStep as WizardFormValues).resource;
  }
  const id = resource ? resource?.id?.toString() : templateId ? templateId : '';

  jobType = jobType ?? getJobType(resource);

  const surveySpecUrl = awxAPI`/${jobType ?? 'job_templates'}/${id}/survey_spec/`;

  const { data: fetchedSpec } = useGet<Survey>(surveySpecData ? undefined : surveySpecUrl);
  const survey_spec = surveySpecData ?? fetchedSpec;

  const { data: surveySpecOptions } = useOptions<OptionsResponse<ActionsResponse>>(surveySpecUrl);
  const surveyFieldMetadata = useMemo(
    () => extractSurveySpecOptionsFields(surveySpecOptions),
    [surveySpecOptions]
  );

  useEffect(() => {
    if (!survey_spec?.spec) return;
    const survey: Record<string, SurveyValue> = {};

    survey_spec.spec.forEach((obj: Spec) => {
      // Read the prior value from the step that owns this variable (by page),
      // not from a stale duplicate copied into another page's step snapshot.
      const prev = getOwnedSurveyValue(obj.variable, obj.page ?? 1, stepData);
      if (prev !== undefined) {
        survey[obj.variable] = prev as SurveyValue;
        return;
      }
      if (!hasValue(obj.default)) return;
      if (obj.type === 'multiselect') {
        survey[obj.variable] = String(obj.default).split('\n');
        return;
      }
      survey[obj.variable] = obj.default;
    });

    reset({ survey });
  }, [survey_spec, reset, stepData]);

  const liveValues = useWatch({ name: 'survey' }) as Record<string, unknown> | undefined;
  const wizardSurvey = (wizardData as { survey?: Record<string, unknown> } | undefined)?.survey;

  const conditionData = useMemo(
    () =>
      buildSurveyConditionData(survey_spec?.spec ?? [], {
        pageNumber,
        liveValues,
        stepData,
        wizardSurvey,
      }),
    [survey_spec, pageNumber, liveValues, stepData, wizardSurvey]
  );

  const pageElements = useMemo(() => {
    const spec = survey_spec?.spec ?? [];
    return pageNumber === undefined ? spec : spec.filter((el) => (el.page ?? 1) === pageNumber);
  }, [survey_spec, pageNumber]);

  const visibleElements = useMemo(
    () => pageElements.filter((el) => evaluateConditions(el, conditionData)),
    [pageElements, conditionData]
  );

  // Hidden questions are not rendered, but their seeded value would still be registered
  // in the form. Unregister them so a hidden `required` question can never block the step;
  // the value is removed from the step data as well, so it is not submitted.
  // A newline-joined key keeps the effect from re-running on every render.
  const hiddenFieldsKey = useMemo(() => {
    const visible = new Set(visibleElements.map((el) => el.variable));
    return pageElements
      .filter((el) => !visible.has(el.variable))
      .map((el) => `survey.${el.variable}`)
      .join('\n');
  }, [pageElements, visibleElements]);

  useEffect(() => {
    if (!hiddenFieldsKey) return;
    // Keep the default so the question is seeded again if it becomes visible later.
    unregister(hiddenFieldsKey.split('\n'), { keepDefaultValue: true });
  }, [hiddenFieldsKey, unregister]);

  const groups = useMemo(() => groupByCategory(visibleElements), [visibleElements]);
  const hasCategories = groups.some((group) => group.category !== '');

  return (
    <PageFormFieldMetadataProvider fields={surveyFieldMetadata}>
      {hasCategories ? (
        <div style={fullWidthStyle}>
          <Stack hasGutter>
            {groups.map((group) =>
              group.category ? (
                <Card key={`category-${group.category}`}>
                  <CardTitle>{group.category}</CardTitle>
                  <CardBody>
                    <PageFormSection singleColumn={singleColumn}>
                      {group.elements.map((element) => (
                        <SurveyField key={element.variable} element={element} />
                      ))}
                    </PageFormSection>
                  </CardBody>
                </Card>
              ) : (
                <PageFormSection key="uncategorized" singleColumn={singleColumn}>
                  {group.elements.map((element) => (
                    <SurveyField key={element.variable} element={element} />
                  ))}
                </PageFormSection>
              )
            )}
          </Stack>
        </div>
      ) : (
        <PageFormSection singleColumn={singleColumn}>
          {visibleElements.map((element) => (
            <SurveyField key={element.variable} element={element} />
          ))}
        </PageFormSection>
      )}
    </PageFormFieldMetadataProvider>
  );
}

/** Extract the unique, sorted page numbers used in a survey spec. */
export function getSurveyPages(spec: Spec[]): number[] {
  const pageSet = new Set<number>();
  for (const element of spec) {
    pageSet.add(element.page ?? 1);
  }
  return Array.from(pageSet).sort((a, b) => a - b);
}

/**
 * Build a label for a survey page from the categories used on that page.
 * Returns `undefined` when the page has no categories, so the caller can fall back
 * to a translated default label.
 */
export function getSurveyPageLabel(spec: Spec[], pageNum: number): string | undefined {
  const categories = new Set<string>();
  for (const element of spec) {
    if ((element.page ?? 1) === pageNum && element.category) {
      categories.add(element.category);
    }
  }
  return categories.size > 0 ? Array.from(categories).join(', ') : undefined;
}
