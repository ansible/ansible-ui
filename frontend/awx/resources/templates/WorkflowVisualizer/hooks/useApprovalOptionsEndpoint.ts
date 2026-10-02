import { PageFormOptionsData } from '@ansible/ansible-ui-framework/PageForm/PageFormOptionsContext';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useVisualizationController } from '@patternfly/react-topology';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { AwxItemsResponse } from '../../../../common/AwxItemsResponse';
import { awxAPI } from '../../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../../interfaces/OptionsResponse';
import { RESOURCE_TYPE, START_NODE_ID } from '../constants';
import type { ControllerState, WizardFormValues } from '../types';
import { useSelectedNode } from './useSelectedNode';

/** Controller workflow node PKs are numeric; unsaved visualizer nodes use synthetic graph ids. */
function isSavedWorkflowNodeGraphId(id: string): boolean {
  if (id === START_NODE_ID || id.includes('unsavedNode')) {
    return false;
  }
  return /^\d+$/.test(id);
}

/**
 * Resolves the OPTIONS endpoint for approval node name/description validation.
 *
 * There is no list endpoint at /workflow_approval_templates/. Metadata comes from:
 * - PATCH/PUT on /workflow_approval_templates/{id}/ when editing an existing approval
 * - GET on /workflow_job_template_nodes/{id}/create_approval_template/ when creating one
 *   (writable field patterns are advertised under GET, not POST, on that view)
 */
export function useApprovalOptionsEndpoint(): string | undefined {
  const controller = useVisualizationController();
  const state = controller.getState<ControllerState>();
  const selectedNode = useSelectedNode();
  const nodeType = useWatch<WizardFormValues, 'node_type'>({ name: 'node_type' });

  const existingApprovalTemplateId = useMemo(() => {
    if (nodeType !== RESOURCE_TYPE.workflow_approval) {
      return undefined;
    }

    const nodeUJT = selectedNode?.getData()?.resource?.summary_fields?.unified_job_template;
    if (
      nodeUJT?.unified_job_type === RESOURCE_TYPE.workflow_approval &&
      typeof nodeUJT.id === 'number' &&
      nodeUJT.id > 0
    ) {
      return nodeUJT.id;
    }

    return undefined;
  }, [nodeType, selectedNode]);

  const workflowNodeIdFromGraph = useMemo(() => {
    if (nodeType !== RESOURCE_TYPE.workflow_approval) {
      return undefined;
    }

    const candidateIds: string[] = [];
    const sourceNodeId = state.sourceNode?.getId();
    if (sourceNodeId && sourceNodeId !== START_NODE_ID) {
      candidateIds.push(sourceNodeId);
    }

    if (selectedNode) {
      const id = selectedNode.getId();
      if (id !== START_NODE_ID) {
        candidateIds.push(id);
      }
    }

    controller
      .getGraph()
      .getNodes()
      .forEach((node) => {
        const id = node.getId();
        if (id !== START_NODE_ID) {
          candidateIds.push(id);
        }
      });

    return candidateIds.find(isSavedWorkflowNodeGraphId);
  }, [controller, nodeType, selectedNode, state.sourceNode]);

  const shouldFetchWorkflowNode = !existingApprovalTemplateId && !workflowNodeIdFromGraph;

  const { data: workflowNodes } = useGet<AwxItemsResponse<{ id: number }>>(
    shouldFetchWorkflowNode && state.workflowTemplate?.id
      ? awxAPI`/workflow_job_templates/${state.workflowTemplate.id}/workflow_nodes/?page_size=1`
      : undefined
  );

  const workflowNodeId = workflowNodeIdFromGraph ?? workflowNodes?.results?.[0]?.id?.toString();

  return useMemo(() => {
    if (nodeType !== RESOURCE_TYPE.workflow_approval) {
      return undefined;
    }
    if (existingApprovalTemplateId) {
      return awxAPI`/workflow_approval_templates/${existingApprovalTemplateId}/`;
    }
    if (workflowNodeId) {
      return awxAPI`/workflow_job_template_nodes/${workflowNodeId}/create_approval_template/`;
    }
    return undefined;
  }, [existingApprovalTemplateId, nodeType, workflowNodeId]);
}

/**
 * create_approval_template is a RetrieveAPIView with a custom post() handler, so
 * Controller OPTIONS advertises writable field patterns under GET rather than POST.
 * Map that GET payload onto POST only for this endpoint; every other OPTIONS response
 * is passed through so extractPageFormOptionsFields keeps reading write methods only.
 */
export function approvalOptionsToPageFormData(
  endpoint: string | undefined,
  options: OptionsResponse<ActionsResponse> | undefined
): PageFormOptionsData | undefined {
  if (!options) {
    return undefined;
  }
  if (endpoint?.includes('/create_approval_template/')) {
    return { actions: { POST: options.actions?.GET } };
  }
  return options;
}
