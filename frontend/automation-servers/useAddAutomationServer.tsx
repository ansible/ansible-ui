import { Modal, ModalVariant } from '@patternfly/react-core';
import { Static, Type } from '@sinclair/typebox';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageForm, PageFormSelectOption, usePageDialog } from '../../framework';
import { PageFormTextInput } from '../../framework/PageForm/Inputs/PageFormTextInput';
import { useAutomationServers } from './AutomationServerProvider';

export function useAddAutomationServer() {
  const [_, setDialog] = usePageDialog();
  const addAutomationServer = useCallback(
    () => setDialog(<AddAutomationServerDialog />),
    [setDialog]
  );
  return addAutomationServer;
}

const DataType = Type.Object({ name: Type.String(), url: Type.String(), type: Type.String() });
type Data = Static<typeof DataType>;

export function AddAutomationServerDialog() {
  const { t } = useTranslation();

  const { setAutomationServers } = useAutomationServers();

  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const onSubmit = (data: Data) => {
    setAutomationServers((servers) => [...servers.filter((a) => a.url !== data.url), data]);
    onClose();
    return Promise.resolve();
  };

  return (
    <Modal title={t('Add automation server')} isOpen onClose={onClose} variant={ModalVariant.small}>
      <PageForm
        schema={DataType}
        submitText={t('Add automation server')}
        cancelText={t('Cancel')}
        onSubmit={onSubmit}
        defaultValue={{ type: 'controller' }}
        singleColumn
        disableScrolling
      >
        <PageFormTextInput
          name="name"
          label={t('Name')}
          placeholder={t('Enter a friendly name for the automation server')}
          isRequired
        />
        <PageFormTextInput
          name="url"
          label={t('Url')}
          placeholder={t('Enter the url of the automation server')}
          isRequired
        />
        <PageFormSelectOption
          name="type"
          label={t('Type')}
          placeholderText={t('Enter the url of the automation server')}
          isRequired
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
        />
      </PageForm>
    </Modal>
  );
}
