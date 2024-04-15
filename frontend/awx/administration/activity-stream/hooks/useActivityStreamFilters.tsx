import { useMemo } from 'react';
import {
  useInitiatedByToolbarFilter,
  useKeywordToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useActivityStreamFilter() {
  const keywordToolbarFilter = useKeywordToolbarFilter();
  const initiatedByToolbarFilter = useInitiatedByToolbarFilter();
  const typeToolbarFilter = useMemo<IToolbarFilter>(
    () => ({
      type: ToolbarFilterType.SingleSelect,
      key: 'type',
      query: 'object1__in',
      label: 'Type',
      options: [
        { label: 'All Activity', value: '' },
        { label: 'Jobs', value: 'job' },
        { label: 'Schedules', value: 'schedule' },
        { label: 'Workflow Approvals', value: 'workflow_approval', group: 'Administration' },
        {
          label: 'Templates',
          value: 'job_template+workflow_job_template+workflow_job_template_node',
        },
        { label: 'Credentials', value: 'credential', group: 'Access' },
        { label: 'Projects', value: 'project' },
        { label: 'Inventories', value: 'inventory', group: 'Infrastructure' },
        { label: 'Hosts', value: 'host', group: 'Infrastructure' },
        { label: 'Organizations', value: 'organization', group: 'Access' },
        { label: 'Users', value: 'user', group: 'Access' },
        { label: 'Teams', value: 'team', group: 'Access' },
        { label: 'Credential Types', value: 'credential_type', group: 'Access' },
        {
          label: 'Notification Templates',
          value: 'notification_template',
          group: 'Administration',
        },
        { label: 'Instances', value: 'instance', group: 'Infrastructure' },
        { label: 'Instance Groups', value: 'instance_group', group: 'Infrastructure' },
        {
          label: 'Applications and Tokens',
          value: 'o_auth2_application',
          group: 'Administration',
        },
        {
          label: 'Execution Environments',
          value: 'execution_environment',
          group: 'Infrastructure',
        },
        { label: 'Settings', value: 'setting', group: 'Administration' },
      ],
      placeholder: 'Filter by type',
      isPinned: true,
    }),
    []
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
