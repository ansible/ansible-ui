import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
//import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { usePageDialogs } from '../../../../../framework';
import { Button, Modal, NumberInput, ModalVariant } from '@patternfly/react-core';
//import { useLaunchManagementJob } from './useLaunchManagementJob';
import { TextContent, Text } from '@patternfly/react-core';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function useManagementJobPrompt() {
  const defaultDays: number = 3;
  const [dataRetention, setDataRetention] = useState(defaultDays);
  const { t } = useTranslation();
  const { pushDialog, popDialog } = usePageDialogs();
  //const [isManagementPromptOpen, setIsManagementPromptOpen] = useState(false);
  //const launchManagementJob = useLaunchManagementJob();
  const managementJobPrompt = (managementJob: SystemJobTemplate) => {
    const onMinus = () => {
      setDataRetention((prevDataRetention) => Math.max((prevDataRetention || 0) - 1, 0));
    };

    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      setDataRetention(parseInt(value) || 0);
      console.log(dataRetention);
    };

    const onPlus = () => {
      setDataRetention((prevDataRetention) => (prevDataRetention || 0) + 1);
      console.log(dataRetention);
    };
    const handleCancel = () => {
      popDialog();
      setDataRetention(defaultDays);
    };

    const handleLaunch = () => {
      console.log(dataRetention);
      popDialog();
      return dataRetention;
    };

    // const managementJobPrompt = (managementJob: SystemJobTemplate) => {
    const dialog = (
      <Modal
        title={t('Launch Management Job')}
        titleIconVariant="info"
        isOpen
        width="25%"
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
            type="number"
            onChange={handleChange}
            inputName="input"
            inputAriaLabel="number input"
            minusBtnAriaLabel="minus"
            plusBtnAriaLabel="plus"
            widthChars={5}
            aria-label="Number input example"
          />
        </TextContent>

        <Button variant="primary" onClick={() => handleLaunch(managementJob, dataRetention)}>
          {t('Launch')}
        </Button>

        <Button key="cancel" variant="link" onClick={handleCancel}>
          {t('Cancel')}
        </Button>
      </Modal>
    );
    pushDialog(dialog);
  };
  return managementJobPrompt;
}
