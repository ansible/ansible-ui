import { EmptyStateNoData } from '@ansible/ansible-ui-framework/components/EmptyStateNoData';
import {
  ComponentFactory,
  DagreLayout,
  DefaultGroup,
  Edge,
  EdgeModel,
  ElementModel,
  Graph,
  GraphComponent,
  LabelPosition,
  Model,
  ModelKind,
  NodeShape,
  NodeStatus,
  TopologyView as PFTopologyView,
  SELECTION_EVENT,
  TopologyControlBar,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  withContextMenu,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from 'styled-components';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { greyBadgeLabel } from '../../../views/jobs/WorkflowOutput/WorkflowOutput';
import {
  AddNodeButton,
  CustomEdge,
  EdgeContextMenu,
  Legend,
  Sidebar,
  ToolbarHeader,
  WorkflowVisualizerToolbar,
} from './components';
import { GRAPH_ID, NODE_DIAMETER, START_NODE_ID } from './constants';
import { useCreateEdge, useDedupeOldNodes } from './hooks';
import { useCreateNodeComponent } from './hooks/useCreateNodeComponent';
import { EdgeStatus } from './types';
import { ViewOptionsContext, ViewOptionsProvider } from './ViewOptionsProvider';
import { getNodeLabel } from './wizard/helpers';

const TopologyView = styled(PFTopologyView)`
  .pf-v6-c-divider {
    display: none;
  }
`;
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

interface TopologyProps {
  data: {
    workflowNodes: WorkflowNode[];
    template: WorkflowJobTemplate;
  };
}

export const WorkflowTopology = ({ data: { workflowNodes = [], template } }: TopologyProps) => {
  const { t } = useTranslation();
  const dedupeOldNodes = useDedupeOldNodes();
  const createEdge = useCreateEdge();
  const createNodeComponent = useCreateNodeComponent();
  const handleSelectedNode = useCallback(
    (clickedNodeIdentifier: string[]) => {
      const clickedNodeData = workflowNodes.find(
        (node) => node.id.toString() === clickedNodeIdentifier[0]
      );
      return clickedNodeData;
    },
    [workflowNodes]
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
              return createNodeComponent();
            case ModelKind.edge:
              return withContextMenu(edgeContextMenu)(withSelection()(CustomEdge));
            default:
              return undefined;
          }
      }
    },
    [createNodeComponent, edgeContextMenu]
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
    newVisualization.addEventListener(SELECTION_EVENT, handleSelectedNode);
    return newVisualization;
  }, [baselineComponentFactory, handleSelectedNode]);

  const visualizationRef = useRef<Visualization>(createVisualization());
  const visualization = visualizationRef.current;

  useEffect(() => {
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

      const node = {
        id: nodeId,
        type: nodeType,
        label: nodeLabel,
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: NodeShape.circle,
        status: NodeStatus.default,
        labelPosition: LabelPosition.bottom,
        data: {
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

    dedupeOldNodes(visualization);

    visualization.fromModel(model, true);
    visualization.getGraph().reset();
    visualization.getGraph().layout();
  }, [t, visualization, createEdge, workflowNodes, dedupeOldNodes]);

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
                  !isEmpty && (
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
                  )
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
