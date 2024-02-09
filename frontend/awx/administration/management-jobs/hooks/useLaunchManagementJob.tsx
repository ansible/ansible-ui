import { useTranslation } from 'react-i18next';
import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { usePageDialogs } from '../../../../../framework';
import { Button, Modal, NumberInput, ModalVariant } from '@patternfly/react-core';

export function useLaunchManagementJob() {
  const { t } = useTranslation();
  const { pushDialog, popDialog } = usePageDialogs();
  // const navigate = useNavigate();
  // const postRequest = usePostRequest();
  // const alertToaster = usePageAlertToaster();
  // const pageNavigate = usePageNavigate();
  //const managementJobs = useManagementJobs();

  const launchManagementJob = (managementJob: SystemJobTemplate) => {
    const dialog = (
      <Modal
        title={t('Cleanup Job Details')}
        isOpen
        key="launch"
        onClose={popDialog}
        variant={ModalVariant.medium}
      >
        <NumberInput
          value={100}
          onMinus={1}
          onPlus={2}
          inputName="input"
          inputAriaLabel="number input"
          minusBtnAriaLabel="minus"
          plusBtnAriaLabel="plus"
        />

        <Button variant="primary" onClick={() => handleLaunch(managementJob)}>
          {t('Launch')}
        </Button>

        <Button key="cancel" variant="link" onClick={() => handleLaunch(managementJob)}>
          {t('Cancel')}
        </Button>
      </Modal>
    );
    pushDialog(dialog);
  };
  return launchManagementJob;
}
