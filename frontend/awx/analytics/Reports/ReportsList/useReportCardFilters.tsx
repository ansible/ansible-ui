import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';

export function useReportCardFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'tags',
        label: t('Tag'),
        type: ToolbarFilterType.MultiSelect,
        query: 'tags',
        options: [
          { label: t('Executive'), value: 'executive' },
          { label: t('Hosts'), value: 'hosts' },
          { label: t('Job runs'), value: 'jobRuns' },
          { label: t('Job template'), value: 'jobTemplate' },
          { label: t('Modules'), value: 'modules' },
          { label: t('Migration'), value: 'migration' },
          { label: t('Operations'), value: 'operations' },
          { label: t('Organization'), value: 'organization' },
          { label: t('Performance anomaly detection'), value: 'performanceAnomalyDetection' },
          { label: t('Savings'), value: 'savings' },
          { label: t('Tasks'), value: 'tasks' },
          { label: t('Time series'), value: 'timeSeries' },
        ],
        placeholder: 'Filter by tag',
      },
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiSelect,
        query: 'name',
        options: [
          { label: t('AA 2.1 Onboarding Report'), value: 'aa_2_1_onboarding' },
          { label: t('Hosts changed by job template'), value: 'hosts_changed_by_job_template' },
          { label: t('Automation calculator'), value: 'automation_calculator' },
          { label: t('Changes made by job template'), value: 'changes_made_by_job_template' },
          { label: t('Slow hosts by job template'), value: 'host_anomalies_bar' },
          { label: t('Host runs in a job template'), value: 'host_anomalies_scatter' },
          { label: t('Task runs within host'), value: 'tasks_by_host_bar' },
          { label: t('Hosts by organization'), value: 'hosts_by_organization' },
          { label: t('Jobs/Tasks by organization'), value: 'jobs_and_tasks_by_organization' },
          { label: t('Module usage by job template'), value: 'module_usage_by_job_template' },
          { label: t('Module usage by job task'), value: 'module_usage_by_task' },
          { label: t('Module usage by organization'), value: 'module_usage_by_organization' },
          { label: t('Most used modules'), value: 'most_used_modules' },
          { label: t('Job template run rate'), value: 'job_template_run_rate' },
          { label: t('Templates explorer'), value: 'templates_explorer' },
          { label: t('Templates by organization'), value: 'templates_by_organization' },
        ],
        placeholder: 'Filter by name',
      },
      {
        key: 'description',
        label: t('Description'),
        type: ToolbarFilterType.MultiText,
        query: 'description',
        comparison: 'contains',
      },
    ],
    [t]
  );
  return toolbarFilters;
}
