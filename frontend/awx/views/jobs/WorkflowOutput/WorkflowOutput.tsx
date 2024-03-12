import {
  ComponentFactory,
  DagreLayout,
  DefaultGroup,
  EdgeModel,
  Graph,
  GraphComponent,
  LabelPosition,
  Model,
  ModelKind,
  NodeShape,
  NodeStatus,
  Visualization,
  VisualizationProvider,
  withPanZoom,
} from '@patternfly/react-topology';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

import { secondsToHHMMSS } from '../../../../../framework/utils/dateTimeHelpers';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { Job } from '../../../interfaces/Job';
import { WorkflowVisualizerLoader } from '../../../resources/templates/WorkflowVisualizer/WorkflowVisualizerLoader';
import { CustomEdge, CustomNode } from '../../../resources/templates/WorkflowVisualizer/components';
import {
  GRAPH_ID,
  NODE_DIAMETER,
  START_NODE_ID,
} from '../../../resources/templates/WorkflowVisualizer/constants';
import { useCreateEdge } from '../../../resources/templates/WorkflowVisualizer/hooks';
import { EdgeStatus } from '../../../resources/templates/WorkflowVisualizer/types';
import { getNodeLabel } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { WorkflowOutputGraph } from './WorkflowOutputGraph';

export const graphModel: Model = {
  nodes: [],
  edges: [],
  graph: {
    id: GRAPH_ID,
    type: 'graph',
    layout: 'Dagre',
    visible: false,
  },
};

function useFetchWorkflowNodes(jobId: string) {
  const { results, isLoading, error, refresh } = useAwxGetAllPages<WorkflowNode>(
    awxAPI`/workflow_jobs/${jobId || ''}/workflow_nodes/`
  );

  if (isLoading) return <WorkflowVisualizerLoader />;

  if (error) return <AwxError error={error} handleRefresh={refresh} />;

  return results;
}

export const WorkflowOutput = (props: { job: Job; reloadJob: () => void }) => {
  const { t } = useTranslation();
  const createEdge = useCreateEdge();

  const workflowNodes = useFetchWorkflowNodes(props.job.id.toString()) as WorkflowNode[];

  const baselineComponentFactory: ComponentFactory = useCallback(
    (kind: ModelKind, type: string) => {
      switch (type) {
        case 'group':
          return DefaultGroup;
        default:
          switch (kind) {
            case ModelKind.graph:
              return withPanZoom()(GraphComponent);
            case ModelKind.node:
              return CustomNode;
            case ModelKind.edge:
              return CustomEdge;
            default:
              return undefined;
          }
      }
    },
    []
  );

  const createVisualization = useCallback(() => {
    const newVisualization = new Visualization();
    newVisualization.setFitToScreenOnLayout(true);
    newVisualization.registerComponentFactory(baselineComponentFactory);
    newVisualization.registerLayoutFactory(
      (type: string, graph: Graph) =>
        new DagreLayout(graph, {
          edgesep: 100,
          marginx: 20,
          marginy: 20,
          rankdir: 'LR',
          ranker: 'network-simplex',
          ranksep: 200,
        })
    );
    newVisualization.fromModel(graphModel, false);
    return newVisualization;
  }, [baselineComponentFactory]);

  const visualizationRef = useRef<Visualization>(createVisualization());
  const visualization = visualizationRef.current;

  useEffect(() => {
    if (!workflowNodes?.length) return;
    const edges: EdgeModel[] = [];
    const startNode = {
      id: START_NODE_ID,
      type: START_NODE_ID,
      label: t('Start'),
      width: NODE_DIAMETER,
      height: NODE_DIAMETER,
      data: {
        resource: { always_nodes: [] },
      },
    };
    const nodes = workflowNodes.map((n) => {
      const nodeId = n.id.toString();
      const nodeType = 'node';
      const nodeName = n.summary_fields?.unified_job_template?.name;
      const nodeLabel = getNodeLabel(nodeName, n.identifier);

      n.success_nodes.forEach((id) => {
        edges.push(createEdge(nodeId, id.toString(), EdgeStatus.success));
      });
      n.failure_nodes.forEach((id) => {
        edges.push(createEdge(nodeId, id.toString(), EdgeStatus.danger));
      });
      n.always_nodes.forEach((id) => {
        edges.push(createEdge(nodeId, id.toString(), EdgeStatus.info));
      });
      let time: string = '';
      if (n?.summary_fields?.job?.elapsed) {
        time = secondsToHHMMSS(n?.summary_fields?.job?.elapsed);
      }
      const status = (n.summary_fields.job?.status as NodeStatus) || undefined;
      const node = {
        id: nodeId,
        type: status ? `${status}-node` : nodeType,
        label: nodeLabel ?? t('Deleted'),
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: NodeShape.circle,
        status: status || NodeStatus.default,
        labelPosition: LabelPosition.bottom,
        data: {
          secondaryLabel: time ? t(`Elapsed time ${time}`) : undefined,
          resource: n,
        },
      };

      return node;
    });
    const nonRootNodes = edges.map((edge) => edge.target);
    const rootNodes = nodes?.filter(
      (node) => !nonRootNodes.includes(node.id) && node.id !== START_NODE_ID
    );
    rootNodes.forEach((node) => {
      edges.push(createEdge(START_NODE_ID, node.id, EdgeStatus.info));
    });

    const model = {
      edges,
      nodes: [startNode, ...nodes],
      graph: {
        id: GRAPH_ID,
        type: 'graph',
        layout: 'Dagre',
        visible: true,
      },
    };

    visualization.fromModel(model, true);
    visualization.getGraph().reset();
  }, [t, visualization, createEdge, workflowNodes]);

  return (
    <VisualizationProvider controller={visualization}>
      <WorkflowOutputGraph job={props.job} reloadJob={props.reloadJob} />
    </VisualizationProvider>
  );
};
