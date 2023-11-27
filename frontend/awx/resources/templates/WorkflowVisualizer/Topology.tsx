import {
  CREATE_CONNECTOR_DROP_TYPE,
  ComponentFactory,
  DagreLayout,
  DefaultGroup,
  EdgeModel,
  Graph,
  GraphComponent,
  Model,
  ModelKind,
  NodeShape,
  TopologyView as PFTopologyView,
  SELECTION_EVENT,
  TopologyControlBar,
  TopologyViewProps,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  withContextMenu,
  withDndDrop,
  withDragNode,
  withPanZoom,
  withSelection,
  GraphElement,
  ElementModel,
} from '@patternfly/react-topology';
import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EmptyStateNoData } from '../../../../../framework/components/EmptyStateNoData';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { WorkflowVisualizerNodeDetails } from './WorkflowVisualizerNodeDetails';
import {
  AddNodeButton,
  CustomEdge,
  CustomNode,
  DeletedNode,
  Legend,
  NodeContextMenu,
  VisualizerWrapper,
} from './components';
import { useWorkflowVisualizerToolbarActions } from './hooks/useWorkflowVisualizerToolbarActions';
import { LayoutNode, GraphNode, EdgeStatus } from './types';
import { EdgeContextMenu } from './components/EdgeContextMenu';

const TopologyView = styled<
  FunctionComponent<
    TopologyViewProps & {
      $isExpanded: boolean;
    }
  >
>(PFTopologyView)`
  & .pf-topology-view__project-toolbar {
    ${(props: { $isExpanded: boolean }) => !props.$isExpanded && 'flex-wrap: wrap;'}
    flex: 1;
  }

  & .pf-topology-view__project-toolbar > :first-child {
    ${(props: { $isExpanded: boolean }) => !props.$isExpanded && 'flex: 100%; padding-bottom:20px'}
  }
`;

const GRAPH_ID = 'workflow-visualizer-graph';
const CONNECTOR_SOURCE_DROP = 'connector-src-drop';
const CONNECTOR_TARGET_DROP = 'connector-target-drop';
const NODE_DIAMETER = 50;

const graphModel: Model = {
  nodes: [],
  edges: [],
  graph: {
    id: GRAPH_ID,
    type: 'graph',
    layout: 'Dagre',
  },
};

interface TopologyProps {
  data: {
    nodes: WorkflowNode[];
    template: WorkflowJobTemplate;
  };
}

export const Visualizer = ({ data: { nodes = [], template } }: TopologyProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [layout, setLayout] = useState<LayoutNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>(undefined);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const visualizationRef = useRef<Visualization>();
  const visualization = visualizationRef.current;

  const toolbarActions = useWorkflowVisualizerToolbarActions(
    nodes,
    [isExpanded, setIsExpanded],
    template
  );
  const handleSelectedNode = useCallback(
    (clickedNodeIdentifier: string[]) => {
      const clickedNodeData = nodes.find((node) => node.id.toString() === clickedNodeIdentifier[0]);
      setSelectedNode(clickedNodeData);
    },
    [nodes]
  );
  function toggleLegend() {
    setShowLegend(!showLegend);
  }

  const nodeContextMenu = NodeContextMenu();

  const edgeContextMenu = useCallback(
    (element: GraphElement<ElementModel, unknown>) => EdgeContextMenu(element, t),
    [t]
  );
  const baselineComponentFactory: ComponentFactory = useCallback(
    (kind: ModelKind, type: string) => {
      switch (type) {
        case 'group':
          return DefaultGroup;
        case 'deleted-node':
          return withDndDrop(
            nodeDropTargetSpec([
              CONNECTOR_SOURCE_DROP,
              CONNECTOR_TARGET_DROP,
              CREATE_CONNECTOR_DROP_TYPE,
            ])
          )(withDragNode(nodeDragSourceSpec('node', true, true))(DeletedNode));
        default:
          switch (kind) {
            case ModelKind.graph:
              return withPanZoom()(withSelection()(GraphComponent));
            case ModelKind.node:
              return withContextMenu(() => nodeContextMenu)(
                withDndDrop(
                  nodeDropTargetSpec([
                    CONNECTOR_SOURCE_DROP,
                    CONNECTOR_TARGET_DROP,
                    CREATE_CONNECTOR_DROP_TYPE,
                  ])
                )(withDragNode(nodeDragSourceSpec('node', true, true))(withSelection()(CustomNode)))
              );
            case ModelKind.edge:
              return withContextMenu(edgeContextMenu)(withSelection()(CustomEdge));
            default:
              return undefined;
          }
      }
    },
    [nodeContextMenu, edgeContextMenu]
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
          ranker: 'longest-path',
          ranksep: 200,
        })
    );
    newVisualization.fromModel(graphModel, false);
    newVisualization.addEventListener(SELECTION_EVENT, handleSelectedNode);
    return newVisualization;
  }, [baselineComponentFactory, handleSelectedNode]);

  const createEdge = useCallback(
    (source: string, target: string, tagStatus: EdgeStatus) => {
      const tagLabel = {
        [EdgeStatus.success]: t('Run on success'),
        [EdgeStatus.danger]: t('Run on fail'),
        [EdgeStatus.info]: t('Run always'),
      };

      return {
        id: `${source}-${target}`,
        type: 'edge',
        source,
        target,
        data: {
          tag: tagLabel[tagStatus],
          tagStatus,
          endTerminalStatus: tagStatus.toLowerCase(),
        },
      };
    },
    [t]
  );

  useEffect(() => {
    const layoutNodes = nodes.map((node) => {
      return {
        ...node,
        runAfterTasks: [],
      };
    });

    return setLayout(() => [...layoutNodes]);
  }, [nodes]);

  useEffect(() => {
    if (!visualizationRef.current) {
      visualizationRef.current = createVisualization();
    }
  }, [createVisualization, visualization]);

  useEffect(() => {
    if (!visualization) {
      return;
    }

    const edges: EdgeModel[] = [];
    const nodes: GraphNode[] = layout.map((n) => {
      const nodeId = n.id.toString();
      let nodeType = 'node';
      let nodeName = n.summary_fields?.unified_job_template?.name;

      if (!nodeName) {
        nodeName = t('Deleted');
        nodeType = 'deleted-node';
      }

      n.success_nodes.forEach((id) => {
        edges.push(createEdge(nodeId, id.toString(), EdgeStatus.success));
      });
      n.failure_nodes.forEach((id) => {
        edges.push(createEdge(nodeId, id.toString(), EdgeStatus.danger));
      });
      n.always_nodes.forEach((id) => {
        edges.push(createEdge(nodeId, id.toString(), EdgeStatus.info));
      });

      const node: GraphNode = {
        id: nodeId,
        type: nodeType,
        label: nodeName,
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: NodeShape.circle,
        data: {
          jobType: n.summary_fields?.unified_job_template?.unified_job_type,
          id: nodeId,
        },
      };

      return node;
    });

    const model: Model = {
      edges,
      nodes,
      graph: {
        id: GRAPH_ID,
        type: 'graph',
        layout: 'Dagre',
      },
    };

    visualization.fromModel(model, true);
  }, [t, layout, visualization, createEdge]);

  if (!visualization) {
    return null;
  }

  return (
    <VisualizationProvider controller={visualization}>
      <VisualizerWrapper isExpanded={isExpanded}>
        <TopologyView
          $isExpanded={isExpanded}
          data-cy="workflow-visualizer"
          contextToolbar={toolbarActions}
          controlBar={
            <TopologyControlBar
              controlButtons={createTopologyControlButtons({
                ...defaultControlButtonsOptions,
                zoomInCallback: action(() => {
                  visualization.getGraph().scaleBy(4 / 3);
                }),
                zoomOutCallback: action(() => {
                  visualization.getGraph().scaleBy(0.75);
                }),
                fitToScreenCallback: action(() => {
                  visualization.getGraph().fit(80);
                }),
                resetViewCallback: action(() => {
                  visualization.getGraph().reset();
                  visualization.getGraph().layout();
                }),
                legend: true,
                legendCallback: toggleLegend,
              })}
            />
          }
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
        >
          <VisualizerGraph selectedNode={selectedNode} isEmpty={!nodes.length} />
          {showLegend && <Legend />}
        </TopologyView>
      </VisualizerWrapper>
    </VisualizationProvider>
  );
};

function VisualizerGraph({
  selectedNode,
  isEmpty,
}: {
  selectedNode?: WorkflowNode;
  isEmpty: boolean;
}) {
  const { t } = useTranslation();

  if (isEmpty) {
    return (
      <EmptyStateNoData
        button={<AddNodeButton variant="primary" />}
        title={t('There are currently no nodes in this workflow')}
        description={t('Add a node by clicking the button below')}
      />
    );
  }

  return <VisualizationSurface state={selectedNode} />;
}
