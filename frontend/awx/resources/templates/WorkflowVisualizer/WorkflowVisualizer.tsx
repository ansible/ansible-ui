import { useEffect, useReducer } from 'react';
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
import { initialState, workflowVisualizerReducer } from './hooks/workflowReducer';
import { WorkflowVisualizerDispatch, WorkflowVisualizerState } from './types';
import { WorkflowVisualizerNodeForm } from './WorkflowVisualizerNodeForm';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';

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
  const [state, dispatch]: [WorkflowVisualizerState, WorkflowVisualizerDispatch] = useReducer(
    workflowVisualizerReducer,
    initialState
  );
  const { selectedNode, isVisualizerExpanded, isLoading, nodes } = state;
  const error = workflowError || workflowNodeError;
  const toolbarActions = useWorkflowVisualizerToolbarActions(state, dispatch, workflowJobTemplate);
  useEffect(
    () => dispatch({ type: 'SET_NODES', value: wfNodes?.results ?? [] }),
    [wfNodes?.results]
  );

  if (error) {
    return <AwxError error={error} handleRefresh={workflowRefresh || workflowNodeRefresh} />;
  }

  let topologyScreen;
  if (isLoading) {
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
  } else if (!nodes.length) {
    topologyScreen = (
      <EmptyStateNoData
        button={<AddNodeButton variant="primary" />}
        title={t('There are currently no nodes in this workflow')}
        description={t('Add a node by clicking the button below')}
      />
    );
  } else {
    topologyScreen = <Topology state={state} dispatch={dispatch} />;
  }

  let sideBar = null;
  if (state.mode !== 'delete') {
    if (selectedNode && state.mode === 'edit') {
      sideBar = <WorkflowVisualizerNodeForm dispatch={dispatch} />;
    }
    if (selectedNode && state.mode === 'add-link') {
      sideBar = <div>{t('Adding a link')}</div>;
    }
    if (selectedNode && state.mode === 'add-node-and-link') {
      sideBar = <div>{t('Adding a node and link')}</div>;
    }
    if (selectedNode && state.mode === 'view') {
      sideBar = (
        <WorkflowVisualizerNodeDetails
          setSelectedNode={() =>
            dispatch({ type: 'SET_SELECTED_NODE', value: { node: [], mode: undefined } })
          }
          selectedNode={selectedNode}
        />
      );
    }
  }

  return (
    <VisualizerWrapper isExpanded={isVisualizerExpanded}>
      {state.showDeleteNodesModal && workflowJobTemplate ? (
        <DeleteConfirmationModal
          state={state}
          dispatch={dispatch}
          workflowJobTemplate={workflowJobTemplate}
        />
      ) : null}
      <TopologyView
        $isExpanded={isVisualizerExpanded}
        sideBarOpen={selectedNode !== undefined && sideBar !== null}
        sideBarResizable
        sideBar={sideBar}
        contextToolbar={toolbarActions}
        data-cy="workflow-visualizer"
      >
        {topologyScreen}
      </TopologyView>
    </VisualizerWrapper>
  );
}
