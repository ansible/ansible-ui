import { ElementType } from 'react';
import { useTranslation } from 'react-i18next';
import { ActionList, Button, PageSection } from '@patternfly/react-core';
import { useVisualizationController } from '@patternfly/react-topology';
import {
  ClipboardCheckIcon,
  ClockIcon,
  CogIcon,
  ProcessAutomationIcon,
  ShareAltIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';
import { DateTimeCell, PageDetail, PageDetails, Scrollable } from '../../../../../../framework';
import { useGet } from '../../../../../common/crud/useGet';
import { LastModifiedPageDetail } from '../../../../../common/LastModifiedPageDetail';
import { PageDetailCodeEditor } from '../../../../../../framework/PageDetails/PageDetailCodeEditor';
import { jsonToYaml } from '../../../../../../framework/utils/codeEditorUtils';
import { Project } from '../../../../interfaces/Project';
import { JobTemplate } from '../../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../../interfaces/WorkflowJobTemplate';
import { InventorySource } from '../../../../interfaces/InventorySource';
import { SystemJobTemplate } from '../../../../interfaces/SystemJobTemplate';
import { WorkflowApproval } from '../../../../interfaces/WorkflowApproval';
import { ControllerState, GraphNode } from '../types';
import { useViewOptions } from '../ViewOptionsProvider';
import { useCloseSidebar, useGetNodeTypeDetail, useGetTimeoutString } from '../hooks';
import { InventorySourceDetails } from './InventorySourceDetails';
import { JobTemplateDetails } from './JobTemplateDetails';
import { NodeNameDetail } from './NodeNameDetail';
import { ProjectDetails } from './ProjectDetails';
import { SidebarHeader } from './SidebarHeader';
import { WorkflowJobTemplateDetails } from './WorkflowJobTemplateDetails';

type RelatedTemplate =
  | JobTemplate
  | WorkflowJobTemplate
  | InventorySource
  | SystemJobTemplate
  | WorkflowApproval
  | Project;

export function WorkflowNodeDetails({ node }: { node: GraphNode }) {
  const { t } = useTranslation();
  const nodeData = node.getData();
  const { data } = useGet<RelatedTemplate>(nodeData?.resource?.related?.unified_job_template);
  const unifiedJobTemplate = nodeData?.resource?.summary_fields?.unified_job_template;
  const timeoutString = useGetTimeoutString(unifiedJobTemplate?.timeout || 0);
  const nodeTypeDetail = useGetNodeTypeDetail(unifiedJobTemplate?.unified_job_type);
  const controller = useVisualizationController();
  const { RBAC } = controller.getState<ControllerState>();

  if (!nodeData) return null;

  let Details;
  switch (data?.type) {
    case 'inventory_source':
      Details = <InventorySourceDetails source={data} />;
      break;
    case 'job_template':
      Details = <JobTemplateDetails node={nodeData} template={data} />;
      break;
    case 'project':
      Details = <ProjectDetails project={data} />;
      break;
    case 'workflow_job_template':
      Details = <WorkflowJobTemplateDetails node={nodeData} template={data} />;
      break;
    case 'system_job_template':
      Details = (
        <PageDetailCodeEditor
          label={t('Variables')}
          value={jsonToYaml(JSON.stringify(nodeData?.resource?.extra_data || {}))}
        />
      );
      break;
  }

  return (
    <>
      <WorkflowNodeDetailsHeader node={node} />
      <Scrollable borderTop>
        <PageDetails numberOfColumns="single">
          <NodeNameDetail nodeData={nodeData?.resource} />
          <PageDetail label={t('Type')}>{nodeTypeDetail}</PageDetail>
          <PageDetail isEmpty={!unifiedJobTemplate?.description} label={t('Description')}>
            {unifiedJobTemplate?.description}
          </PageDetail>
          <PageDetail label={t('Convergence')}>
            {nodeData?.resource?.all_parents_must_converge ? t('All') : t('Any')}
          </PageDetail>

          {/* timeout belongs here? */}
          <PageDetail
            label={t('Timeout')}
            isEmpty={unifiedJobTemplate?.timeout === undefined ? true : false}
          >
            {timeoutString}
          </PageDetail>

          {Details}

          <PageDetail label={t('Created')} isEmpty={!nodeData?.resource?.created}>
            <DateTimeCell value={nodeData?.resource?.created} />
          </PageDetail>
          <LastModifiedPageDetail value={nodeData?.resource?.modified} />
        </PageDetails>
      </Scrollable>
      {RBAC?.edit && <WorkflowNodeDetailsFooter node={node} />}
    </>
  );
}

function WorkflowNodeDetailsHeader({ node }: { node: GraphNode }) {
  const closeSidebar = useCloseSidebar();

  const NodeIcon: { [key: string]: ElementType<SVGIconProps> } = {
    inventory_update: ProcessAutomationIcon,
    job: ClipboardCheckIcon,
    project_update: SyncAltIcon,
    system_job: CogIcon,
    workflow_approval: ClockIcon,
    workflow_job: ShareAltIcon,
  };

  const nodeData = node.getData();
  const jobType = nodeData?.resource?.summary_fields.unified_job_template?.unified_job_type;
  const Icon = jobType ? NodeIcon[jobType] : null;

  return (
    <SidebarHeader
      title={
        <>
          {Icon && <Icon style={{ marginRight: '8px' }} />}
          {node.getLabel()}
        </>
      }
      onClose={closeSidebar}
    />
  );
}

function WorkflowNodeDetailsFooter({ node }: { node: GraphNode }) {
  const { t } = useTranslation();
  const { setSidebarMode } = useViewOptions();
  const { removeNodes } = useViewOptions();
  const closeSidebar = useCloseSidebar();

  const handleEdit = () => setSidebarMode('edit');
  const handleRemove = () => {
    removeNodes([node]);
    closeSidebar();
  };

  return (
    <PageSection variant="light" isFilled={false} className="bg-lighten border-top">
      <ActionList data-cy="workflow-topology-sidebar-actions">
        <Button data-cy="edit-node" variant="primary" onClick={handleEdit}>
          {t('Edit')}
        </Button>
        <Button data-cy="remove-node" variant="danger" onClick={handleRemove}>
          {t('Remove')}
        </Button>
      </ActionList>
    </PageSection>
  );
}
