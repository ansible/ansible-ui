import { parseVariableField } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useDeleteRequest } from '@ansible/common-ui/crud/useDeleteRequest';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { action, useVisualizationController } from '@patternfly/react-topology';
import { useCallback } from 'react';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { awxAPI } from '../../../../common/api/awx-utils';
import { useAwxGetAllPages } from '../../../../common/useAwxGetAllPages';
import { getAddedAndRemoved } from '../../../../common/util/getAddedAndRemoved';
import { clearStaleNodeFields } from './clearStaleNodeFields';
import { getAddedAndRemovedCredentials } from './getAddedAndRemovedCredentials';
import { InstanceGroup } from '../../../../interfaces/InstanceGroup';
import { Label } from '../../../../interfaces/Label';
import { Organization } from '../../../../interfaces/Organization';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { RESOURCE_TYPE, START_NODE_ID } from '../constants';
import { ControllerState, EdgeStatus, GraphNode, GraphNodeData } from '../types';

interface WorkflowApprovalNode {
  name: string;
  description: string;
  timeout: number;
}

interface CreateWorkflowNodePayload {
  extra_data?: object;
  inventory?: number | null;
  scm_branch?: string | null;
  job_type?: string | null;
  job_tags?: string | null;
  skip_tags?: string | null;
  limit?: string | null;
  diff_mode?: boolean | null;
  verbosity?: number | null;
  execution_environment?: number | null;
  forks?: number | null;
  job_slice_count?: number | null;
  timeout?: number | null;
  unified_job_template: number;
  all_parents_must_converge: boolean;
  identifier?: string;
}
type CreatePayloadProperty = keyof CreateWorkflowNodePayload;

export function useSaveVisualizer(templateId: string) {
  const controller = useVisualizationController();
  const deleteRequest = useDeleteRequest();
  const patchWorkflowNode = usePatchRequest<Partial<CreateWorkflowNodePayload>, WorkflowNode>();
  const patchWorkflowNodeApproval = usePatchRequest<WorkflowApprovalNode, WorkflowApprovalNode>();
  const postAssociateNode = usePostRequest<{ id: number }>();
  const postDisassociate = usePostRequest<{ id: number; disassociate: boolean }>();
  const postWorkflowNode = usePostRequest<Partial<CreateWorkflowNodePayload>, WorkflowNode>();
  const postWorkflowNodeApproval = usePostRequest<WorkflowApprovalNode, WorkflowApprovalNode>();
  const processCredentials = useProcessCredentials();
  const processInstanceGroups = useProcessInstanceGroups();
  const processLabels = useProcessLabels();

  const { refresh: workflowNodeRefresh } = useAwxGetAllPages<WorkflowNode>(
    awxAPI`/workflow_job_templates/${templateId ?? ''}/workflow_nodes/`
  );

  return useCallback(async () => {
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
      action(() => {
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
      })();
    }

    async function createApprovalNodes(approvalNodes: GraphNode[]) {
      const promises = approvalNodes.map(async (node) => {
        const nodeData = node.getData() as GraphNodeData;
        const nodeTemplate = node.getData()?.resource?.summary_fields?.unified_job_template;
        const nodeIdentifier = toKeyedObject('identifier', nodeData.resource.identifier);

        if (!nodeTemplate) return;

        const workflowNode = await postWorkflowNode(
          awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
          {
            all_parents_must_converge: nodeData.resource.all_parents_must_converge,
            ...nodeIdentifier,
          }
        );

        if (workflowNode?.id) {
          await postWorkflowNodeApproval(
            awxAPI`/workflow_job_template_nodes/${workflowNode.id.toString()}/create_approval_template/`,
            {
              name: nodeTemplate.name,
              description: nodeTemplate.description || '',
              timeout: nodeTemplate.timeout || 0,
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
        const nodeTemplate = node.getData()?.resource?.summary_fields?.unified_job_template;
        const nodeIdentifier = toKeyedObject('identifier', nodeData.resource.identifier);

        if (!nodeTemplate) return;

        const workflowNode = await patchWorkflowNode(
          awxAPI`/workflow_job_template_nodes/${node.getId()}/`,
          {
            all_parents_must_converge: nodeData.resource.all_parents_must_converge,
            ...nodeIdentifier,
          }
        );

        if (workflowNode?.id) {
          // wf approval node doesn't exist, create it
          if (nodeTemplate.id === -1) {
            await postWorkflowNodeApproval(
              awxAPI`/workflow_job_template_nodes/${workflowNode.id.toString()}/create_approval_template/`,
              {
                name: nodeTemplate.name,
                description: nodeTemplate.description || '',
                timeout: nodeTemplate.timeout || 0,
              }
            );
            setCreatedNodeId(node, workflowNode.id.toString());
          } else {
            await patchWorkflowNodeApproval(
              awxAPI`/workflow_approval_templates/${nodeTemplate.id.toString()}/`,
              {
                name: nodeTemplate.name,
                description: nodeTemplate.description || '',
                timeout: nodeTemplate.timeout || 0,
              }
            );
          }
        }
      });
      await Promise.all(promises);
    }

    async function createNewNodes(newNodes: GraphNode[]) {
      const promises = newNodes.map(async (node) => {
        const createNodePayload: Partial<CreateWorkflowNodePayload> = {};
        const setValue = <K extends CreatePayloadProperty>(
          key: K,
          value: CreateWorkflowNodePayload[K],
          isPrompt: boolean = false
        ) => {
          if (isPrompt) {
            const prompts = launch_data?.original?.launch_config;
            const promptMapper = {
              diff_mode: prompts?.ask_diff_mode_on_launch,
              extra_data: prompts?.ask_variables_on_launch,
              execution_environment: prompts?.ask_execution_environment_on_launch,
              forks: prompts?.ask_forks_on_launch,
              inventory: prompts?.ask_inventory_on_launch,
              job_slice_count: prompts?.ask_job_slice_count_on_launch,
              job_type: prompts?.ask_job_type_on_launch,
              limit: prompts?.ask_limit_on_launch,
              scm_branch: prompts?.ask_scm_branch_on_launch,
              skip_tags: prompts?.ask_skip_tags_on_launch,
              job_tags: prompts?.ask_tags_on_launch,
              timeout: prompts?.ask_timeout_on_launch,
              verbosity: prompts?.ask_verbosity_on_launch,
            } as Record<K, boolean | undefined>;

            if (!promptMapper[key]) {
              return;
            }
          }

          if (typeof value === 'undefined' || value === null || value === '') {
            return;
          }

          createNodePayload[key] = value;
        };
        const nodeData = node.getData() as GraphNodeData;
        const { launch_data, resource, survey_data } = nodeData;
        const { unified_job_template } = resource.summary_fields;

        if (!unified_job_template) return;

        setValue('all_parents_must_converge', resource.all_parents_must_converge);
        setValue('identifier', resource?.identifier);
        setValue('unified_job_template', unified_job_template.id);

        // Prompt values
        setValue('diff_mode', launch_data?.diff_mode, true);
        setValue('execution_environment', launch_data?.execution_environment?.id, true);
        setValue('forks', launch_data?.forks, true);
        setValue('inventory', launch_data?.inventory?.id, true);
        setValue('job_slice_count', launch_data?.job_slice_count, true);
        setValue('job_tags', launch_data?.job_tags?.map((tag) => tag.name).join(','), true);
        setValue('job_type', launch_data?.job_type, true);
        setValue('limit', launch_data?.limit, true);
        setValue('scm_branch', launch_data?.scm_branch, true);
        setValue('skip_tags', launch_data?.skip_tags?.map((tag) => tag.name).join(','), true);
        setValue('timeout', launch_data?.timeout, true);
        setValue('verbosity', launch_data?.verbosity, true);

        if (
          unified_job_template.unified_job_type === RESOURCE_TYPE.system_job &&
          resource.extra_data?.days
        ) {
          setValue('extra_data', { days: resource.extra_data.days });
        } else if (launch_data?.extra_vars) {
          setValue('extra_data', parseVariableField(launch_data?.extra_vars), true);
        }
        if (survey_data) {
          setValue('extra_data', {
            ...parseVariableField(launch_data?.extra_vars ?? '---'),
            ...survey_data,
          });
        }

        const newNode = await postWorkflowNode(
          awxAPI`/workflow_job_templates/${state.workflowTemplate.id.toString()}/workflow_nodes/`,
          createNodePayload
        );

        if (!newNode.id) return;
        const newNodeId = newNode.id.toString();
        // For new nodes the node already exists on the correct template, so
        // only associations are needed (nothing to disassociate on a brand new node).
        await processLabels(newNodeId, launch_data, 'associate');
        await processInstanceGroups(newNodeId, launch_data, 'associate');
        await processCredentials(newNodeId, launch_data, 'associate');
        setCreatedNodeId(node, newNodeId.toString());
      });
      await Promise.all(promises);
    }

    async function updateExistingNodes(editedNodes: GraphNode[]) {
      const results = await Promise.allSettled(
        editedNodes.map(async (node) => {
          const updatedNodePayload: Partial<CreateWorkflowNodePayload> = {};
          const nodeData = node.getData() as GraphNodeData;
          const nodeId = node.getId();
          const { launch_data, survey_data, resource } = nodeData;
          const { unified_job_template } = resource.summary_fields;

          if (!unified_job_template) return;

          const setValue = <K extends CreatePayloadProperty>(
            key: K,
            value: CreateWorkflowNodePayload[K],
            isPrompt: boolean = false
          ) => {
            if (isPrompt) {
              const prompts = launch_data?.original?.launch_config;
              const promptMapper = {
                diff_mode: prompts?.ask_diff_mode_on_launch,
                execution_environment: prompts?.ask_execution_environment_on_launch,
                forks: prompts?.ask_forks_on_launch,
                inventory: prompts?.ask_inventory_on_launch,
                job_slice_count: prompts?.ask_job_slice_count_on_launch,
                job_type: prompts?.ask_job_type_on_launch,
                limit: prompts?.ask_limit_on_launch,
                scm_branch: prompts?.ask_scm_branch_on_launch,
                skip_tags: prompts?.ask_skip_tags_on_launch,
                job_tags: prompts?.ask_tags_on_launch,
                timeout: prompts?.ask_timeout_on_launch,
                verbosity: prompts?.ask_verbosity_on_launch,
                extra_data: prompts?.ask_variables_on_launch,
              } as Record<K, boolean | undefined>;

              if (!promptMapper[key]) {
                return;
              }
            }

            if (typeof value === 'undefined' || value === null || value === '') {
              return;
            }

            updatedNodePayload[key] = value;
          };

          setValue('all_parents_must_converge', resource.all_parents_must_converge);
          setValue('identifier', resource.identifier);
          setValue('unified_job_template', unified_job_template.id);

          // Prompt values
          setValue('diff_mode', launch_data?.diff_mode, true);
          setValue('execution_environment', launch_data?.execution_environment?.id, true);
          setValue('forks', launch_data?.forks, true);
          setValue('inventory', launch_data?.inventory?.id, true);
          setValue('job_slice_count', launch_data?.job_slice_count, true);
          setValue('job_tags', launch_data?.job_tags?.map((tag) => tag.name).join(','), true);
          setValue('job_type', launch_data?.job_type, true);
          setValue('limit', launch_data?.limit, true);
          setValue('scm_branch', launch_data?.scm_branch, true);
          setValue('skip_tags', launch_data?.skip_tags?.map((tag) => tag.name).join(','), true);
          setValue('timeout', launch_data?.timeout, true);
          setValue('verbosity', launch_data?.verbosity, true);

          if (
            unified_job_template.unified_job_type === RESOURCE_TYPE.system_job &&
            resource.extra_data?.days
          ) {
            setValue('extra_data', { days: resource.extra_data.days });
          } else if (launch_data?.extra_vars) {
            setValue('extra_data', parseVariableField(launch_data?.extra_vars), true);
          }
          if (survey_data) {
            setValue('extra_data', {
              ...parseVariableField(launch_data?.extra_vars ?? '---'),
              ...survey_data,
            });
          }

          if (launch_data?.original?.isTemplateChange) {
            clearStaleNodeFields(updatedNodePayload as Record<string, unknown>);
          }

          // Disassociate stale resources BEFORE patching the template. AWX validates the
          // node's full DB state when unified_job_template changes, so credentials/labels/
          // instance_groups must be removed first when the new template does not accept them.
          await processLabels(nodeId, launch_data, 'disassociate');
          await processInstanceGroups(nodeId, launch_data, 'disassociate');
          await processCredentials(nodeId, launch_data, 'disassociate');

          await patchWorkflowNode(
            awxAPI`/workflow_job_template_nodes/${nodeId}/`,
            updatedNodePayload
          );

          // Associate new resources AFTER patching the template. The new template must be
          // in place before AWX will accept associations (e.g. ask_credential_on_launch=true).
          await processLabels(nodeId, launch_data, 'associate');
          await processInstanceGroups(nodeId, launch_data, 'associate');
          await processCredentials(nodeId, launch_data, 'associate');
        })
      );

      // Check for any failures and throw an error with details
      const failures = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      );
      if (failures.length > 0) {
        // Throw the first error to propagate it to the UI
        throw failures[0].reason;
      }
    }

    function handleNodeDeletion(node: GraphNode) {
      deletedNodeIds.push(node.getId());
    }

    function handleNewNode(node: GraphNode) {
      const nodeData = node.getData() as GraphNodeData;

      if (
        nodeData.resource.summary_fields?.unified_job_template?.unified_job_type ===
        RESOURCE_TYPE.workflow_approval
      ) {
        newApprovalNodes.push(node);
      } else {
        newNodes.push(node);
      }
    }

    function handleEditNode(node: GraphNode) {
      const nodeData = node.getData() as GraphNodeData;
      if (
        nodeData.resource.summary_fields?.unified_job_template?.unified_job_type ===
        RESOURCE_TYPE.workflow_approval
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

      if (success_nodes.length > 0) {
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
      }
      if (failure_nodes.length > 0) {
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
      }

      if (always_nodes.length > 0) {
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
      }

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
      if (isEdited && !isDeleted) {
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
      disassociateSuccessNodes.map((node) =>
        postDisassociate(awxAPI`/workflow_job_template_nodes/${node.sourceId}/success_nodes/`, {
          id: Number(node.targetId),
          disassociate: true,
        })
      )
    );
    await Promise.all(
      disassociateFailureNodes.map((node) =>
        postDisassociate(awxAPI`/workflow_job_template_nodes/${node.sourceId}/failure_nodes/`, {
          id: Number(node.targetId),
          disassociate: true,
        })
      )
    );
    await Promise.all(
      disassociateAlwaysNodes.map((node) =>
        postDisassociate(awxAPI`/workflow_job_template_nodes/${node.sourceId}/always_nodes/`, {
          id: Number(node.targetId),
          disassociate: true,
        })
      )
    );
    await Promise.all(
      associateSuccessNodes.map((node) =>
        postAssociateNode(awxAPI`/workflow_job_template_nodes/${node.sourceId}/success_nodes/`, {
          id: Number(node.targetId),
        })
      )
    );
    await Promise.all(
      associateFailureNodes.map((node) =>
        postAssociateNode(awxAPI`/workflow_job_template_nodes/${node.sourceId}/failure_nodes/`, {
          id: Number(node.targetId),
        })
      )
    );
    await Promise.all(
      associateAlwaysNodes.map((node) =>
        postAssociateNode(awxAPI`/workflow_job_template_nodes/${node.sourceId}/always_nodes/`, {
          id: Number(node.targetId),
        })
      )
    );
    await Promise.all(
      deletedNodeIds.map((id) => deleteRequest(awxAPI`/workflow_job_template_nodes/${id}/`))
    );

    action(() => {
      workflowNodeRefresh();
      controller.setState({ ...state, modified: false });
      controller
        .getElements()
        .forEach((element) => element.setState({ ...element.getState(), modified: false }));
    })();
  }, [
    controller,
    deleteRequest,
    patchWorkflowNode,
    patchWorkflowNodeApproval,
    postAssociateNode,
    postDisassociate,
    postWorkflowNode,
    postWorkflowNodeApproval,
    processCredentials,
    processInstanceGroups,
    processLabels,
    workflowNodeRefresh,
  ]);
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

async function getDefaultOrganization(): Promise<number> {
  const itemsResponse = await requestGet<AwxItemsResponse<Organization>>(awxAPI`/organizations/`);
  return itemsResponse.results[0].id || 1;
}

// Controls which half of a process function runs relative to the node PATCH.
// Removals (disassociate) must happen BEFORE the PATCH so AWX accepts the
// unified_job_template change when the new template does not accept the field.
// Additions (associate) must happen AFTER the PATCH so the new template is
// already in place and AWX allows the association.
type ProcessPhase = 'disassociate' | 'associate';

const useProcessLabels = () => {
  const postDisassociate = usePostRequest<{ id: number; disassociate: boolean }>();
  const postAssociateLabel = usePostRequest<{ name: string; organization: number }>();

  return useCallback(
    async (nodeId: string, launch_data: GraphNodeData['launch_data'], phase: ProcessPhase) => {
      const hasLabelsPrompt =
        launch_data?.original?.launch_config?.ask_labels_on_launch ||
        (launch_data?.labels && launch_data?.labels?.length > 0);
      const existingLabels = launch_data?.original?.labels;

      if (hasLabelsPrompt) {
        const { added, removed } = getAddedAndRemoved(
          launch_data?.original?.labels || [],
          launch_data?.labels || ([] as Label[])
        );

        if (phase === 'disassociate') {
          await Promise.all(
            removed.map((label: { id: number }) =>
              postDisassociate(awxAPI`/workflow_job_template_nodes/${nodeId}/labels/`, {
                id: label.id,
                disassociate: true,
              })
            )
          );
        } else {
          const defaultOrganization = launch_data.organization ?? (await getDefaultOrganization());
          await Promise.all(
            added.map((label: { name: string; id?: number; organization?: number }) =>
              postAssociateLabel(awxAPI`/workflow_job_template_nodes/${nodeId}/labels/`, {
                name: label.name,
                organization: label?.organization ?? defaultOrganization,
              })
            )
          );
        }
      } else if (existingLabels && phase === 'disassociate') {
        await Promise.all(
          existingLabels.map((label: { id: number }) =>
            postDisassociate(awxAPI`/workflow_job_template_nodes/${nodeId}/labels/`, {
              id: label.id,
              disassociate: true,
            })
          )
        );
      }
    },
    [postDisassociate, postAssociateLabel]
  );
};

const useProcessInstanceGroups = () => {
  const postDisassociate = usePostRequest<{ id: number; disassociate: boolean }>();
  const postAssociateInstanceGroup = usePostRequest<{ id: number }, InstanceGroup>();

  return useCallback(
    async (nodeId: string, launch_data: GraphNodeData['launch_data'], phase: ProcessPhase) => {
      const hasInstanceGroupsPrompt =
        launch_data?.original?.launch_config?.ask_instance_groups_on_launch ||
        (launch_data?.instance_groups && launch_data?.instance_groups?.length > 0);
      const existingInstanceGroups = launch_data?.original?.instance_groups;

      if (hasInstanceGroupsPrompt) {
        const { added, removed } = getAddedAndRemoved(
          launch_data?.original?.instance_groups || [],
          launch_data?.instance_groups ? launch_data.instance_groups : ([] as { id: number }[])
        );

        if (phase === 'disassociate') {
          await Promise.all(
            removed.map((group: { id: number }) =>
              postDisassociate(awxAPI`/workflow_job_template_nodes/${nodeId}/instance_groups/`, {
                id: group.id,
                disassociate: true,
              })
            )
          );
        } else {
          await Promise.all(
            added.map((group) =>
              postAssociateInstanceGroup(
                awxAPI`/workflow_job_template_nodes/${nodeId}/instance_groups/`,
                { id: group.id }
              )
            )
          );
        }
      } else if (existingInstanceGroups && phase === 'disassociate') {
        await Promise.all(
          existingInstanceGroups.map((group: { id: number }) =>
            postDisassociate(awxAPI`/workflow_job_template_nodes/${nodeId}/instance_groups/`, {
              id: group.id,
              disassociate: true,
            })
          )
        );
      }
    },
    [postDisassociate, postAssociateInstanceGroup]
  );
};

const useProcessCredentials = () => {
  const postDisassociate = usePostRequest<{ id: number; disassociate: boolean }>();
  const postAssociateCredential = usePostRequest<{ id: number }, Credential>();

  return useCallback(
    async (nodeId: string, launch_data: GraphNodeData['launch_data'], phase: ProcessPhase) => {
      const promptCredentials = launch_data?.credentials || [];
      const templateCredentials = launch_data?.original?.launch_config?.defaults?.credentials || [];
      const nodeCredentials = launch_data?.original?.credentials || [];

      if (launch_data?.credentials) {
        const { added, removed } = getAddedAndRemovedCredentials(
          nodeCredentials,
          promptCredentials,
          templateCredentials
        );

        if (phase === 'disassociate') {
          await Promise.all(
            removed.map((credential: { id: number }) =>
              postDisassociate(awxAPI`/workflow_job_template_nodes/${nodeId}/credentials/`, {
                id: credential.id,
                disassociate: true,
              })
            )
          );
        } else {
          await Promise.all(
            added.map((credential) =>
              postAssociateCredential(awxAPI`/workflow_job_template_nodes/${nodeId}/credentials/`, {
                id: credential.id,
              })
            )
          );
        }
      }
    },
    [postDisassociate, postAssociateCredential]
  );
};
