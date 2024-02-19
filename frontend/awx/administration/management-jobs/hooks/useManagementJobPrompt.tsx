import { useTranslation } from 'react-i18next';
import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { usePageDialogs } from '../../../../../framework';
import { Button, Modal, NumberInput, ModalVariant } from '@patternfly/react-core';
import { requestGet } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { usePageNavigate } from '../../../../../framework';
import { useLaunchManagementJob } from './useLaunchManagementJob';
import { useNavigate } from 'react-router-dom';
import { usePageAlertToaster } from '../../../../../framework';

export function useManagementJobPrompt(managementJob: SystemJobTemplate) {
  const { t } = useTranslation();
  const { pushDialog, popDialog } = usePageDialogs();
  // const pageNavigate = usePageNavigate();
  // const launchManagementJob = useLaunchManagementJob(managementJob);
  // const postRequest = usePostRequest();
  // const alertToaster = usePageAlertToaster();
  // const navigate = useNavigate();
  // const postRequest = usePostRequest();
  // const alertToaster = usePageAlertToaster();
  // const pageNavigate = usePageNavigate();
  // const getJobOutputUrl = useGetJobOutputUrl();
  const handleLaunch = (managementJob: SystemJobTemplate, defaultDays: number = 30) => {
    console.log('Launching management job:', managementJob.job_type, defaultDays);
  };

  const managementJobPrompt = () => {
    const dialog = (
      <Modal
        title={t('Launch Management Job')}
        isOpen
        key="launch"
        onClose={popDialog}
        variant={ModalVariant.medium}
      >
        <NumberInput
          value={30}
          onMinus={1}
          onPlus={1}
          inputName="input"
          inputAriaLabel="number input"
          minusBtnAriaLabel="minus"
          plusBtnAriaLabel="plus"
        />

        <Button variant="primary" onClick={() => void handleLaunch(managementJob)}>
          {t('Launch')}
        </Button>

        <Button key="cancel" variant="link" onClick={popDialog}>
          {t('Cancel')}
        </Button>
      </Modal>
    );
    pushDialog(dialog);
  };
  return managementJobPrompt;
}

//   return async (managementJob: SystemJobTemplate) => {
//     const launchManagementJobEndpoint = getLaunchMgtJobEndpoint(managementJob);

//     if (!launchManagementJobEndpoint) {
//       return Promise.reject(new Error('Unable to retrieve management job launch configuration'));
//     }

//     try {
//       let managementJobLaunch;
//       if (
//         managementJob.job_type === 'cleanup_tokens' ||
//         managementJob.job_type === 'cleanup_sessions'
//       ) {
//         managementJobLaunch = await postRequest(launchManagementJobEndpoint, {});
//       }
//       navigate(getJobOutputUrl(managementJobLaunch));
//     } catch (error) {
//       alertToaster.addAlert({
//         variant: 'danger',
//         title: t('Failed to launch management job'),
//         children: error instanceof Error && error.message,
//         timeout: 5000,
//       });
//     }
//   };
// }
// export function getLaunchMgtJobEndpoint(managementJob: SystemJobTemplate) {
//   //   if (
//   //     managementJob.name === 'Cleanup Activity Stream' ||
//   //     managementJob.name === 'Cleanup Job Details'
//   //   ) {
//   //     return awxAPI`/system_job_templates/${managementJob.id.toString()}/launch/`;
//   //   } else
//   if (
//     managementJob.name === 'Cleanup Expired OAuth 2 Tokens' ||
//     managementJob.name === 'Cleanup Expired Sessions'
//   ) {
//     return awxAPI`/system_job_templates/${managementJob.id.toString()}/launch/`;
//   } else {
//     return undefined;
//   }
// }
