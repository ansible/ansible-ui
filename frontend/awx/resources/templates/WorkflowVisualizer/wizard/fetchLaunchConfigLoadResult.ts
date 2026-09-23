import { requestGet } from '@ansible/common-ui/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';
import type { LaunchConfiguration } from '../../../../interfaces/LaunchConfiguration';
import { RESOURCE_TYPE } from '../constants';
import type { AllResources } from '../types';
import { getResourceURL, shouldHideOtherStep } from './helpers';
import type { LaunchConfigLoadResult } from './launchConfigLoad';

/** Fetches resource + launch config for workflow node wizards (no step-data side effects). */
export async function fetchLaunchConfigLoadResult(
  nodeType: string,
  resourceId: number
): Promise<LaunchConfigLoadResult | undefined> {
  if (!resourceId) {
    return undefined;
  }
  if (nodeType !== RESOURCE_TYPE.job && nodeType !== RESOURCE_TYPE.workflow_job) {
    return undefined;
  }

  const nodeResourceUrl = getResourceURL(nodeType);
  const nodeResource = await requestGet<AllResources>(`${nodeResourceUrl}/${resourceId.toString()}`);

  let launchConfigResults = {} as LaunchConfiguration;
  if (nodeType === RESOURCE_TYPE.job) {
    launchConfigResults = await requestGet<LaunchConfiguration>(
      awxAPI`/job_templates/${resourceId.toString()}/launch/`
    );
  } else {
    launchConfigResults = await requestGet<LaunchConfiguration>(
      awxAPI`/workflow_job_templates/${resourceId.toString()}/launch/`
    );
  }

  const shouldShowPromptStep = !shouldHideOtherStep(launchConfigResults);
  const shouldShowSurveyStep = launchConfigResults.survey_enabled;
  const launchConfig =
    shouldShowPromptStep || shouldShowSurveyStep ? launchConfigResults : null;

  return {
    launch_config: launchConfig,
    resource: nodeResource,
    resourceId,
  };
}
