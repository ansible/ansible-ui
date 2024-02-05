import { AlertProps } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

export function useCopyTemplate(onComplete: () => void) {
  const { t } = useTranslation();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();

  const copyTemplate = (template: JobTemplate | WorkflowJobTemplate) => {
    const alert: AlertProps = {
      variant: 'success',
      title: t(`${template.name} copied.`),
      timeout: 2000,
    };
    if (template.type === 'job_template') {
      postRequest(awxAPI`/job_templates/${template.id.toString()}/copy/`, {
        name: `${template.name} @ ${new Date()
          .toTimeString()
          .replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')}`,
      })
        .then(() => {
          alertToaster.addAlert(alert);
        })
        .catch((error) => {
          alertToaster.replaceAlert(alert, {
            variant: 'danger',
            title: t('Failed to copy template'),
            children: error instanceof Error && error.message,
          });
        })
        .finally(onComplete);
    } else if (template.type === 'workflow_job_template') {
      postRequest(awxAPI`/workflow_job_templates/${template.id.toString()}/copy/`, {
        name: `${template.name} @ ${new Date()
          .toTimeString()
          .replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')}`,
      })
        .then(() => {
          alertToaster.addAlert(alert);
        })
        .catch((error) => {
          alertToaster.replaceAlert(alert, {
            variant: 'danger',
            title: t('Failed to copy template'),
            children: error instanceof Error && error.message,
          });
        })
        .finally(onComplete);
    }
  };
  return copyTemplate;
}
