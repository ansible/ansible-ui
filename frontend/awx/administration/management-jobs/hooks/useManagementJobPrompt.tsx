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
  // }
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
