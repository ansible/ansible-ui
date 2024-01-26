import { useCallback, useEffect, useRef } from 'react';
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
  ElementModel,
  withCreateConnector,
  isNode,
  Edge,
} from '@patternfly/react-topology';
import { EmptyStateNoData } from '../../../../../framework/components/EmptyStateNoData';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import {
  AddNodeButton,
  CustomEdge,
  CustomNode,
  EdgeContextMenu,
  Legend,
  NodeContextMenu,
  WorkflowVisualizerToolbar,
  ToolbarHeader,
  Sidebar,
} from './components';
import { GraphNode, EdgeStatus } from './types';
import { ViewOptionsContext, ViewOptionsProvider } from './ViewOptionsProvider';
import { useCreateEdge } from './hooks';
import { GRAPH_ID, CONNECTOR_SOURCE_DROP, CONNECTOR_TARGET_DROP, NODE_DIAMETER } from './constants';

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
  const createEdge = useCreateEdge();

  const handleSelectedNode = useCallback(
    (clickedNodeIdentifier: string[]) => {
      const clickedNodeData = workflowNodes.find(
        (node) => node.id.toString() === clickedNodeIdentifier[0]
      );
      return clickedNodeData;
    },
    [workflowNodes]
  );
  const nodeContextMenu = useCallback(
    (element: GraphNode) => [<NodeContextMenu key="nodeContext" element={element} />],
    []
  );
  const edgeContextMenu = useCallback(
    (
      element: Edge<
        ElementModel,
        {
          tag: string;
          isNew: boolean;
          tagStatus: EdgeStatus;
          endTerminalStatus: EdgeStatus;
          originalStatus: EdgeStatus;
        }
      >
    ) => [<EdgeContextMenu key="edgeContext" element={element} />],
    []
  );
  const baselineComponentFactory: ComponentFactory = useCallback(
    (kind: ModelKind, type: string) => {
      switch (type) {
        case 'group':
          return DefaultGroup;
        default:
          switch (kind) {
            case ModelKind.graph:
              return withPanZoom()(withSelection()(GraphComponent));
            case ModelKind.node:
              return withCreateConnector((source, target): void => {
                const model = source.getController().toModel();
                const controller = source.getController();
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
                    originalStatus: 'info',
                  },
                });
                source.setState({ modified: true });
                controller.setState({ ...controller.getState(), modified: true });
                controller.fromModel(model);
              })(
                withContextMenu(nodeContextMenu)(
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

  const visualizationRef = useRef<Visualization>(createVisualization());
  const visualization = visualizationRef.current;

  useEffect(() => {
    const edges: EdgeModel[] = [];
    const nodes = workflowNodes.map((n) => {
      const nodeId = n.id.toString();
      const nodeType = 'node';
      const nodeName = n.summary_fields?.unified_job_template?.name;

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
        label: nodeName ?? t('Deleted'),
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: NodeShape.circle,
        data: {
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
          {({ isFullScreen, isEmpty, isLegendOpen, toggleLegend, sidebarMode }) => {
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
                sideBarOpen={sidebarMode !== undefined}
                sideBarResizable
                sideBar={<Sidebar />}
                minSideBarSize={'50%'}
              >
                {isEmpty ? (
                  <div style={{ flex: '1 0 100%' }}>
                    <EmptyStateNoData
                      button={<AddNodeButton variant="primary" />}
                      title={t('There are currently no nodes in this workflow')}
                      description={t('Add a node by clicking the button below')}
                    />
                  </div>
                ) : (
                  <>
                    {isLegendOpen && <Legend />}
                    <VisualizationSurface
                      state={{
                        workflowTemplate: template,
                        RBAC: {
                          edit: template.summary_fields.user_capabilities.edit,
                          start: template.summary_fields.user_capabilities.start,
                        },
                      }}
                    />
                  </>
                )}
              </TopologyView>
            );
          }}
        </ViewOptionsContext.Consumer>
      </ViewOptionsProvider>
    </VisualizationProvider>
  );
};
