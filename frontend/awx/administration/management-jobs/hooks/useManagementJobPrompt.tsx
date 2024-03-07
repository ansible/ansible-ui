import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
//import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { usePageDialogs } from '../../../../../framework';
import { Button, Modal, ModalVariant, TextInput } from '@patternfly/react-core';
//import { useLaunchManagementJob } from './useLaunchManagementJob';
import { TextContent, Text } from '@patternfly/react-core';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';

export function useManagementJobPrompt() {
  const defaultDays: number = 3;
  const [dataRetention, setDataRetention] = useState(defaultDays);
  const { t } = useTranslation();
  const { pushDialog, popDialog } = usePageDialogs();
 // const launchPromptManagementJob = useLaunchManagementJob();

  const managementJobPrompt = (managementJob: SystemJobTemplate) => {
    const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      setDataRetention(parseInt(value) || 0);
      console.log(dataRetention);
    };

    const handleCancel = () => {
      popDialog();
      //setDataRetention(defaultDays);
    };

    const handleLaunch = () => {
      console.log('launch button from', managementJob);
      popDialog();
    };

    const dialog = (
      <Modal
        title={t('Launch Management Job')}
        titleIconVariant="info"
        isOpen
        width="20%"
        key="launch"
        onClose={popDialog}
        variant={ModalVariant.small}
      >
        <TextContent>
          <Text>{t`Set how many days of data should be retained.`}</Text>

          <TextInput
            id="data-retention"
            value={dataRetention}
            type="number"
            onChange={handleChange}
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
