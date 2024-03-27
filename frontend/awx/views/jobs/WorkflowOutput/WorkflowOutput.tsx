import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ComponentFactory,
  DagreLayout,
  DefaultGroup,
  EdgeModel,
  Graph,
  GraphComponent,
  Model,
  ModelKind,
  NodeShape,
  Visualization,
  VisualizationProvider,
  withPanZoom,
  withSelection,
  LabelPosition,
  NodeStatus,
} from '@patternfly/react-topology';

import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

import { EdgeStatus } from '../../../resources/templates/WorkflowVisualizer/types';
import { CustomEdge, CustomNode } from '../../../resources/templates/WorkflowVisualizer/components';
import { getNodeLabel } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { WorkflowOutputGraph } from './WorkflowOutputGraph';
import {
  GRAPH_ID,
  NODE_DIAMETER,
  START_NODE_ID,
} from '../../../resources/templates/WorkflowVisualizer/constants';
import { useCreateEdge } from '../../../resources/templates/WorkflowVisualizer/hooks';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { secondsToHHMMSS } from '../../../../../framework/utils/dateTimeHelpers';
import { Job } from '../../../interfaces/Job';
import { WorkflowOutputNode } from './WorkflowOutputNode';

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
export const greyBadgeLabel = {
  badge: 'ALL',
  badgeColor: '#D2D2D2',
  badgeTextColor: 'black',
  badgeBorderColor: '#B8BBBE',
};

export const WorkflowOutput = (props: {
  job: Job;
  reloadJob: () => void;
  refreshNodeStatus: () => void;
}) => {
  const { t } = useTranslation();
  const createEdge = useCreateEdge();

  const { results: workflowNodes } = useAwxGetAllPages<WorkflowNode>(
    awxAPI`/workflow_jobs/${props.job.id.toString() || ''}/workflow_nodes/`
  );
  const baselineComponentFactory: ComponentFactory = useCallback(
    (kind: ModelKind, type: string) => {
      switch (type) {
        case 'group':
          return DefaultGroup;
        case START_NODE_ID:
          return CustomNode;
        default:
          switch (kind) {
            case ModelKind.graph:
              return withPanZoom()(GraphComponent);
            case ModelKind.node:
              return withSelection()(WorkflowOutputNode);
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
      const nodeName = n.summary_fields?.unified_job_template?.name || '';
      const nodeLabel = getNodeLabel(nodeName, n.identifier) || t('Deleted');

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
        label: nodeLabel,
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

      if (n.all_parents_must_converge) {
        return { ...node, data: { ...node.data, ...greyBadgeLabel } };
      }

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
      <WorkflowOutputGraph
        job={props.job}
        reloadJob={props.reloadJob}
        refreshNodeStatus={props.refreshNodeStatus}
      />
    </VisualizationProvider>
  );
};
