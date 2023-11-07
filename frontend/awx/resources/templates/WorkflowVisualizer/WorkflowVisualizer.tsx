import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { TopologyView as PFTopologyView } from '@patternfly/react-topology';
import { Topology } from './Topology';
import { useGet, useGetItem } from '../../../../common/crud/useGet';
import { useWorkflowVisualizerToolbarActions } from './hooks/useWorkflowVisualizerToolbarActions';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { WorkflowVisualizerNodeDetails } from './WorkflowVisualizerNodeDetails';
import { Reducer, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyStateNoData } from '../../../../../framework/components/EmptyStateNoData';
import { AddNodeButton } from './components/AddNodeButton';
import { PageSection, PageSectionVariants, Title } from '@patternfly/react-core';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxError } from '../../../common/AwxError';
import { EmptyState, EmptyStateHeader, Icon, Spinner } from '@patternfly/react-core';
import { ShareAltIcon } from '@patternfly/react-icons';
import { getPatternflyColor } from '../../../../../framework';
import { WorkflowVisualizerAction, WorkflowVisualizerState } from './types';
import { workflowVisualizerReducer } from './hooks/workflowReducer';

const TopologyView = styled(PFTopologyView)`
  & .pf-topology-view__project-toolbar {
    flex: 1;
  }
`;

export function WorkflowVisualizer() {
  const { id } = useParams<{ id?: string }>();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer<Reducer<WorkflowVisualizerState, WorkflowVisualizerAction>>(
    workflowVisualizerReducer,
    {
      showUnsavedChangesModal: false,
      nodesToDelete: [], // could be used for delete all nodes also
      unsavedChanges: false,
      nodeToEdit: undefined,
      nodeToView: undefined,
      nodes: [],
      showDeleteAllNodesModal: false,
      isLoading: true,
    }
  );

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

  useEffect(() => {
    dispatch({ type: 'SET_NODES', value: wfNodes?.results ?? [] });
  }, [wfNodes?.results]);
  const error = workflowError || workflowNodeError;
  const toolbarActions = useWorkflowVisualizerToolbarActions(state, dispatch);

  if (error) {
    return <AwxError error={error} handleRefresh={workflowRefresh || workflowNodeRefresh} />;
  }

  let topologyScreen;
  if (state.isLoading) {
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
        state={state}
        handleSelectedNode={(clickedNodeIdentifier: string[]) => {
          const clickedNodeData = wfNodes.results.find(
            (node) => node.id.toString() === clickedNodeIdentifier[0]
          );
          if (clickedNodeData === undefined) return;
          dispatch({ type: 'SET_NODE_TO_VIEW', value: clickedNodeData });
        }}
      />
    );
  }

  return (
    <>
      <PageSection
        style={{ paddingBottom: '0px' }}
        data-cy="workflow-job-template-name"
        variant={PageSectionVariants.light}
      >
        <Title headingLevel="h1">{workflowJobTemplate?.name}</Title>
      </PageSection>
      <TopologyView
        sideBarOpen={state.nodeToView !== undefined}
        sideBarResizable
        sideBar={
          state.nodeToView ? (
            <WorkflowVisualizerNodeDetails
              setSelectedNode={() => dispatch({ type: 'SET_NODE_TO_VIEW', value: undefined })}
              selectedNode={state.nodeToView}
            />
          ) : null
        }
        contextToolbar={toolbarActions}
        data-cy="workflow-visualizer"
      >
        {topologyScreen}
      </TopologyView>
    </>
  );
}
