import { useTranslation } from 'react-i18next';
//import React, { useState } from 'react';
import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { usePageDialogs } from '../../../../../framework';
import { Button, Modal, NumberInput, ModalVariant } from '@patternfly/react-core';
//import { useLaunchManagementJob } from './useLaunchManagementJob';
import { TextContent, Text } from '@patternfly/react-core';

export function useManagementJobPrompt(managementJob: SystemJobTemplate) {
  //const defaultDays = 30;
  // const MAX_RETENTION = 99999;
  //const [dataRetention, setDataRetention] = useState(defaultDays);
  //const [value, setValue] = useState<number | ''>(defaultDays);
  const { t } = useTranslation();
  const { pushDialog, popDialog } = usePageDialogs();
  //const launchOtherJobTypes = useLaunchManagementJob();
 // const { launchManagementJob } = useLaunchManagementJob();

  // const onMinus = () => {
  //   const newValue = (value || 0) - 1;
  //   setValue(newValue);
  // };

  // const onChange = (event: React.FormEvent<HTMLInputElement>) => {
  //   // const value = (event.target as HTMLInputElement).value;
  //   // setValue(value === '' ? value : +value);
  //   setValue((event.target as HTMLInputElement).value);
  // };

  // const onPlus = () => {
  //   const newValue = (value || 0) + 1;
  //   setValue(newValue);
  // };
  function handleLaunch(managementJob: SystemJobTemplate) {
    console.log('Launching management job:', managementJob);
    //await launchManagementJob();
  }
  // }
  const managementJobPrompt = () => {
    const dialog = (
      <Modal
        title={t('Launch Management Job')}
        titleIconVariant="info"
        isOpen
        width="35%"
        key="launch"
        onClose={popDialog}
        variant={ModalVariant.small}
      >
        <TextContent>
          <Text>{t`Set how many days of data should be retained.`}</Text>

          <NumberInput
            value={30}
            onMinus={2}
            onPlus={2}
            onChange={handleLaunch}
            inputName="input"
            inputAriaLabel="number input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
          />
        </TextContent>

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
