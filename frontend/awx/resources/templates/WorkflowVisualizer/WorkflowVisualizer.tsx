import { Bullseye, EmptyState, EmptyStateHeader, Icon, Spinner } from '@patternfly/react-core';
import { ShareAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getPatternflyColor } from '../../../../../framework';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { WorkflowTopology } from './WorkflowTopology';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

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
        <EmptyState>
          <EmptyStateHeader
            titleText={t('Please wait until the Workflow Visualizer is populated.')}
            headingLevel="h4"
            icon={
              <Icon
                size="xl"
                style={{
                  paddingBottom: '40px',
                  color: getPatternflyColor('grey'),
                }}
              >
                <ShareAltIcon />
              </Icon>
            }
          >
            <Spinner />
          </EmptyStateHeader>
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
