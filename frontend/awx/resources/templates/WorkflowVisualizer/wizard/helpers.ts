import { jsonToYaml, yamlToJson } from '@ansible/ansible-ui-framework/utils/codeEditorUtils';
import { awxAPI } from '../../../../common/api/awx-utils';
import { stringIsUUID } from '../../../../common/util/strings';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import { Survey } from '../../../../interfaces/Survey';
import { RESOURCE_TYPE } from '../constants';
import type { AllResources, UnifiedJobType } from '../types';

export function replaceIdentifier(identifier: string, alias: string): string {
  if (stringIsUUID(identifier) && typeof alias === 'string' && alias !== '') {
    return alias;
  }
  if (!stringIsUUID(identifier) && identifier !== alias) {
    return alias;
  }
  return identifier;
}

export function getResourceURL(resourceType: string): string {
  switch (resourceType) {
    case 'job':
    case 'job_template':
      return awxAPI`/job_templates/`;
    case 'workflow_job':
    case 'workflow_job_template':
      return awxAPI`/workflow_job_templates/`;
    case 'inventory_update':
    case 'inventory_source':
      return awxAPI`/inventory_sources`;
    case 'project':
    case 'project_update':
      return awxAPI`/projects/`;
    case 'system_job':
    case 'system_job_template':
      return awxAPI`/system_job_templates/`;
    case 'workflow_approval':
      return ''; // Approval nodes don't fetch existing resources
    default:
      return '';
  }
}

export function hasDaysToKeep(node: AllResources) {
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

export function processSurvey(
  extra_vars: string | null,
  survey: { [key: string]: string | string[] },
  surveyConfig: Survey | null
): string {
  const extraVarsObj = extra_vars ? (JSON.parse(yamlToJson(extra_vars)) as object) : {};
  const updatedSurvey: { [key: string]: string | string[] } = { ...survey };

  if (surveyConfig?.spec) {
    const passwordFields = surveyConfig.spec
      .filter((q) => q.type === 'password')
      .map((q) => q.variable);

    const maskedSurveyPasswords = maskPasswords(survey, passwordFields);
    Object.keys(maskedSurveyPasswords).forEach((passwordKey) => {
      updatedSurvey[passwordKey] = maskedSurveyPasswords[passwordKey];
    });
  }

  const mergedData: { [key: string]: string | string[] | { name: string }[] } = {
    ...extraVarsObj,
    ...updatedSurvey,
  };

  return jsonToYaml(JSON.stringify(mergedData));
}

function maskPasswords(vars: { [key: string]: string | string[] }, passwordKeys: string[]) {
  const updated = { ...vars };
  passwordKeys.forEach((key) => {
    if (typeof updated[key] !== 'undefined') {
      updated[key] = '$encrypted$';
    }
  });
  return updated;
}
