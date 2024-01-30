import { useVisualizationController } from '@patternfly/react-topology';
import { usePageNavigate } from '../../../../../../framework';
import { useDeleteRequest } from '../../../../../common/crud/useDeleteRequest';
import { useAbortController } from '../../../../../common/crud/useAbortController';
import { awxAPI } from '../../../../common/api/awx-utils';
import { AwxRoute } from '../../../../main/AwxRoutes';
import { usePostRequest } from '../../../../../common/crud/usePostRequest';
import { usePatchRequest } from '../../../../../common/crud/usePatchRequest';
import { ControllerState, GraphNode, EdgeStatus, GraphNodeData } from '../types';
import { UnifiedJobType, WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { stringIsUUID } from '../../../../common/util/strings';

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
  const postWorkflowNode = usePostRequest<Partial<WorkflowNode>, WorkflowNode>();
  const patchWorkflowNode = usePatchRequest<Partial<WorkflowNode>, WorkflowNode>();
  const postWorkflowNodeApproval = usePostRequest<WorkflowApprovalNode, WorkflowApprovalNode>();
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
  const editNodes: GraphNode[] = [];

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
      const isNewNode = node.getId().includes('unsavedNode');
      let workflowNode;

      if (isNewNode) {
        workflowNode = await postWorkflowNode(
          awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
          {
            all_parents_must_converge: nodeData.resource.all_parents_must_converge,
            identifier: nodeData.resource.identifier,
          }
        );
      } else {
        workflowNode = await patchWorkflowNode(
          awxAPI`/workflow_job_template_nodes/${node.getId()}/`,
          {
            all_parents_must_converge: nodeData.resource.all_parents_must_converge,
            identifier: nodeData.resource.identifier,
          }
        );
      }
      if (workflowNode && workflowNode.id) {
        await postWorkflowNodeApproval(
          awxAPI`/workflow_job_template_nodes/${workflowNode.id.toString()}/create_approval_template/`,
          {
            name: nodeData.resource.summary_fields.unified_job_template.name,
            description: nodeData.resource.summary_fields.unified_job_template.description || '',
            timeout: nodeData.resource.summary_fields.unified_job_template.timeout || 0,
          }
        );
        setCreatedNodeId(node, workflowNode.id.toString());
      }
    });
    await Promise.all(promises);
  }

  async function createNewNodes(newNodes: GraphNode[]) {
    const promises = newNodes.map(async (node) => {
      const nodeData = node.getData() as GraphNodeData;

      const extra_data =
        nodeData.resource.summary_fields.unified_job_template.unified_job_type ===
          UnifiedJobType.system_job && nodeData.resource.extra_data?.days
          ? { extra_data: { days: nodeData.resource.extra_data.days } }
          : {};

      const identifier = !stringIsUUID(nodeData.resource?.identifier)
        ? { identifier: nodeData.resource.identifier }
        : {};

      const newNode = await postWorkflowNode(
        awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
        {
          ...nodeData,
          ...extra_data,
          ...identifier,
          all_parents_must_converge: nodeData.resource.all_parents_must_converge,
          unified_job_template: nodeData.resource.summary_fields.unified_job_template.id,
        }
      );

      if (newNode.id) {
        setCreatedNodeId(node, newNode.id.toString());
      }
    });
    await Promise.all(promises);
  }

  async function editExistingNodes(editNodes: GraphNode[]) {
    const promises = editNodes.map(async (node) => {
      const nodeData = node.getData() as GraphNodeData;

      const extra_data =
        nodeData.resource.summary_fields.unified_job_template.unified_job_type ===
          UnifiedJobType.system_job && nodeData.resource.extra_data?.days
          ? { extra_data: { days: nodeData.resource.extra_data.days } }
          : {};

      const identifier = !stringIsUUID(nodeData.resource?.identifier)
        ? { identifier: nodeData.resource.identifier }
        : {};

      await patchWorkflowNode(awxAPI`/workflow_job_template_nodes/${node.getId()}/`, {
        ...nodeData,
        ...extra_data,
        ...identifier,
        all_parents_must_converge: nodeData.resource.all_parents_must_converge,
        unified_job_template: nodeData.resource.summary_fields.unified_job_template.id,
      });
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

  function handleEditNode(node: GraphNode) {
    const nodeData = node.getData() as GraphNodeData;
    if (
      nodeData.resource.summary_fields.unified_job_template.unified_job_type ===
      UnifiedJobType.workflow_approval
    ) {
      newApprovalNodes.push(node);
    } else {
      editNodes.push(node);
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
      const nodeState = node.getState<{ modified: boolean }>();
      const isDeleted = !node.isVisible();
      const isNewNode = node.getId().includes('unsavedNode');
      const isEdited = Boolean(nodeState?.modified) && !isDeleted && !isNewNode;

      if (isDeleted && !isNewNode) {
        handleNodeDeletion(node);
      }
      if (isNewNode && !isDeleted) {
        handleNewNode(node);
      }
      if (isEdited) {
        handleEditNode(node);
      }
    });

    try {
      await createApprovalNodes(newApprovalNodes);
      await createNewNodes(newNodes);
      await editExistingNodes(editNodes);
    } catch {
      //TODO: handle error here
    }

    graphNodes.forEach((node) => {
      const nodeState = node.getState<{ modified: boolean }>();
      const isDeleted = !node.isVisible();
      const isEdited = Boolean(nodeState?.modified) && !isDeleted;

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
