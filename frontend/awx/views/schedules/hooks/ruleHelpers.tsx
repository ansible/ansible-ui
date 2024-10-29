import { useTranslation } from 'react-i18next';
import { Frequency, RRule } from 'rrule';
import { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import { stringifyTags } from '../../../resources/templates/JobTemplateFormHelpers';
import { parseVariableField } from '../../../../../framework/utils/codeEditorUtils';

export function useGetFrequencyOptions() {
  const { t } = useTranslation();
  return [
    { label: t('Yearly'), value: Frequency.YEARLY },
    { label: t('Monthly'), value: Frequency.MONTHLY },
    { label: t('Weekly'), value: Frequency.WEEKLY },
    { label: t('Daily'), value: Frequency.DAILY },
    { label: t('Hourly'), value: Frequency.HOURLY },
    { label: t('Minutely'), value: Frequency.MINUTELY },
  ];
}

export function useGetWeekdayOptions() {
  const { t } = useTranslation();
  const weekdayOptions = [
    {
      value: RRule.SU,
      label: t('Sunday'),
    },
    {
      value: RRule.MO,
      label: t('Monday'),
    },
    {
      value: RRule.TU,
      label: t('Tuesday'),
    },
    {
      value: RRule.WE,
      label: t('Wednesday'),
    },
    {
      value: RRule.TH,
      label: t('Thursday'),
    },
    {
      value: RRule.FR,
      label: t('Friday'),
    },
    {
      value: RRule.SA,
      label: t('Saturday'),
    },
  ];
  return weekdayOptions;
}

export function useGetMonthOptions() {
  const { t } = useTranslation();
  return [
    {
      value: 1,
      label: t('January'),
    },
    {
      value: 2,
      label: t('February'),
    },
    {
      value: 3,
      label: t('March'),
    },
    {
      value: 4,
      label: t('April'),
    },
    {
      value: 5,
      label: t('May'),
    },
    {
      value: 6,
      label: t('June'),
    },
    {
      value: 7,
      label: t('July'),
    },
    {
      value: 8,
      label: t('August'),
    },
    {
      value: 9,
      label: t('September'),
    },
    {
      value: 10,
      label: t('October'),
    },
    {
      value: 11,
      label: t('November'),
    },
    {
      value: 12,
      label: t('December'),
    },
  ];
}

export function mungePromptData(prompt: PromptFormValues) {
  if (prompt === undefined) return {};

  return {
    ...prompt,
    inventory: prompt?.inventory?.id,
    execution_environment: prompt.execution_environment.id ?? null,
    skip_tags: stringifyTags(prompt.skip_tags) ?? '',
    job_tags: stringifyTags(prompt.job_tags) ?? '',
  };
}

export function mungeSurveyAndExtraVarsData(survey: { [key: string]: string }, extra_vars: string) {
  if (!survey && !extra_vars) return {};

  const extraData: { [key: string]: string } = {};
  Object.keys(survey).forEach((k: string) => {
    extraData[k] = survey[k];
  });

  return { ...extraData, ...parseVariableField(extra_vars) };
}
