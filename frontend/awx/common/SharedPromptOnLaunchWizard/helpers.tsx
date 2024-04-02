import { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';

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
