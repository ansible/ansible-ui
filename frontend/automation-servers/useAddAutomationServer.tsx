import { Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageForm, PageFormSelectOption, usePageDialog } from '../../framework';
import { PageFormTextInput } from '../../framework/PageForm/Inputs/PageFormTextInput';
import { AutomationServer } from './AutomationServer';
import { useAutomationServers } from './AutomationServerProvider';

export function useAddAutomationServer() {
  const [_, setDialog] = usePageDialog();
  const addAutomationServer = useCallback(
    () => setDialog(<AddAutomationServerDialog />),
    [setDialog]
  );
  return addAutomationServer;
}

export function AddAutomationServerDialog() {
  const { t } = useTranslation();

  const { setAutomationServers } = useAutomationServers();

  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const onSubmit = (data: AutomationServer) => {
    setAutomationServers((servers) => [...servers.filter((a) => a.url !== data.url), data]);
    onClose();
    return Promise.resolve();
  };

  return (
    <Modal title={t('Add automation server')} isOpen onClose={onClose} variant={ModalVariant.small}>
      <PageForm
        submitText={t('Add automation server')}
        onSubmit={onSubmit}
        defaultValue={{ type: 'controller' }}
        isVertical
        singleColumn
        disableScrolling
      >
        <PageFormTextInput
          label={t('Name')}
          name="name"
          placeholder={t('Enter a friendly name for the automation server')}
          isRequired
        />
        <PageFormTextInput
          label={t('Url')}
          name="url"
          placeholder={t('Enter the url of the automation server')}
          isRequired
        />
        <PageFormSelectOption
          label={t('Automation type')}
          name="type"
          placeholderText={t('Select automation type')}
          options={[
            {
              label: t('Automation controller'),
              description: t(
                'Define, operate, scale, and delegate automation across your enterprise.'
              ),
              value: 'controller',
            },
            {
              label: t('Automation hub'),
              description: t('Discover, publish, and manage your Ansible Collections.'),
              value: 'hub',
            },
            {
              label: t('Event driven'),
              // description: t('Discover, publish, and manage your Ansible Collections.'),
              value: 'eda',
            },
          ]}
          isRequired
        />
      </PageForm>
    </Modal>
  );
}
