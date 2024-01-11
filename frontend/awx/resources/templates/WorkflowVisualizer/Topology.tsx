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
  TopologyView,
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
  GraphElement,
  ElementModel,
  withCreateConnector,
  isNode,
  Edge,
  isEdge,
} from '@patternfly/react-topology';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyStateNoData } from '../../../../../framework/components/EmptyStateNoData';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { UnifiedJobType, type WorkflowNode } from '../../../interfaces/WorkflowNode';
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
import { GraphNode, EdgeStatus, GraphNodeData } from './types';
import { ViewOptionsContext, ViewOptionsProvider } from './ViewOptionsProvider';
import { ToolbarHeader } from './components/WorkflowVisualizerToolbar';
import { Sidebar } from './components/Sidebar';
import { awxAPI } from '../../../api/awx-utils';
import { postRequest, requestDelete } from '../../../../common/crud/Data';
import { usePageNavigate } from '../../../../../framework';
import { AwxRoute } from '../../../AwxRoutes';
import { useAbortController } from '../../../../common/crud/useAbortController';

export const GRAPH_ID = 'workflow-visualizer-graph';
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
          isNew: false,
        },
      };
    },
    [t]
  );

  const visualizationRef = useRef<Visualization>(createVisualization());
  const visualization = visualizationRef.current;

  useEffect(() => {
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

  const pageNavigate = usePageNavigate();
  const abortController = useAbortController();
  return (
    <VisualizationProvider controller={visualization}>
      <ViewOptionsProvider>
        {/* tools provider name */}
        <ViewOptionsContext.Consumer>
          {({ isFullScreen, isEmpty, isLegendOpen, isLoading, toggleLegend, sidebarMode }) => {
            const state: TopologyProps & {
              selectedIds: string[] | [];
            } = visualization.getState();
            let showSideBar = false;

            if (state?.selectedIds?.length && !isLoading) {
              const element = visualization.getElementById(state.selectedIds[0]) as GraphElement;
              showSideBar = isNode(element);
            }
            if (sidebarMode === 'add') {
              showSideBar = true;
            }

            return (
              <TopologyView
                data-cy="workflow-visualizer"
                contextToolbar={isFullScreen ? null : <ToolbarHeader />}
                viewToolbar={
                  <WorkflowVisualizerToolbar
                    handleSave={() =>
                      void handleSave(visualization, workflowNodes, pageNavigate, abortController)
                    }
                  />
                }
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
                sideBarOpen={showSideBar}
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
                    <VisualizationSurface state={{ workflowTemplate: template }} />
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

async function handleSave(
  visualization: Visualization,
  originalNodes: WorkflowNode[],
  pageNavigate: (id: string, params: { params: { id: string } }) => void,
  abortController: AbortController
) {
  const graphNodes = visualization.getElements().filter(isNode);

  const state = visualization.getState<{
    workflowTemplate: WorkflowJobTemplate;
    unsavedNodeId: number;
  }>();

  const newNodeMap: {
    [nodeId: string]: {
      newNodeId: number;
      sources: { sourceId: string; nodeType: EdgeStatus }[] | [];
    };
  } = {};
  const deletedNodeIds: string[] = [];
  const edges = visualization.getElements().filter(isEdge) as Edge<
    ElementModel,
    { tag: string; tagStatus: EdgeStatus }
  >[];

  const nodeRequests: Promise<WorkflowNode>[] = [];
  const approvalTemplateRequests: Promise<WorkflowNode>[] = [];
  graphNodes.forEach((node) => {
    const isNewNode = node.getId().includes('unsavedNode');
    const nodeData = node.getData() as GraphNodeData;

    const isVisible: boolean = node.isVisible();
    if (!isVisible) {
      deletedNodeIds.push(node.getId());
    }
    if (isNewNode) {
      const sources = node.getTargetEdges().map((edge) => {
        const sourceId = edge.getSource().getId();
        const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
        return { sourceId: sourceId, nodeType: tagStatus };
      });
      nodeRequests.push(
        postRequest<WorkflowNode>(
          awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
          {
            ...nodeData,
            all_parents_must_converge: nodeData.all_parents_must_converge === 'all' ? true : false,
            unified_job_template: nodeData.resource.summary_fields.unified_job_template.id,
          }
        ).then((newNode: WorkflowNode) => {
          if (
            nodeData.resource.summary_fields.unified_job_template.unified_job_type ===
            UnifiedJobType.workflow_approval
          ) {
            approvalTemplateRequests.push(
              postRequest<WorkflowNode>(
                awxAPI`/workflow_job_template_nodes/${newNode.id.toString()}/create_approval_template/`,
                {
                  name: nodeData.resource.summary_fields.unified_job_template.name,
                  description:
                    nodeData.resource.summary_fields.unified_job_template.description || '',
                  timeout: nodeData.resource.summary_fields.unified_job_template.timeout || 0,
                }
              )
            );
          }
          const model = visualization.toModel();
          newNodeMap[node.getId()] = { newNodeId: newNode.id, sources };
          visualization.fromModel(model, false);
          return newNode;
        })
      );
    } else {
      if (!isVisible) {
        nodeRequests.push(
          requestDelete(
            awxAPI`/workflow_job_template_nodes/${node.getId()}/`,
            abortController.signal
          )
        );
      }
    }
  });
  try {
    await Promise.all(nodeRequests);
    await Promise.all(approvalTemplateRequests);
    await Promise.all(disassociateNodes(originalNodes, deletedNodeIds, edges));
    await Promise.all(associateNodes(visualization, newNodeMap));
    pageNavigate(AwxRoute.WorkflowJobTemplateDetails, {
      params: { id: state.workflowTemplate.id.toString() },
    });
  } catch {
    // handle error here
  }
}

function associateNodes(
  visualization: Visualization,
  newNodeMap: {
    [nodeId: string]: {
      newNodeId: number;
      sources: { sourceId: string; nodeType: EdgeStatus }[] | [];
    };
  } = {}
) {
  const edges = visualization.getGraph().getEdges();

  if (!edges.length) return [];
  const newNodeArray = Object.values(newNodeMap);
  const newNodeRequests = newNodeArray.reduce(
    (
      _acc: Promise<WorkflowNode>[],
      curr: {
        newNodeId: number;
        sources: { sourceId: string; nodeType: EdgeStatus }[] | [];
      }
    ): Promise<WorkflowNode>[] => {
      return curr.sources.map((source) => {
        const sourceId = newNodeMap[source.sourceId]?.newNodeId ?? parseInt(source.sourceId, 10);
        return handleAssociateNewNodeRequests(curr.newNodeId, sourceId, source.nodeType);
      });
    },
    []
  );

  const existingNodeRequests: Promise<WorkflowNode>[] | Promise<unknown>[] = edges
    .filter((edge) => !edge.getTarget().getId().includes('unsavedNode'))
    .map((edge) => {
      const sourceId = edge.getSource().getId();
      const targetId = edge.getTarget().getId();
      const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
      return handleAssociateNewNodeRequests(
        parseInt(targetId, 10),
        parseInt(sourceId, 10),
        tagStatus
      );
    });
  return [...newNodeRequests, ...existingNodeRequests];
}

function handleAssociateNewNodeRequests(
  targetId: number,
  sourceId: number,
  tagStatus: EdgeStatus
): Promise<WorkflowNode> {
  let request: Promise<WorkflowNode> = Promise.resolve({} as WorkflowNode);
  if (tagStatus === EdgeStatus.success) {
    request = postRequest(
      awxAPI`/workflow_job_template_nodes/${sourceId.toString()}/success_nodes/`,
      {
        id: targetId,
      }
    );
  }

  if (tagStatus === EdgeStatus.danger) {
    request = postRequest(
      awxAPI`/workflow_job_template_nodes/${sourceId.toString()}/failure_nodes/`,
      {
        id: targetId,
      }
    );
  }

  if (tagStatus === EdgeStatus.info) {
    request = postRequest(
      awxAPI`/workflow_job_template_nodes/${sourceId.toString()}/always_nodes/`,
      {
        id: targetId,
      }
    );
  }
  return request;
}

function disassociateNodes(
  originalNodes: WorkflowNode[],
  deletedNodeIds: string[],
  edges: Edge<
    ElementModel,
    {
      tag: string;
      tagStatus: EdgeStatus;
    }
  >[] = []
) {
  const disassociateNodeRequests: Promise<WorkflowNode>[] = [];
  // Disassociate link that have been removed
  const removedEdges = edges.filter((edge) => !edge.isVisible());
  removedEdges.forEach((edge) => {
    const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
    const sourceId = edge.getSource().getId();
    const targetId = parseInt(edge.getTarget().getId(), 10);
    const targetNodeType =
      tagStatus === EdgeStatus.success
        ? 'success_nodes'
        : tagStatus === EdgeStatus.danger
          ? 'failure_nodes'
          : 'always_nodes';
    disassociateNodeRequests.push(
      postRequest(awxAPI`/workflow_job_template_nodes/${sourceId}/${targetNodeType}/`, {
        id: targetId,
        disassociate: true,
      })
    );
  });

  // Disassociate links that have been changed.
  originalNodes.forEach((node) => {
    node.success_nodes.forEach((successNodeId: number) => {
      edges.forEach(
        (
          edge: Edge<
            EdgeModel,
            {
              tag: string;
              tagStatus: EdgeStatus;
            }
          >
        ) => {
          const edgeData = edge.getData();
          const targetId = edge.getTarget().getId();

          if (
            !deletedNodeIds.includes(successNodeId.toString()) &&
            node.success_nodes.includes(parseInt(targetId, 10)) &&
            edgeData?.tagStatus !== EdgeStatus.success
          ) {
            disassociateNodeRequests.push(
              postRequest(
                awxAPI`/workflow_job_template_nodes/${node.id.toString()}/success_nodes/`,
                {
                  id: successNodeId,
                  disassociate: true,
                }
              )
            );
          }
        }
      );
    });
    node.failure_nodes.forEach((failureNodeId) => {
      edges.forEach(
        (
          edge: Edge<
            EdgeModel,
            {
              tag: string;
              tagStatus: EdgeStatus;
            }
          >
        ) => {
          const edgeData = edge.getData();
          const targetId = edge.getTarget().getId();
          if (
            !deletedNodeIds.includes(failureNodeId.toString()) &&
            node.failure_nodes.includes(parseInt(targetId, 10)) &&
            edgeData?.tagStatus !== EdgeStatus.danger
          ) {
            disassociateNodeRequests.push(
              postRequest(
                awxAPI`/workflow_job_template_nodes/${node.id.toString()}/failure_nodes/`,
                {
                  id: failureNodeId,
                  disassociate: true,
                }
              )
            );
          }
        }
      );
    });
    node.always_nodes.forEach((alwaysNodeId) => {
      edges.forEach(
        (
          edge: Edge<
            EdgeModel,
            {
              tag: string;
              tagStatus: EdgeStatus;
            }
          >
        ) => {
          const edgeData = edge.getData();
          const targetId = edge.getTarget().getId();
          if (
            !deletedNodeIds.includes(alwaysNodeId.toString()) &&
            node.always_nodes.includes(parseInt(targetId, 10)) &&
            edgeData?.tagStatus !== EdgeStatus.info
          ) {
            disassociateNodeRequests.push(
              postRequest(
                awxAPI`/workflow_job_template_nodes/${node.id.toString()}/always_nodes/`,
                {
                  id: alwaysNodeId,
                  disassociate: true,
                }
              )
            );
          }
        }
      );
    });
  });
  return disassociateNodeRequests;
}
