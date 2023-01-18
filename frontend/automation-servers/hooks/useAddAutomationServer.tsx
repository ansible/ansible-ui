import { Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageForm, PageFormSelectOption, usePageDialog } from '../../../framework';
import { PageFormTextInput } from '../../../framework/PageForm/Inputs/PageFormTextInput';
import { useAutomationServers } from '../contexts/AutomationServerProvider';
import { AutomationServer } from '../interfaces/AutomationServer';
import { AutomationServerType } from '../interfaces/AutomationServerType';

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
    <Modal
      title={t('Add automation server')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <div style={{ padding: 24 }}>
        <PageForm
          submitText={t('Add automation server')}
          onSubmit={onSubmit}
          isVertical
          singleColumn
          disableScrolling
          disableBody
          disablePadding
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
                label: t('AWX Ansible server'),
                description: t(
                  'Define, operate, scale, and delegate automation across your enterprise.'
                ),
                value: AutomationServerType.AWX,
              },
              {
                label: t('Galaxy Ansible server'),
                description: t('Discover, publish, and manage your Ansible collections.'),
                value: AutomationServerType.Galaxy,
              },
              {
                label: t('Event-driven Ansible server'),
                description: t(
                  'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
                ),
                value: AutomationServerType.EDA,
              },
            ]}
            isRequired
          />
        </PageForm>
      </div>
    </Modal>
  );
}
