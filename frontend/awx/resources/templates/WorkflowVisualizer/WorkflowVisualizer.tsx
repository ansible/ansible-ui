import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ShareAltIcon } from '@patternfly/react-icons';
import { Bullseye, EmptyState, EmptyStateHeader, Icon, Spinner } from '@patternfly/react-core';
import { getPatternflyColor } from '../../../../../framework';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { Visualizer } from './Topology';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export function WorkflowVisualizer() {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const {
    data: wfNodes,
    error: workflowNodeError,
    refresh: workflowNodeRefresh,
    isLoading: workflowNodeIsLoading,
  } = useGet<AwxItemsResponse<WorkflowNode>>(
    `/api/v2/workflow_job_templates/${Number(id).toString()}/workflow_nodes/`
  );
  const {
    data: workflowJobTemplate,
    error: workflowError,
    refresh: workflowRefresh,
    isLoading: workflowIsLoading,
  } = useGetItem<WorkflowJobTemplate>('/api/v2/workflow_job_templates/', id);

  const error = workflowError || workflowNodeError;
  if (error) {
    return <AwxError error={error} handleRefresh={workflowRefresh || workflowNodeRefresh} />;
  }

  if (workflowIsLoading || workflowNodeIsLoading || !workflowJobTemplate || !wfNodes) {
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
    <Visualizer
      data={{
        nodes: wfNodes?.results,
        template: workflowJobTemplate,
      }}
    />
  );
}
