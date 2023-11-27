import { Bullseye, EmptyState, EmptyStateHeader, Icon, Spinner } from '@patternfly/react-core';
import { ShareAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { getPatternflyColor } from '../../../../../framework';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { Visualizer } from './Topology';

export function WorkflowVisualizer() {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();

  const {
    data: wfNodes,
    error: workflowNodeError,
    refresh: workflowNodeRefresh,
    isLoading: workflowNodeIsLoading,
  } = useGet<AwxItemsResponse<WorkflowNode>>(
    awxAPI`/workflow_job_templates/${Number(id).toString()}/workflow_nodes/`
  );
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
