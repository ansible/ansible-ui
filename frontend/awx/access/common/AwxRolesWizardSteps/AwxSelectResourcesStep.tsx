import { useTranslation } from 'react-i18next';
import { ITableColumn, IToolbarFilter, ToolbarFilterType } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { useMemo } from 'react';
import { PageMultiSelectList } from '../../../../../framework/PageTable/PageMultiSelectList';
import { Title } from '@patternfly/react-core';
import styled from 'styled-components';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxMultiSelectListView } from '../../../common/useAwxMultiSelectListView';
import { Credential } from '../../../interfaces/Credential';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { Inventory } from '../../../interfaces/Inventory';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { Project } from '../../../interfaces/Project';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export type AwxResourceType =
  | Credential
  | ExecutionEnvironment
  | InstanceGroup
  | Inventory
  | JobTemplate
  | NotificationTemplate
  | Project
  | WorkflowJobTemplate;

const resourceToEndpointMapping: { [key: string]: string } = {
  'awx.credential': awxAPI`/credentials/`,
  'awx.executionenvironment': awxAPI`/execution_environments/`,
  'awx.instancegroup': awxAPI`/instance_groups/`,
  'awx.inventory': awxAPI`/inventories/`,
  'awx.jobtemplate': awxAPI`/job_templates/`,
  'awx.notificationtemplate': awxAPI`/notification_templates/`,
  'awx.project': awxAPI`/projects/`,
  'awx.workflowjobtemplate': awxAPI`/workflow_job_templates/`,
};

const StyledTitle = styled(Title)`
  margin-bottom: 1rem;
`;

/** Roles wizard step for selecting resources based on the resourceType selected */
export function AwxSelectResourcesStep() {
  const { wizardData } = usePageWizard();
  const { t } = useTranslation();
  const { resourceType } = wizardData as { [key: string]: unknown };

  const resourceToTitleMapping = useMemo<{ [key: string]: string }>(() => {
    return {
      'awx.credential': t('Select credentials'),
      'awx.executionenvironment': t('Select execution environments'),
      'awx.instancegroup': t('Select instance groups'),
      'awx.inventory': t('Select inventories'),
      'awx.jobtemplate': t('Select job templates'),
      'awx.notificationtemplate': t('Select notification templates'),
      'awx.project': t('Select projects'),
      'awx.workflowjobtemplate': t('Select workflow job templates'),
    };
  }, [t]);
  const tableColumns = useMemo<ITableColumn<AwxResourceType>[]>(
    () => [
      {
        header: t('Name'),
        type: 'text',
        value: (item: AwxResourceType) => item.name,
        sort: 'name',
      },
    ],
    [t]
  );
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        query: 'name__contains',
        comparison: 'contains',
      },
    ],
    [t]
  );

  const view = useAwxMultiSelectListView<AwxResourceType>(
    {
      url: resourceToEndpointMapping[resourceType as string],
      toolbarFilters,
      tableColumns,
    },
    'resources'
  );

  return (
    <>
      <StyledTitle headingLevel="h1">{resourceToTitleMapping[resourceType as string]}</StyledTitle>
      <h2 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        {t(
          "Choose the resources that will be receiving new roles. You'll be able to select the roles to apply in the next step. Note that the resources chosen here will receive all roles chosen in the next step."
        )}
      </h2>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        labelForSelectedItems={t('Selected')}
      />
    </>
  );
}
