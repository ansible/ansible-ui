import { action, useVisualizationController } from '@patternfly/react-topology';
import { useDeleteRequest } from '../../../../../common/crud/useDeleteRequest';
import { useAbortController } from '../../../../../common/crud/useAbortController';
import { awxAPI } from '../../../../common/api/awx-utils';
import { usePostRequest } from '../../../../../common/crud/usePostRequest';
import { usePatchRequest } from '../../../../../common/crud/usePatchRequest';
import { ControllerState, GraphNode, EdgeStatus, GraphNodeData } from '../types';
import { UnifiedJobType, WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { START_NODE_ID } from '../constants';
import { parseVariableField } from '../../../../../../framework/utils/codeEditorUtils';
import { InstanceGroup } from '../../../../interfaces/InstanceGroup';

interface WorkflowApprovalNode {
  name: string;
  description: string;
  timeout: number;
}

interface CreateWorkflowNodePayload {
  extra_data?: object;
  inventory?: number;
  scm_branch?: string;
  job_type?: string;
  job_tags?: string;
  skip_tags?: string;
  limit?: string;
  diff_mode?: boolean;
  verbosity?: number;
  execution_environment?: number | null;
  forks?: number;
  job_slice_count?: number;
  timeout?: number;
  unified_job_template: number;
  all_parents_must_converge: boolean;
  identifier?: string;
}
type CreatePayloadProperty = keyof CreateWorkflowNodePayload;

export function useSaveVisualizer() {
  const controller = useVisualizationController();
  const abortController = useAbortController();
  const deleteRequest = useDeleteRequest();
  const postWorkflowNode = usePostRequest<Partial<CreateWorkflowNodePayload>, WorkflowNode>();
  const patchWorkflowNode = usePatchRequest<Partial<CreateWorkflowNodePayload>, WorkflowNode>();
  const postWorkflowNodeApproval = usePostRequest<WorkflowApprovalNode, WorkflowApprovalNode>();
  const patchWorkflowNodeApproval = usePatchRequest<WorkflowApprovalNode, WorkflowApprovalNode>();
  const postAssociateNode = usePostRequest<{ id: number }>();
  const postDisassociateNode = usePostRequest<{ id: number; disassociate: boolean }>();
  const postAssociateLabel = usePostRequest<{ name: string; organization: number }>();
  const postAssociateInstanceGroup = usePostRequest<{ id: number }, InstanceGroup>();
  const postAssociateCredential = usePostRequest<{ id: number }, Credential>();

  const graphNodes = controller
    .getGraph()
    .getNodes()
    .filter((node) => node.getId() !== START_NODE_ID) as GraphNode[];
  const state = controller.getState<ControllerState>();
  const deletedNodeIds: string[] = [];
  const associateSuccessNodes: { sourceId: string; targetId: string }[] = [];
  const associateFailureNodes: { sourceId: string; targetId: string }[] = [];
  const associateAlwaysNodes: { sourceId: string; targetId: string }[] = [];
  const disassociateSuccessNodes: { sourceId: string; targetId: string }[] = [];
  const disassociateFailureNodes: { sourceId: string; targetId: string }[] = [];
  const disassociateAlwaysNodes: { sourceId: string; targetId: string }[] = [];
  const newApprovalNodes: GraphNode[] = [];
  const editedApprovalNodes: GraphNode[] = [];
  const newNodes: GraphNode[] = [];
  const editedNodes: GraphNode[] = [];

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
      const nodeIdentifier = toKeyedObject('identifier', nodeData.resource.identifier);

      const workflowNode = await postWorkflowNode(
        awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
        {
          all_parents_must_converge: nodeData.resource.all_parents_must_converge,
          ...nodeIdentifier,
        }
      );
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

  async function updateApprovalNodes(approvalNodes: GraphNode[]) {
    const promises = approvalNodes.map(async (node) => {
      const nodeData = node.getData() as GraphNodeData;
      const nodeIdentifier = toKeyedObject('identifier', nodeData.resource.identifier);
      const approvalNodeId = nodeData.resource.summary_fields.unified_job_template.id;

      const workflowNode = await patchWorkflowNode(
        awxAPI`/workflow_job_template_nodes/${node.getId()}/`,
        {
          all_parents_must_converge: nodeData.resource.all_parents_must_converge,
          ...nodeIdentifier,
        }
      );
      if (workflowNode && workflowNode.id) {
        await patchWorkflowNodeApproval(
          awxAPI`/workflow_approval_templates/${approvalNodeId.toString()}/`,
          {
            name: nodeData.resource.summary_fields.unified_job_template.name,
            description: nodeData.resource.summary_fields.unified_job_template.description || '',
            timeout: nodeData.resource.summary_fields.unified_job_template.timeout || 0,
          }
        );
      }
    });
    await Promise.all(promises);
  }

  async function createNewNodes(newNodes: GraphNode[]) {
    const promises = newNodes.map(async (node) => {
      const createNodePayload: Partial<CreateWorkflowNodePayload> = {};
      const setValue = <K extends CreatePayloadProperty>(
        key: K,
        value: CreateWorkflowNodePayload[K]
      ) => {
        if (typeof value !== 'undefined' && value !== null && value !== '') {
          createNodePayload[key] = value;
        }
      };

      const nodeData = node.getData() as GraphNodeData;
      const { launch_data, resource } = nodeData;
      const { unified_job_template } = resource.summary_fields;
      const { unified_job_type } = unified_job_template;

      setValue('all_parents_must_converge', resource.all_parents_must_converge);
      setValue('identifier', resource?.identifier);
      setValue('unified_job_template', unified_job_template.id);

      // Prompt values
      setValue('diff_mode', launch_data?.diff_mode);
      setValue('execution_environment', launch_data?.execution_environment?.id);
      setValue('forks', launch_data?.forks);
      setValue('inventory', launch_data?.inventory?.id);
      setValue('job_slice_count', launch_data?.job_slice_count);
      setValue('job_tags', launch_data?.job_tags?.map((tag) => tag.name).join(','));
      setValue('job_type', launch_data?.job_type);
      setValue('limit', launch_data?.limit);
      setValue('scm_branch', launch_data?.scm_branch);
      setValue('skip_tags', launch_data?.job_tags?.map((tag) => tag.name).join(','));
      setValue('timeout', launch_data?.timeout);
      setValue('verbosity', launch_data?.verbosity);

      if (unified_job_type === UnifiedJobType.system_job && resource.extra_data?.days) {
        setValue('extra_data', { days: resource.extra_data.days });
      } else if (launch_data?.extra_vars) {
        setValue('extra_data', parseVariableField(launch_data?.extra_vars));
      }

      const newNode = await postWorkflowNode(
        awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
        createNodePayload
      );

      if (!newNode.id) return;

      if (launch_data?.labels) {
        await Promise.all(
          launch_data?.labels.map(async (label) => {
            await postAssociateLabel(
              awxAPI`/workflow_job_template_nodes/${newNode.id.toString()}/labels/`,
              {
                name: label.name,
                organization: launch_data.organization,
              }
            );
          })
        );
      }
      if (launch_data?.instance_groups) {
        await Promise.all(
          launch_data?.instance_groups.map(async (group) => {
            await postAssociateInstanceGroup(
              awxAPI`/workflow_job_template_nodes/${newNode.id.toString()}/instance_groups/`,
              {
                id: group.id,
              }
            );
          })
        );
      }
      if (launch_data?.credentials) {
        await Promise.all(
          launch_data?.credentials.map(async (credential) => {
            await postAssociateCredential(
              awxAPI`/workflow_job_template_nodes/${newNode.id.toString()}/credentials/`,
              {
                id: credential.id,
              }
            );
          })
        );
      }

      if (newNode.id) {
        setCreatedNodeId(node, newNode.id.toString());
      }
    });
    await Promise.all(promises);
  }

  async function updateExistingNodes(editedNodes: GraphNode[]) {
    const promises = editedNodes.map(async (node) => {
      const nodeData = node.getData() as GraphNodeData;
      const nodeIdentifier = toKeyedObject('identifier', nodeData.resource.identifier);
      const extra_data =
        nodeData.resource.summary_fields.unified_job_template.unified_job_type ===
          UnifiedJobType.system_job && nodeData.resource.extra_data?.days
          ? { extra_data: { days: nodeData.resource.extra_data.days } }
          : {};

      await patchWorkflowNode(awxAPI`/workflow_job_template_nodes/${node.getId()}/`, {
        ...nodeData,
        ...extra_data,
        ...nodeIdentifier,
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
      editedApprovalNodes.push(node);
    } else {
      editedNodes.push(node);
    }
  }

  function handleEdgeModification(node: GraphNode) {
    const nodeData = node.getData() as GraphNodeData;
    const sourceEdges = node.getSourceEdges();
    const {
      resource: { always_nodes = [], failure_nodes = [], success_nodes = [] },
    } = nodeData;

    success_nodes.forEach((successNodeId) => {
      sourceEdges.forEach((edge) => {
        const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
        if (successNodeId.toString() === edge.getTarget().getId()) {
          if (tagStatus !== EdgeStatus.success || !edge.isVisible()) {
            disassociateSuccessNodes.push({
              sourceId: node.getId(),
              targetId: successNodeId.toString(),
            });
          }
        }
      });
    });
    failure_nodes.forEach((failureNodeId) => {
      sourceEdges.forEach((edge) => {
        const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
        if (failureNodeId.toString() === edge.getTarget().getId()) {
          if (tagStatus !== EdgeStatus.danger || !edge.isVisible()) {
            disassociateFailureNodes.push({
              sourceId: node.getId(),
              targetId: failureNodeId.toString(),
            });
          }
        }
      });
    });
    always_nodes.forEach((alwaysNodeId) => {
      sourceEdges.forEach((edge) => {
        const { tagStatus } = edge.getData() as { tagStatus: EdgeStatus };
        if (alwaysNodeId.toString() === edge.getTarget().getId()) {
          if (tagStatus !== EdgeStatus.info || !edge.isVisible()) {
            disassociateAlwaysNodes.push({
              sourceId: node.getId(),
              targetId: alwaysNodeId.toString(),
            });
          }
        }
      });
    });

    sourceEdges.forEach((edge) => {
      if (!edge.isVisible()) return;

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
    });
  }

  async function handleSave() {
    graphNodes.forEach((node) => {
      const nodeId = node.getId();
      const nodeState = node.getState<{ modified: boolean }>();
      const isDeleted = !node.isVisible();
      const isNewNode = nodeId.includes('unsavedNode');
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

    await createApprovalNodes(newApprovalNodes);
    await createNewNodes(newNodes);
    await updateApprovalNodes(editedApprovalNodes);
    await updateExistingNodes(editedNodes);
    graphNodes.forEach((node) => {
      const nodeState = node.getState<{ modified: boolean }>();
      const isDeleted = !node.isVisible();
      const isEdited = Boolean(nodeState?.modified) && !isDeleted;

      if (isEdited) {
        handleEdgeModification(node);
      }
    });

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
    action(() => {
      controller.setState({ ...state, modified: false });
      controller
        .getElements()
        .forEach((element) => element.setState({ ...element.getState(), modified: false }));
    })();
  }
  return handleSave;
}

export function toKeyedObject(
  key: string,
  value: string | number | undefined | null
): { [key: string]: string | number } | object {
  if ((typeof value === 'string' && value !== '') || typeof value === 'number') {
    return { [key]: value };
  } else {
    return {};
  }
}
