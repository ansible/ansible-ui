import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
//import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { usePageDialogs } from '../../../../../framework';
import { Button, Modal, NumberInput, ModalVariant } from '@patternfly/react-core';
import { useLaunchManagementJob } from './useLaunchManagementJob';
import { TextContent, Text } from '@patternfly/react-core';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function useManagementJobPrompt() {
  const defaultDays = 30;
  const [dataRetention, setDataRetention] = useState<number | undefined>(defaultDays);
  const { t } = useTranslation();
  const { pushDialog, popDialog } = usePageDialogs();
  const launchManagementJob = useLaunchManagementJob();

  const onMinus = () => {
    const newValue = (dataRetention || 0) - 1;
    setDataRetention(newValue);
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.value;
    setDataRetention(newValue === '' ? '' : +newValue);
  };

  const onPlus = () => {
    const newValue = (dataRetention || 0) + 1;
    setDataRetention(newValue);
  };

  async function handleLaunch(
    managementJob: SystemJobTemplate,
    dataRetention?: number
  ): Promise<void> {
    await launchManagementJob(managementJob, dataRetention);
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
            value={dataRetention}
            onMinus={onMinus}
            onPlus={onPlus}
            onChange={handleChange}
            inputName="input"
            inputAriaLabel="number input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
            widthChars={5}
          />
        </TextContent>

        <Button
          variant="primary"
          onClick={() => {
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
