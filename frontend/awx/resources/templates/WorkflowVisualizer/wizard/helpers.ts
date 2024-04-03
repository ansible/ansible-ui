import { stringIsUUID } from '../../../../common/util/strings';
import type { AllResources, NodeResource, UnifiedJobType } from '../types';
import { RESOURCE_TYPE } from '../constants';

export function replaceIdentifier(identifier: string, alias: string): string {
  if (stringIsUUID(identifier) && typeof alias === 'string' && alias !== '') {
    return alias;
  }
  if (!stringIsUUID(identifier) && identifier !== alias) {
    return alias;
  }
  return identifier;
}

export function hasDaysToKeep(node: NodeResource | AllResources | null) {
  if (!node || !('job_type' in node) || !node.job_type) return false;
  return ['cleanup_jobs', 'cleanup_activitystream'].includes(node.job_type);
}

export function getValueBasedOnJobType(
  nodeType: UnifiedJobType,
  defaultValue: string,
  workflowValue: string
): string {
  return nodeType === RESOURCE_TYPE.workflow_approval ? workflowValue : defaultValue;
}

export function getConvergenceType(convergence: boolean | null | undefined): 'any' | 'all' {
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
