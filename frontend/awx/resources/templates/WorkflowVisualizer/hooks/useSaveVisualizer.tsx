import { useVisualizationController } from '@patternfly/react-topology';
import { usePageNavigate } from '../../../../../../framework';
import { useDeleteRequest } from '../../../../../common/crud/useDeleteRequest';
import { useAbortController } from '../../../../../common/crud/useAbortController';
import { awxAPI } from '../../../../common/api/awx-utils';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { usePostRequest } from '../../../../../common/crud/usePostRequest';
import { ControllerState, GraphNode, EdgeStatus, GraphNodeData } from '../types';
import { UnifiedJobType, WorkflowNode } from '../../../../interfaces/WorkflowNode';

interface WorkflowApprovalNode {
  name: string;
  description: string;
  timeout: number;
}

export function useSaveVisualizer() {
  const controller = useVisualizationController();
  const abortController = useAbortController();
  const pageNavigate = usePageNavigate();
  const deleteRequest = useDeleteRequest();
  const postWorkflowNode = usePostRequest<Partial<WorkflowNode>>();
  const postWorkflowNodeApproval = usePostRequest<WorkflowApprovalNode>();
  const postAssociateNode = usePostRequest<{ id: number }>();
  const postDisassociateNode = usePostRequest<{ id: number; disassociate: boolean }>();

  const graphNodes = controller.getGraph().getNodes() as GraphNode[];
  const state = controller.getState<ControllerState>();
  const deletedNodeIds: string[] = [];
  const deletedEdges = [];
  const associateSuccessNodes: { sourceId: string; targetId: string }[] = [];
  const associateFailureNodes: { sourceId: string; targetId: string }[] = [];
  const associateAlwaysNodes: { sourceId: string; targetId: string }[] = [];
  const disassociateSuccessNodes: { sourceId: string; targetId: string }[] = [];
  const disassociateFailureNodes: { sourceId: string; targetId: string }[] = [];
  const disassociateAlwaysNodes: { sourceId: string; targetId: string }[] = [];
  const newApprovalNodes: GraphNode[] = [];
  const newNodes: GraphNode[] = [];

  function setCreatedNodeId(node: GraphNode, newId: string) {
    const nodeData = node.getData() as GraphNodeData;
    node.setId(newId.toString());
    node.setData({
      ...nodeData,
      resource: {
        ...nodeData.resource,
        always_nodes: [],
        failure_nodes: [],
        success_nodes: [],
      },
    });
  }

  async function createApprovalNodes(approvalNodes: GraphNode[]) {
    const promises = approvalNodes.map(async (node) => {
      const nodeData = node.getData() as GraphNodeData;
      const newNode = await postWorkflowNode(
        awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
        {
          all_parents_must_converge: nodeData.all_parents_must_converge === 'all' ? true : false,
          identifier: nodeData.identifier,
        }
      );
      if (newNode.id) {
        await postWorkflowNodeApproval(
          awxAPI`/workflow_job_template_nodes/${newNode.id.toString()}/create_approval_template/`,
          {
            name: nodeData.resource.summary_fields.unified_job_template.name,
            description: nodeData.resource.summary_fields.unified_job_template.description || '',
            timeout: nodeData.resource.summary_fields.unified_job_template.timeout || 0,
          }
        );

        setCreatedNodeId(node, newNode.id.toString());
      }
    });
    await Promise.all(promises);
  }

  async function createNewNodes(newNodes: GraphNode[]) {
    const promises = newNodes.map(async (node) => {
      const nodeData = node.getData() as GraphNodeData;
      const newNode = await postWorkflowNode(
        awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
        {
          ...nodeData,
          all_parents_must_converge: nodeData.all_parents_must_converge === 'all' ? true : false,
          unified_job_template: nodeData.resource.summary_fields.unified_job_template.id,
        }
      );
      if (newNode.id) {
        setCreatedNodeId(node, newNode.id.toString());
      }
    });
    await Promise.all(promises);
  }

  function handleNodeDeletion(node: GraphNode) {
    deletedNodeIds.push(node.getId());
  }

  function handleNewNode(node: GraphNode) {
    const nodeData = node.getData() as GraphNodeData;
    if (
      nodeData.resource.summary_fields.unified_job_template.unified_job_type ===
      UnifiedJobType.workflow_approval
    ) {
      newApprovalNodes.push(node);
    } else {
      newNodes.push(node);
    }
  }

  function handleEdgeModification(node: GraphNode) {
    const nodeData = node.getData() as GraphNodeData;
    const {
      resource: { always_nodes = [], failure_nodes = [], success_nodes = [] },
    } = nodeData;

    success_nodes.forEach((successNodeId) => {
      node.getSourceEdges().forEach((edge) => {
        const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
        if (successNodeId.toString() === edge.getTarget().getId()) {
          if (tagStatus !== EdgeStatus.success) {
            disassociateSuccessNodes.push({
              sourceId: node.getId(),
              targetId: successNodeId.toString(),
            });
          }
        }
      });
    });
    failure_nodes.forEach((failureNodeId) => {
      node.getSourceEdges().forEach((edge) => {
        const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
        if (failureNodeId.toString() === edge.getTarget().getId()) {
          if (tagStatus !== EdgeStatus.danger) {
            disassociateFailureNodes.push({
              sourceId: node.getId(),
              targetId: failureNodeId.toString(),
            });
          }
        }
      });
    });
    always_nodes.forEach((alwaysNodeId) => {
      node.getSourceEdges().forEach((edge) => {
        const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
        if (alwaysNodeId.toString() === edge.getTarget().getId()) {
          if (tagStatus !== EdgeStatus.info) {
            disassociateAlwaysNodes.push({
              sourceId: node.getId(),
              targetId: alwaysNodeId.toString(),
            });
          }
        }
      });
    });

    node.getSourceEdges().forEach((edge) => {
      if (!edge.isVisible()) {
        deletedEdges.push(edge);
      } else {
        const targetId = edge.getTarget().getId();
        const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };

        switch (tagStatus) {
          case EdgeStatus.success:
            if (!success_nodes?.includes(parseInt(targetId, 10))) {
              associateSuccessNodes.push({ sourceId: node.getId(), targetId });
            }
            break;
          case EdgeStatus.danger:
            if (!failure_nodes?.includes(parseInt(targetId, 10))) {
              associateFailureNodes.push({ sourceId: node.getId(), targetId });
            }
            break;
          case EdgeStatus.info:
            if (!always_nodes?.includes(parseInt(targetId, 10))) {
              associateAlwaysNodes.push({ sourceId: node.getId(), targetId });
            }
            break;
          default:
            break;
        }
      }
    });
  }

  async function handleSave() {
    graphNodes.forEach((node) => {
      const isNewNode = node.getId().includes('unsavedNode');
      const isDeleted = !node.isVisible();

      if (isDeleted) {
        handleNodeDeletion(node);
      }

      if (isNewNode) {
        handleNewNode(node);
      }
    });

    try {
      await createApprovalNodes(newApprovalNodes);
      await createNewNodes(newNodes);
    } catch {
      //TODO: handle error here
    }

    graphNodes.forEach((node) => {
      const nodeState = node.getState<{ modified: boolean }>();
      const isDeleted = !node.isVisible();
      const isEdited = !isDeleted && Boolean(nodeState?.modified);

      if (isEdited) {
        handleEdgeModification(node);
      }
    });

    try {
      await Promise.all(
        deletedNodeIds.map((id) =>
          deleteRequest(awxAPI`/workflow_job_template_nodes/${id}/`, abortController.signal)
        )
      );

      await Promise.all(
        disassociateSuccessNodes.map((node) =>
          postDisassociateNode(
            awxAPI`/workflow_job_template_nodes/${node.sourceId}/success_nodes/`,
            {
              id: Number(node.targetId),
              disassociate: true,
            },
            abortController.signal
          )
        )
      );
      await Promise.all(
        disassociateFailureNodes.map((node) =>
          postDisassociateNode(
            awxAPI`/workflow_job_template_nodes/${node.sourceId}/failure_nodes/`,
            {
              id: Number(node.targetId),
              disassociate: true,
            },
            abortController.signal
          )
        )
      );
      await Promise.all(
        disassociateAlwaysNodes.map((node) =>
          postDisassociateNode(
            awxAPI`/workflow_job_template_nodes/${node.sourceId}/always_nodes/`,
            {
              id: Number(node.targetId),
              disassociate: true,
            },
            abortController.signal
          )
        )
      );
      await Promise.all(
        associateSuccessNodes.map((node) =>
          postAssociateNode(
            awxAPI`/workflow_job_template_nodes/${node.sourceId}/success_nodes/`,
            {
              id: Number(node.targetId),
            },
            abortController.signal
          )
        )
      );
      await Promise.all(
        associateFailureNodes.map((node) =>
          postAssociateNode(
            awxAPI`/workflow_job_template_nodes/${node.sourceId}/failure_nodes/`,
            {
              id: Number(node.targetId),
            },
            abortController.signal
          )
        )
      );
      await Promise.all(
        associateAlwaysNodes.map((node) =>
          postAssociateNode(
            awxAPI`/workflow_job_template_nodes/${node.sourceId}/always_nodes/`,
            {
              id: Number(node.targetId),
            },
            abortController.signal
          )
        )
      );

      pageNavigate(AwxRoute.WorkflowJobTemplateDetails, {
        params: { id: state.workflowTemplate.id.toString() },
      });
    } catch {
      // handle error here
    }
  }
  return handleSave;
}
