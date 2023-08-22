import { useTranslation } from 'react-i18next';
import { RRule } from 'rrule';
import { RouteObj } from '../../../../Routes';

export const scheduleRulesRoutes: { [key: string]: string } = {
  inventory: RouteObj.InventorySourceScheduleRules,
  job_template: RouteObj.JobTemplateScheduleRules,
  workflow_job_template: RouteObj.WorkflowJobTemplateScheduleRules,
  projects: RouteObj.ProjectScheduleRules,
};

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
export function useGetBySetPosOptions() {
  const { t } = useTranslation();
  return [
    { value: '', label: 'None' },
    { value: '1', label: t('First') },
    {
      value: '2',

      label: t('Second'),
    },
    { value: '3', label: t('Third') },
    {
      value: '4',

      label: t('Fourth'),
    },
    { value: '5', label: t('Fifth') },
    { value: '-1', label: t('Last') },
  ];
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
