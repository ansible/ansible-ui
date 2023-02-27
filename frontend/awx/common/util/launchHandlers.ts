import { requestGet, requestPost } from '../../../Data';
import { Launch } from '../../interfaces/Launch';

import { Job } from '../../interfaces/Job';
// TODO: Add launch prompt functionality.  This includes, but it not limited to:
// 1) Fetching labels from api
// 2) Fetching survey from api
// 3) Doing what needs to be done with this data in the prompt workflow.
function canLaunchWithoutPrompt(launchData: Launch) {
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

export const handleLaunch = async (resourceType: string, resourceId: number) => {
  const readLaunch =
    resourceType === 'workflow_job_template'
      ? requestGet<Launch>(`/api/v2/workflow_job_templates/${resourceId.toString()}/launch/`)
      : requestGet<Launch>(`/api/v2/job_templates/${resourceId.toString()}/launch/`);

  try {
    const launchResponse: Launch = await readLaunch;
    if (canLaunchWithoutPrompt(launchResponse)) {
      return launchWithParams(resourceType, resourceId, {} as Launch);
    } else {
      throw Error;
      // TODO show launch prompt
    }
  } catch {
    // TODO handle Error
  }
};

const launchWithParams = (resourceType: string, resourceId: number, params?: Launch) => {
  let jobPromise;

  if (resourceType === 'job_template') {
    jobPromise = requestPost<Job>(`/api/v2/job_templates/${resourceId.toString()}/launch/`, params);
  } else if (resourceType === 'workflow_job_template') {
    jobPromise = requestPost<Job>(
      `/api/v2/workflow_job_templates/${resourceId.toString()}/launch/`,
      params
    );
  } else if (resourceType === 'job') {
    jobPromise = requestPost<Job>(`/api/v2/jobs/${resourceId.toString()}/launch/`, params);
  } else if (resourceType === 'workflow_job') {
    jobPromise = requestPost<Job>(`/api/v2/workflow_jobs/${resourceId.toString()}/launch/`, params);
  } else if (resourceType === 'ad_hoc_command') {
    if (params?.credential_passwords) {
      // The api expects the passwords at the top level of the object instead of nested
      // in credential_passwords like the other relaunch endpoints
      Object.keys(params.credential_passwords).forEach((key) => {
        params[key] = params.credential_passwords[key];
      });
    }
    jobPromise = requestPost<Job>(
      `/api/v2/ad_hoc_commands/${resourceId.toString()}/launch/`,
      params || {}
    );
  }

  return jobPromise;
};

export const handleRelaunch = async (resourceType: string, resourceId: number, params?: Launch) => {
  let readRelaunch;
  let relaunch;

  if (resourceType === 'inventory_update') {
    // We'll need to handle the scenario where the src no longer exists
    readRelaunch = requestGet<Launch>(
      `/api/v2/inventory_sources/${resourceId.toString()}/relaunch/`
    );
  } else if (resourceType === 'project_update') {
    // We'll need to handle the scenario where the project no longer exists
    readRelaunch = requestGet<Launch>(`/api/v2/project_updates/${resourceId.toString()}/relaunch/`);
  } else if (resourceType === 'workflow_job') {
    readRelaunch = requestGet<Launch>(`/api/v2/workflow_jobs/${resourceId.toString()}/relaunch/`);
  } else if (resourceType === 'ad_hoc_command') {
    readRelaunch = requestGet<Launch>(`/api/v2/ad_hoc_commands/${resourceId.toString()}/relaunch/`);
  } else if (resourceType === 'job') {
    readRelaunch = requestGet<Launch>(`/api/v2/jobs/${resourceId.toString()}/relaunch/`);
  }

  try {
    const relaunchResponse = await readRelaunch;
    if (
      !relaunchResponse?.passwords_needed_to_start ||
      relaunchResponse.passwords_needed_to_start.length === 0
    ) {
      if (resourceType === 'inventory_update') {
        relaunch = requestPost<Job>(
          `/api/v2/inventory_sources/${resourceId.toString()}/update/`,
          {}
        );
      } else if (resourceType === 'project_update') {
        relaunch = relaunch = requestPost<Job>(
          `/api/v2/projects/${resourceId.toString()}/update/`,
          {}
        );
      } else if (resourceType === 'workflow_job') {
        relaunch = relaunch = requestPost<Job>(
          `/api/v2/workflow_jobs/${resourceId.toString()}/update/`,
          {}
        );
      } else if (resourceType === 'ad_hoc_command') {
        relaunch = relaunch = requestPost<Job>(
          `/api/v2/ad_hoc_commands/${resourceId.toString()}/update/`,
          {}
        );
      } else if (resourceType === 'job') {
        relaunch = requestPost<Job>(`/api/v2/jobs/${resourceId.toString()}/update/`, params || {});
      }
      return relaunch;
    }
  } catch {
    //handle error
  }
};
