import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { Bullseye, EmptyState, Spinner, EmptyStateVariant } from '@patternfly/react-core';
import { ShareAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { WorkflowTopology } from './WorkflowTopology';

export function WorkflowVisualizer() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const {
    results: workflowNodes,
    error: workflowNodeError,
    isLoading: workflowNodeIsLoading,
    refresh: workflowNodeRefresh,
  } = useAwxGetAllPages<WorkflowNode>(awxAPI`/workflow_job_templates/${id ?? ''}/workflow_nodes/`);

  const {
    data: workflowJobTemplate,
    error: workflowError,
    refresh: workflowRefresh,
    isLoading: workflowIsLoading,
  } = useGetItem<WorkflowJobTemplate>(awxAPI`/workflow_job_templates/`, id);

  const error = workflowError || workflowNodeError;
  if (error) {
    return <AwxError error={error} handleRefresh={workflowRefresh || workflowNodeRefresh} />;
  }

  if (workflowIsLoading || workflowNodeIsLoading || !workflowJobTemplate || !workflowNodes) {
    return (
      <Bullseye>
        <EmptyState
          titleText={t('Please wait until the Workflow Visualizer is populated.')}
          variant={EmptyStateVariant.xl}
          headingLevel="h4"
          icon={ShareAltIcon}
        >
          <Spinner />
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <WorkflowTopology
      data={{
        workflowNodes,
        template: workflowJobTemplate,
      }}
    />
  );
}
