import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
//import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { usePageDialogs } from '../../../../../framework';
import { Button, Modal, NumberInput, ModalVariant } from '@patternfly/react-core';
import { useLaunchManagementJob } from './useLaunchManagementJob';
import { TextContent, Text } from '@patternfly/react-core';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function useManagementJobPrompt() {
  const defaultDays = 3;
  // const MAX_RETENTION = 99999;
  //const [dataRetention, setDataRetention] = useState(defaultDays);
  const [value, setValue] = useState<number | ''>(defaultDays);
  const { t } = useTranslation();
  const { pushDialog, popDialog } = usePageDialogs();
  //const launchOtherJobTypes = useLaunchManagementJob();
  const { launchOtherJobTypes } = useLaunchManagementJob();

  const onMinus = () => {
    const newValue = (value || 0) - 1;
    setValue(newValue);
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    // const value = (event.target as HTMLInputElement).value;
    // setValue(value === '' ? value : +value);
    setValue((event.target as HTMLInputElement).value);
  };

  const onPlus = () => {
    const newValue = (value || 0) + 1;
    setValue(newValue);
  };

  async function handleLaunch(managementJob: SystemJobTemplate): Promise<void> {
    console.log('managementJob type from the MODAL', managementJob, typeof managementJob);
    await launchOtherJobTypes(managementJob);
  }

  const managementJobPrompt = (managementJob: SystemJobTemplate) => {
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
            value={value}
            onMinus={onMinus}
            onPlus={onPlus}
            onChange={handleChange}
            inputName="input"
            inputAriaLabel="number input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
          />
        </TextContent>

        <Button
          variant="primary"
          onClick={() => {
            console.log('launch on click', managementJob);
            void handleLaunch(managementJob);
          }}
        >
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
