import { stringIsUUID } from '../../../../common/util/strings';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
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

export function shouldHideOtherStep(launchData: LaunchConfiguration) {
  if (Object.keys(launchData).length === 0) return true;
  return !(
    launchData.ask_credential_on_launch ||
    launchData.ask_diff_mode_on_launch ||
    launchData.ask_execution_environment_on_launch ||
    launchData.ask_forks_on_launch ||
    launchData.ask_instance_groups_on_launch ||
    launchData.ask_inventory_on_launch ||
    launchData.ask_job_slice_count_on_launch ||
    launchData.ask_job_type_on_launch ||
    launchData.ask_labels_on_launch ||
    launchData.ask_limit_on_launch ||
    launchData.ask_scm_branch_on_launch ||
    launchData.ask_skip_tags_on_launch ||
    launchData.ask_tags_on_launch ||
    launchData.ask_timeout_on_launch ||
    launchData.ask_variables_on_launch ||
    launchData.ask_verbosity_on_launch
  );
}
