import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  SELECTION_EVENT,
  TopologyControlBar,
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
  TopologyView,
  GraphElement,
  ElementModel,
  withCreateConnector,
  isNode,
} from '@patternfly/react-topology';
import { EmptyStateNoData } from '../../../../../framework/components/EmptyStateNoData';
import {
  AddNodeButton,
  CustomEdge,
  CustomNode,
  DeletedNode,
  EdgeContextMenu,
  Legend,
  NodeContextMenu,
  WorkflowVisualizerToolbar,
} from './components';
import { WorkflowVisualizerNodeDetails } from './WorkflowVisualizerNodeDetails';
import { EdgeStatus } from './types';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { ViewOptionsProvider, ViewOptionsContext, useViewOptions } from './ViewOptionsProvider';
import { ToolbarHeader } from './components/WorkflowVisualizerToolbar';

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
    visible: false,
  },
};

interface TopologyProps {
  data: {
    workflowNodes: WorkflowNode[];
    template: WorkflowJobTemplate;
  };
}

export const Visualizer = ({ data: { workflowNodes = [], template } }: TopologyProps) => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>(undefined);

  const handleSelectedNode = useCallback(
    (clickedNodeIdentifier: string[]) => {
      const clickedNodeData = workflowNodes.find(
        (node) => node.id.toString() === clickedNodeIdentifier[0]
      );
      setSelectedNode(clickedNodeData);
    },
    [workflowNodes]
  );

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
          )(
            withDragNode(nodeDragSourceSpec('node', true, true))(
              withSelection({ multiSelect: true })(DeletedNode)
            )
          );
        default:
          switch (kind) {
            case ModelKind.graph:
              return withPanZoom()(withSelection()(GraphComponent));
            case ModelKind.node:
              return withCreateConnector((source, target): void => {
                const model = source.getController().toModel();
                if (!isNode(target)) {
                  return;
                }
                if (!model.edges) {
                  model.edges = [];
                }
                model.edges.push({
                  id: `${source.getId()}-${target.getId()}`,
                  type: 'edge',
                  source: source.getId(),
                  target: target.getId(),
                  data: {
                    tag: t('Run always'),
                    tagStatus: 'info',
                    endTerminalStatus: 'info',
                  },
                });
                // TODO: Handle toggle unsaved changes
                source.getController().fromModel(model);
              })(
                withContextMenu(() => nodeContextMenu)(
                  withDndDrop(
                    nodeDropTargetSpec([
                      CONNECTOR_SOURCE_DROP,
                      CONNECTOR_TARGET_DROP,
                      CREATE_CONNECTOR_DROP_TYPE,
                    ])
                  )(
                    withDragNode(nodeDragSourceSpec('node', true, true))(
                      withSelection()(CustomNode)
                    )
                  )
                )
              );
            case ModelKind.edge:
              return withContextMenu(edgeContextMenu)(withSelection()(CustomEdge));
            default:
              return undefined;
          }
      }
    },
    [nodeContextMenu, edgeContextMenu, t]
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
  const visualization = createVisualization();

  useEffect(() => {
    if (!visualization) {
      return;
    }

    const edges: EdgeModel[] = [];
    const nodes = workflowNodes.map((n) => {
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

      const node = {
        id: nodeId,
        type: nodeType,
        label: nodeName,
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: NodeShape.circle,
        data: {
          id: nodeId,
          resource: n,
        },
      };

      return node;
    });

    const model = {
      edges,
      nodes,
      graph: {
        id: GRAPH_ID,
        type: 'graph',
        layout: 'Dagre',
        visible: true,
      },
    };

    visualization.fromModel(model, true);
  }, [t, visualization, createEdge, workflowNodes]);

  return (
    <VisualizationProvider controller={visualization}>
      <ViewOptionsProvider>
        {/* tools provider name */}
        <ViewOptionsContext.Consumer>
          {({ isFullScreen, isLegendOpen, toggleLegend }) => {
            return (
              <TopologyView
                data-cy="workflow-visualizer"
                contextToolbar={isFullScreen ? null : <ToolbarHeader />}
                viewToolbar={<WorkflowVisualizerToolbar />}
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
                <VisualizerGraph state={{ selectedNode, workflowTemplate: template }} />
                {isLegendOpen && <Legend />}
              </TopologyView>
            );
          }}
        </ViewOptionsContext.Consumer>
      </ViewOptionsProvider>
    </VisualizationProvider>
  );
};

function VisualizerGraph({
  state,
}: {
  state: { selectedNode?: WorkflowNode; workflowTemplate: WorkflowJobTemplate };
}) {
  const { t } = useTranslation();
  const { isEmpty } = useViewOptions();

  if (isEmpty) {
    return (
      <EmptyStateNoData
        button={<AddNodeButton variant="primary" />}
        title={t('There are currently no nodes in this workflow')}
        description={t('Add a node by clicking the button below')}
      />
    );
  }

  return <VisualizationSurface state={state} />;
}
