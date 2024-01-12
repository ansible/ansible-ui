import { postRequest, requestGet } from '../../../common/crud/Data';
import { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';

import { Job } from '../../interfaces/Job';
import { awxAPI } from '../api/awx-utils';
// TODO: Add launch prompt functionality.  This includes, but it not limited to:
// 1) Fetching labels from api
// 2) Fetching survey from api
// 3) Doing what needs to be done with this data in the prompt workflow.
function canLaunchWithoutPrompt(launchData: LaunchConfiguration) {
  return (
    launchData.can_start_without_user_input &&
    !launchData.ask_inventory_on_launch &&
    !launchData.ask_variables_on_launch &&
    !launchData.ask_limit_on_launch &&
    !launchData.ask_scm_branch_on_launch &&
    !launchData.ask_execution_environment_on_launch &&
    !launchData.ask_labels_on_launch &&
    !launchData.ask_forks_on_launch &&
    !launchData.ask_job_slice_count_on_launch &&
    !launchData.ask_timeout_on_launch &&
    !launchData.ask_instance_groups_on_launch &&
    !launchData.survey_enabled &&
    (!launchData.passwords_needed_to_start || launchData.passwords_needed_to_start.length === 0) &&
    (!launchData.variables_needed_to_start || launchData.variables_needed_to_start.length === 0)
  );
}

type LaunchWithParamsType = LaunchConfiguration & LaunchConfiguration['credential_passwords'];
export const handleLaunch = async (resourceType: string, resourceId: number) => {
  const readLaunch =
    resourceType === 'workflow_job_template'
      ? requestGet<LaunchConfiguration>(
          awxAPI`/workflow_job_templates/${resourceId.toString()}/launch/`
        )
      : requestGet<LaunchConfiguration>(awxAPI`/job_templates/${resourceId.toString()}/launch/`);

  try {
    const launchResponse: LaunchConfiguration = await readLaunch;
    if (canLaunchWithoutPrompt(launchResponse)) {
      return launchWithParams(resourceType, resourceId, {} as LaunchWithParamsType);
    } else {
      throw Error;
      // TODO show launch prompt
    }
  } catch {
    // TODO handle Error
  }
};

type LaunchCredentialPasswordsType = keyof LaunchConfiguration['credential_passwords'];
const launchWithParams = (
  resourceType: string,
  resourceId: number,
  params?: LaunchWithParamsType
) => {
  let jobPromise;

  if (resourceType === 'job_template') {
    jobPromise = postRequest<Job>(awxAPI`/job_templates/${resourceId.toString()}/launch/`, params);
  } else if (resourceType === 'workflow_job_template') {
    jobPromise = postRequest<Job>(
      awxAPI`/workflow_job_templates/${resourceId.toString()}/launch/`,
      params
    );
  } else if (resourceType === 'job') {
    jobPromise = postRequest<Job>(awxAPI`/jobs/${resourceId.toString()}/launch/`, params);
  } else if (resourceType === 'workflow_job') {
    jobPromise = postRequest<Job>(awxAPI`/workflow_jobs/${resourceId.toString()}/launch/`, params);
  } else if (resourceType === 'ad_hoc_command') {
    if (params && params.credential_passwords) {
      // The api expects the passwords at the top level of the object instead of nested
      // in credential_passwords like the other relaunch endpoints
      const credentialPasswords: LaunchConfiguration['credential_passwords'] =
        params.credential_passwords || {};
      Object.keys(credentialPasswords).forEach((key) => {
        const credentialPassword = credentialPasswords[key as LaunchCredentialPasswordsType];
        params[key as LaunchCredentialPasswordsType] = credentialPassword;
      });
    }
    jobPromise = postRequest<Job>(
      awxAPI`/ad_hoc_commands/${resourceId.toString()}/launch/`,
      params || {}
    );
  }

  return jobPromise;
};

export const handleRelaunch = async (
  resourceType: string,
  resourceId: number,
  params?: LaunchConfiguration
) => {
  let readRelaunch;
  let relaunch;

  if (resourceType === 'inventory_update') {
    // We'll need to handle the scenario where the src no longer exists
    readRelaunch = requestGet<LaunchConfiguration>(
      awxAPI`/inventory_sources/${resourceId.toString()}/relaunch/`
    );
  } else if (resourceType === 'project_update') {
    // We'll need to handle the scenario where the project no longer exists
    readRelaunch = requestGet<LaunchConfiguration>(
      awxAPI`/project_updates/${resourceId.toString()}/relaunch/`
    );
  } else if (resourceType === 'workflow_job') {
    readRelaunch = requestGet<LaunchConfiguration>(
      awxAPI`/workflow_jobs/${resourceId.toString()}/relaunch/`
    );
  } else if (resourceType === 'ad_hoc_command') {
    readRelaunch = requestGet<LaunchConfiguration>(
      awxAPI`/ad_hoc_commands/${resourceId.toString()}/relaunch/`
    );
  } else if (resourceType === 'job') {
    readRelaunch = requestGet<LaunchConfiguration>(
      awxAPI`/jobs/${resourceId.toString()}/relaunch/`
    );
  }

  try {
    const relaunchResponse = await readRelaunch;
    if (
      !relaunchResponse?.passwords_needed_to_start ||
      relaunchResponse.passwords_needed_to_start.length === 0
    ) {
      if (resourceType === 'inventory_update') {
        relaunch = postRequest<Job>(
          awxAPI`/inventory_sources/${resourceId.toString()}/update/`,
          {}
        );
      } else if (resourceType === 'project_update') {
        relaunch = relaunch = postRequest<Job>(
          awxAPI`/projects/${resourceId.toString()}/update/`,
          {}
        );
      } else if (resourceType === 'workflow_job') {
        relaunch = relaunch = postRequest<Job>(
          awxAPI`/workflow_jobs/${resourceId.toString()}/update/`,
          {}
        );
      } else if (resourceType === 'ad_hoc_command') {
        relaunch = relaunch = postRequest<Job>(
          awxAPI`/ad_hoc_commands/${resourceId.toString()}/update/`,
          {}
        );
      } else if (resourceType === 'job') {
        relaunch = postRequest<Job>(awxAPI`/jobs/${resourceId.toString()}/update/`, params || {});
      }
      return relaunch;
    }
  } catch {
    //handle error
  }
};
