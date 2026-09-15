import { PageFormSelect, PageFormTextArea, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormMultiSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { Spec, Survey } from '../interfaces/Survey';
import { WizardFormValues } from '../resources/templates/WorkflowVisualizer/types';
import { awxAPI } from './api/awx-utils';
import { evaluateConditions } from './useSurveyConditions';

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

export function SurveyStep({
  templateId,
  jobType,
  singleColumn,
  pageNumber,
  surveySpecData,
}: {
  templateId?: string;
  jobType?: string;
  singleColumn?: boolean;
  pageNumber?: number;
  surveySpecData?: Survey;
}) {
  const { t } = useTranslation();
  const { wizardData, stepData } = usePageWizard();
  const { reset } = useFormContext();
  const stepDataRecord = stepData as Record<string, unknown>;

  let { resource } = wizardData as WizardFormValues;
  if (!resource && stepData?.nodePromptsStep) {
    resource = (stepData?.nodePromptsStep as WizardFormValues).resource;
  }
  const id = resource ? resource?.id?.toString() : templateId ? templateId : '';

  jobType = jobType ?? getJobType(resource);

  const { data: fetchedSpec } = useGet<Survey>(
    !surveySpecData ? awxAPI`/${jobType ?? 'job_templates'}/${id}/survey_spec/` : ''
  );
  const survey_spec = surveySpecData ?? fetchedSpec;

  useEffect(() => {
    if (!survey_spec?.spec) return;
    const survey: { [key: string]: string | string[] | number } = {};

    survey_spec.spec.forEach((obj: Spec) => {
      // Read the prior value from the step that owns this variable (by page),
      // not from a stale duplicate copied into another page's step snapshot.
      const prev = getOwnedSurveyValue(obj.variable, obj.page ?? 1, stepDataRecord);
      if (prev !== undefined) {
        survey[obj.variable] = prev as string | string[] | number;
        return;
      }
      if (obj.default === '' || obj.default === undefined || obj.default === null) return;
      if (obj.type === 'multiselect') {
        survey[obj.variable] = String(obj.default).split('\n');
        return;
      }
      survey[obj.variable] = obj.default;
    });

    reset({ survey });
  }, [survey_spec, reset, stepDataRecord]);

  // Watch current form values for condition evaluation
  const surveyValues = useWatch({ name: 'survey' }) as Record<string, unknown> | undefined;

  // Build condition data: resolve each variable from a single source of truth.
  // Live form values win for the current page; every other variable is read from
  // the step that owns it (by page), so a stale copy lingering in another page's
  // snapshot can no longer override an updated value.
  const wizardSurvey = (wizardData as Record<string, unknown>)?.survey as
    | Record<string, unknown>
    | undefined;
  const conditionData: Record<string, unknown> = {};
  if (survey_spec?.spec) {
    for (const item of survey_spec.spec) {
      const itemPage = item.page ?? 1;
      const isCurrentPage = pageNumber === undefined || itemPage === pageNumber;

      let value: unknown;
      let found = false;
      if (isCurrentPage && surveyValues && item.variable in surveyValues) {
        value = surveyValues[item.variable];
        found = true;
      } else {
        const owned = getOwnedSurveyValue(item.variable, itemPage, stepDataRecord);
        if (owned !== undefined) {
          value = owned;
          found = true;
        }
      }
      if (!found && wizardSurvey && item.variable in wizardSurvey) {
        value = wizardSurvey[item.variable];
        found = true;
      }
      if (!found && item.default !== undefined && item.default !== null && item.default !== '') {
        value = item.default;
        found = true;
      }
      if (found) {
        conditionData[item.variable] = value;
      }
    }
  }

  const getChoices = (name: string): PageSelectOption<string>[] => {
    const choices: PageSelectOption<string>[] = [];
    survey_spec?.spec.forEach((element: Spec) => {
      if (element.type === 'multiplechoice' || element.type === 'multiselect') {
        let choicesArray: string[] = [];

        if (Array.isArray(element.choices)) {
          choicesArray = element.choices;
        } else if (typeof element.choices === 'string') {
          choicesArray = element.choices.split('\n');
        }

        if (element.question_name === name) {
          choicesArray?.forEach((choice: string) => {
            choices.push({ value: choice, label: choice });
          });
        }
      }
    });
    return choices;
  };

  // Filter to this page's elements (or all if no pageNumber)
  const pageElements = survey_spec?.spec
    ? (pageNumber === undefined ? survey_spec.spec : survey_spec.spec.filter((el) => (el.page ?? 1) === pageNumber))
    : [];

  // Apply conditions
  const visibleElements = pageElements.filter((el) => evaluateConditions(el, conditionData));

  // Group by category
  const categories: string[] = [];
  const seen = new Set<string>();
  for (const el of visibleElements) {
    const cat = el.category ?? '';
    if (!seen.has(cat)) { seen.add(cat); categories.push(cat); }
  }

  const renderField = (element: Spec) => {
    if (element.type === 'text') return (
      <PageFormTextInput key={element.variable} name={`survey.${element.variable}`} label={t(element.question_name)} labelHelp={element.question_description} labelHelpTitle="" isRequired={element.required} type="text" maxLength={element.max} minLength={element.min} />
    );
    if (element.type === 'integer' || element.type === 'float') return (
      <PageFormTextInput key={element.variable} name={`survey.${element.variable}`} label={t(element.question_name)} labelHelp={element.question_description} labelHelpTitle="" isRequired={element.required} type="number" max={element.max} min={element.min} />
    );
    if (element.type === 'password') return (
      <PageFormTextInput key={element.variable} name={`survey.${element.variable}`} label={t(element.question_name)} labelHelp={element.question_description} labelHelpTitle="" isRequired={element.required} type="password" maxLength={element.max} minLength={element.min} />
    );
    if (element.type === 'textarea') return (
      <PageFormTextArea key={element.variable} name={`survey.${element.variable}`} label={t(element.question_name)} labelHelp={element.question_description} labelHelpTitle="" isRequired={element.required} maxLength={element.max} minLength={element.min} />
    );
    if (element.type === 'multiplechoice') return (
      <PageFormSelect key={element.variable} name={`survey.${element.variable}`} placeholderText={t('Select option')} label={t(element.question_name)} labelHelp={element.question_description} labelHelpTitle="" options={getChoices(element.question_name)} isRequired={element.required} />
    );
    if (element.type === 'multiselect') return (
      <PageFormMultiSelect key={element.variable} name={`survey.${element.variable}`} placeholder={t('Select option(s)')} label={t(element.question_name)} labelHelp={element.question_description} labelHelpTitle="" options={getChoices(element.question_name)} isRequired={element.required} />
    );
    return null;
  };

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      {categories.map((category) => {
        const categoryElements = visibleElements.filter((el) => (el.category ?? '') === category);
        if (categoryElements.length === 0) return null;

        if (!category) {
          return (
            <PageFormSection key="__uncategorized" singleColumn={singleColumn}>
              {categoryElements.map(renderField)}
            </PageFormSection>
          );
        }

        return (
          <Card key={category} isFlat style={{ marginBottom: '16px' }}>
            <CardTitle>{category}</CardTitle>
            <CardBody>
              <PageFormSection singleColumn={singleColumn}>
                {categoryElements.map(renderField)}
              </PageFormSection>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}

/** Extract unique page numbers from a survey spec. */
export function getSurveyPages(spec: Spec[]): number[] {
  const pageSet = new Set<number>();
  for (const element of spec) {
    pageSet.add(element.page ?? 1);
  }
  return Array.from(pageSet).sort((a, b) => a - b);
}

/** Build a label for a survey page based on its categories. */
export function getSurveyPageLabel(spec: Spec[], pageNum: number): string {
  const pageElements = spec.filter((el) => (el.page ?? 1) === pageNum);
  const categories = new Set<string>();
  for (const el of pageElements) {
    if (el.category) categories.add(el.category);
  }
  if (categories.size > 0) {
    return Array.from(categories).join(', ');
  }
  return `Survey (${pageNum})`;
}
