import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ShareAltIcon } from '@patternfly/react-icons';
import { TopologyView as PFTopologyView } from '@patternfly/react-topology';
import { EmptyState, EmptyStateHeader, Icon, Spinner } from '@patternfly/react-core';
import { EmptyStateNoData } from '../../../../../framework/components/EmptyStateNoData';
import { getPatternflyColor } from '../../../../../framework';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { useWorkflowVisualizerToolbarActions } from './hooks/useWorkflowVisualizerToolbarActions';
import { WorkflowVisualizerNodeDetails } from './WorkflowVisualizerNodeDetails';
import { AddNodeButton, VisualizerWrapper } from './components';
import { Topology } from './Topology';
import styled from 'styled-components';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

const TopologyView = styled(PFTopologyView)`
  & .pf-topology-view__project-toolbar {
    ${(props: { $isExpanded: boolean }) => !props.$isExpanded && 'flex-wrap: wrap;'}
    flex: 1;
  }

  & .pf-topology-view__project-toolbar > :first-child {
    ${(props: { $isExpanded: boolean }) => !props.$isExpanded && 'flex: 100%; padding-bottom:20px'}
  }
`;

export function WorkflowVisualizer() {
  const { id } = useParams<{ id?: string }>();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>(undefined);
  const {
    data: wfNodes,
    error: workflowNodeError,
    refresh: workflowNodeRefresh,
  } = useGet<AwxItemsResponse<WorkflowNode>>(
    `/api/v2/workflow_job_templates/${Number(id).toString()}/workflow_nodes/`
  );
  const {
    data: workflowJobTemplate,
    error: workflowError,
    refresh: workflowRefresh,
  } = useGetItem<WorkflowJobTemplate>('/api/v2/workflow_job_templates/', id);

  const error = workflowError || workflowNodeError;
  const toolbarActions = useWorkflowVisualizerToolbarActions(
    wfNodes?.results ?? [],
    [isExpanded, setIsExpanded],
    workflowJobTemplate
  );

  if (error) {
    return <AwxError error={error} handleRefresh={workflowRefresh || workflowNodeRefresh} />;
  }

  let topologyScreen;
  if (!wfNodes || !workflowJobTemplate) {
    topologyScreen = (
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
    );
  } else if (!wfNodes?.results?.length) {
    topologyScreen = (
      <EmptyStateNoData
        button={<AddNodeButton variant="primary" />}
        title={t('There are currently no nodes in this workflow')}
        description={t('Add a node by clicking the button below')}
      />
    );
  } else {
    topologyScreen = (
      <Topology
        data={wfNodes}
        selectedNode={selectedNode}
        handleSelectedNode={(clickedNodeIdentifier: string[]) => {
          const clickedNodeData = wfNodes.results.find(
            (node) => node.id.toString() === clickedNodeIdentifier[0]
          );
          setSelectedNode(clickedNodeData);
        }}
      />
    );
  }

  return (
    <VisualizerWrapper isExpanded={isExpanded}>
      <TopologyView
        $isExpanded={isExpanded}
        sideBarOpen={selectedNode !== undefined}
        sideBarResizable
        sideBar={
          selectedNode ? (
            <WorkflowVisualizerNodeDetails
              setSelectedNode={setSelectedNode}
              selectedNode={selectedNode}
            />
          ) : null
        }
        contextToolbar={toolbarActions}
        data-cy="workflow-visualizer"
      >
        {topologyScreen}
      </TopologyView>
    </VisualizerWrapper>
  );
}
