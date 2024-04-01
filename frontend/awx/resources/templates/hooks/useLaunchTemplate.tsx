import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageAlertToaster, usePageNavigate } from '../../../../../framework';
import { requestGet } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import type { JobTemplate } from '../../../interfaces/JobTemplate';
import type { UnifiedJob } from '../../../interfaces/UnifiedJob';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { JobLaunch, WorkflowJobLaunch } from '../../../interfaces/generated-from-swagger/api';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';

type Template = JobTemplate | WorkflowJobTemplate;
type TemplateLaunch = JobLaunch & WorkflowJobLaunch;

export function useLaunchTemplate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<Partial<JobTemplate | WorkflowJobTemplate>, UnifiedJob>();
  const alertToaster = usePageAlertToaster();
  const pageNavigate = usePageNavigate();
  const getJobOutputUrl = useGetJobOutputUrl();

  return async (template: Template) => {
    const launchEndpoint = getLaunchEndpoint(template);

    if (!launchEndpoint) {
      return Promise.reject(new Error('Unable to retrieve launch configuration'));
    }

    try {
      const launchConfig = await requestGet<TemplateLaunch>(launchEndpoint);

      if (canLaunchWithoutPrompt(launchConfig)) {
        const launchJob = await postRequest(launchEndpoint, {});
        navigate(getJobOutputUrl(launchJob));
      } else {
        const awxRoute =
          template.type === 'workflow_job_template'
            ? AwxRoute.WorkflowJobTemplateLaunchWizard
            : AwxRoute.TemplateLaunchWizard;

        pageNavigate(awxRoute, {
          params: { id: template.id },
        });
      }
    } catch (error) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to launch template'),
        children: error instanceof Error && error.message,
        timeout: 5000,
      });
    }
  };
}

export function canLaunchWithoutPrompt(launchData: TemplateLaunch) {
  return (
    !launchData.ask_credential_on_launch &&
    !launchData.ask_diff_mode_on_launch &&
    !launchData.ask_execution_environment_on_launch &&
    !launchData.ask_forks_on_launch &&
    !launchData.ask_instance_groups_on_launch &&
    !launchData.ask_inventory_on_launch &&
    !launchData.ask_job_slice_count_on_launch &&
    !launchData.ask_job_type_on_launch &&
    !launchData.ask_labels_on_launch &&
    !launchData.ask_limit_on_launch &&
    !launchData.ask_scm_branch_on_launch &&
    !launchData.ask_skip_tags_on_launch &&
    !launchData.ask_tags_on_launch &&
    !launchData.ask_timeout_on_launch &&
    !launchData.ask_variables_on_launch &&
    !launchData.ask_verbosity_on_launch &&
    launchData.can_start_without_user_input &&
    !launchData.survey_enabled &&
    (!launchData.passwords_needed_to_start || launchData.passwords_needed_to_start.length === 0) &&
    (!launchData.variables_needed_to_start || launchData.variables_needed_to_start.length === 0)
  );
}

export function getLaunchEndpoint(template: Template) {
  if (template.type === 'job_template') {
    return awxAPI`/job_templates/${template.id.toString()}/launch/`;
  } else if (template.type === 'workflow_job_template') {
    return awxAPI`/workflow_job_templates/${template.id.toString()}/launch/`;
  } else {
    return undefined;
  }
}
