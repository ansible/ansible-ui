import { stringIsUUID } from '../../../../common/util/strings';
import { UnifiedJobType } from '../../../../interfaces/WorkflowNode';
import type { GraphNode, NodeResource } from '../types';

export function getInitialValues(node?: GraphNode) {
  const nodeData = node?.getData();
  const { resource } = nodeData || {};

  const nodeUJT = resource?.summary_fields?.unified_job_template;
  const nodeType = nodeUJT?.unified_job_type;
  const nodeIdentifier = stringIsUUID(resource?.identifier || '') ? '' : resource?.identifier;
  const nodeConvergence = getConvergenceType(resource?.all_parents_must_converge);
  const nodeDaysToKeep = resource?.extra_data?.days;
  const approvalTimeout = nodeUJT?.timeout;
  const approvalName = getValueBasedOnJobType(nodeType, '', nodeUJT?.name ?? '');
  const approvalDescription = getValueBasedOnJobType(nodeType, '', nodeUJT?.description ?? '');

  return {
    nodeTypeStep: {
      approval_description: approvalDescription ?? '',
      approval_name: approvalName ?? '',
      approval_timeout: approvalTimeout ?? 0,
      node_alias: nodeIdentifier || '',
      node_convergence: nodeConvergence,
      node_days_to_keep: nodeDaysToKeep ?? 30,
      node_resource: nodeUJT || null,
      node_type: nodeType || UnifiedJobType.job,
    },
  };
}

export function replaceIdentifier(identifier: string, alias: string): string {
  if (stringIsUUID(identifier) && typeof alias === 'string' && alias !== '') {
    return alias;
  }
  if (!stringIsUUID(identifier) && identifier !== alias) {
    return alias;
  }
  return identifier;
}

export function hasDaysToKeep(systemJob: NodeResource | null) {
  if (!systemJob) return false;
  return ['cleanup_jobs', 'cleanup_activitystream'].includes(systemJob?.job_type || '');
}

export function getValueBasedOnJobType(
  nodeType: UnifiedJobType | undefined,
  defaultValue: string,
  workflowValue: string
): string {
  return nodeType === UnifiedJobType.workflow_approval ? workflowValue : defaultValue;
}

export function getConvergenceType(convergence: boolean | null | undefined): string {
  if (convergence === undefined || convergence === null) {
    return 'any';
  } else {
    return convergence ? 'all' : 'any';
  }
}

export function getNodeLabel(name: string, alias: string): string {
  if (!stringIsUUID(alias) && alias !== '') {
    return alias;
  }
  return name;
}
