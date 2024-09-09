import { useMemo } from 'react';
import {
  useInitiatedByToolbarFilter,
  useKeywordToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import { useTranslation } from 'react-i18next';

export function useActivityStreamFilter() {
  const keywordToolbarFilter = useKeywordToolbarFilter();
  const initiatedByToolbarFilter = useInitiatedByToolbarFilter();
  const { t } = useTranslation();
  const typeToolbarFilter = useMemo<IToolbarFilter>(
    () => ({
      type: ToolbarFilterType.SingleSelect,
      key: 'type',
      query: 'object1__in',
      label: t('Type'),
      options: [
        { label: t('All Activity'), value: '' },
        { label: t('Jobs'), value: 'job' },
        { label: t('Schedules'), value: 'schedule' },
        { label: t('Workflow Approvals'), value: 'workflow_approval', group: 'Administration' },
        {
          label: t('Templates'),
          value: 'job_template+workflow_job_template+workflow_job_template_node',
        },
        { label: t('Credentials'), value: 'credential', group: 'Access' },
        { label: t('Projects'), value: 'project' },
        { label: t('Inventories'), value: 'inventory', group: 'Infrastructure' },
        { label: t('Hosts'), value: 'host', group: 'Infrastructure' },
        { label: t('Organizations'), value: 'organization', group: 'Access' },
        { label: t('Users'), value: 'user', group: 'Access' },
        { label: t('Teams'), value: 'team', group: 'Access' },
        { label: t('Credential Types'), value: 'credential_type', group: 'Access' },
        {
          label: t('Notification Templates'),
          value: 'notification_template',
          group: 'Administration',
        },
        { label: t('Instances'), value: 'instance', group: 'Infrastructure' },
        { label: t('Instance Groups'), value: 'instance_group', group: 'Infrastructure' },
        {
          label: t('Applications and Tokens'),
          value: 'o_auth2_application',
          group: 'Administration',
        },
        {
          label: t('Execution Environments'),
          value: 'execution_environment',
          group: 'Infrastructure',
        },
        { label: t('Settings'), value: 'setting', group: 'Administration' },
      ],
      placeholder: 'Filter by type',
      isPinned: true,
    }),
    [t]
  );
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'activity_stream',
    preFilledValueKeys: {
      id: {
        apiPath: 'activity_stream',
      },
    },
    additionalFilters: [keywordToolbarFilter, initiatedByToolbarFilter, typeToolbarFilter],
    preSortedKeys: ['keyword', 'initiated-by', 'id'],
  });
  return toolbarFilters;
}
