import { useMemo } from 'react';
import {
  useInitiatedByToolbarFilter,
  useKeywordToolbarFilter,
} from '../../../common/awx-toolbar-filters';
import { IToolbarFilter, ToolbarFilterType } from '../../../../../framework';

export function useActivityStreamFilter() {
  const keywordToolbarFilter = useKeywordToolbarFilter();
  const initiatedByToolbarFilter = useInitiatedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      keywordToolbarFilter,
      initiatedByToolbarFilter,
      {
        type: ToolbarFilterType.SingleSelect,
        key: 'type',
        query: 'object1__in',
        label: 'Type',
        options: [
          { label: 'Dashboard (all activity)', value: '' },
          { label: 'Jobs', value: 'job' },
          { label: 'Schedules', value: 'schedule' },
          { label: 'Workflow Approvals', value: 'workflow_approval' },
          {
            label: 'Templates',
            value: 'job_template+workflow_job_template+workflow_job_template_node',
          },
          { label: 'Credentials', value: 'credential' },
          { label: 'Projects', value: 'project' },
          { label: 'Inventories', value: 'inventory' },
          { label: 'Hosts', value: 'host' },
          { label: 'Organizations', value: 'organization' },
          { label: 'Users', value: 'user' },
          { label: 'Teams', value: 'team' },
          { label: 'Credential Types', value: 'credential_type' },
          { label: 'Notification Templates', value: 'notification_template' },
          { label: 'Instances', value: 'instance' },
          { label: 'Instance Groups', value: 'instance_group' },
          { label: 'Applications and Tokens', value: 'o_auth2_application' },
          { label: 'Execution Environments', value: 'execution_environment' },
          { label: 'Settings', value: 'setting' },
        ],
        placeholder: 'Filter by type',
        isPinned: true,
      },
    ],
    [keywordToolbarFilter, initiatedByToolbarFilter]
  );
  return toolbarFilters;
}
