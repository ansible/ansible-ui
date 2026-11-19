import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { getCopyResourceName } from '@ansible/common-ui/utils/copyResourceName';
import { AlertProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

function getCopyErrorMessage(error: unknown, fallback: string): string {
  const { genericErrors, fieldErrors } = awxErrorAdapter(error);
  const messages = [
    ...genericErrors.map((err) => err.message),
    ...fieldErrors.map((err) => err.message),
  ].filter((message): message is string => typeof message === 'string' && message.length > 0);
  return messages[0] ?? fallback;
}

export function useCopyTemplate(onComplete: () => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  const copyTemplate = (template: JobTemplate | WorkflowJobTemplate) => {
    const successAlert: AlertProps = {
      variant: 'success',
      title: t(`${template.name} duplicated.`),
      timeout: 2000,
    };
    const copyUrl =
      template.type === 'job_template'
        ? awxAPI`/job_templates/${template.id.toString()}/copy/`
        : template.type === 'workflow_job_template'
          ? awxAPI`/workflow_job_templates/${template.id.toString()}/copy/`
          : undefined;

    if (!copyUrl) {
      return;
    }

    postRequest(copyUrl, {
      name: getCopyResourceName(template.name),
    })
      .then(() => {
        alertToaster.addAlert(successAlert);
      })
      .catch((error: unknown) => {
        // Use addAlert (not replaceAlert): the success toast was never shown, so
        // replaceAlert would silently no-op and leave the user with no feedback
        // (e.g. on 403 from /copy/ when RBAC is stricter than user_capabilities.copy).
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to duplicate template'),
          children: getCopyErrorMessage(
            error,
            t('Permission denied: Unable to duplicate this template. Please contact your administrator.')
          ),
          timeout: 5000,
        });
      })
      .finally(onComplete);
  };
  return copyTemplate;
}
