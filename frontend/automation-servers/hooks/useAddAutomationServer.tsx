import { Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { PageForm, PageFormSelect, usePageDialog } from '../../../framework';
import { PageFormTextInput } from '../../../framework/PageForm/Inputs/PageFormTextInput';
import { useIsValidUrl } from '../../common/validation/useIsValidUrl';
import { AutomationServer } from '../AutomationServer';
import { useIndexDbPutItem } from '../IndexDb';
import { useAutomationServerTypes } from './useAutomationServerTypes';

const ModalFormDiv = styled.div`
  padding: 24px;
`;

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
  const isValidUrl = useIsValidUrl();
  const putIndexDbItem = useIndexDbPutItem('servers');
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const onSubmit = (automationServer: AutomationServer) => {
    void putIndexDbItem(automationServer);
    onClose();
    return Promise.resolve();
  };
  const automationServerTypes = useAutomationServerTypes();

  return (
    <Modal
      title={t('Add automation server')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <ModalFormDiv>
        <PageForm<AutomationServer>
          submitText={t('Add automation server')}
          onSubmit={onSubmit}
          isVertical
          singleColumn
          disableScrolling
          disableBody
          disablePadding
          defaultValue={{ name: '', url: '' }}
        >
          <PageFormTextInput<AutomationServer>
            label={t('Name')}
            name="name"
            placeholder={t('Enter a friendly name for the automation server')}
            isRequired
          />
          <PageFormTextInput<AutomationServer>
            label={t('Url')}
            name="url"
            placeholder={t('Enter the url of the automation server')}
            validate={isValidUrl}
            isRequired
          />
          <PageFormSelect<AutomationServer>
            label={t('Automation type')}
            name="type"
            placeholderText={t('Select automation type')}
            options={Object.values(automationServerTypes).map((automationServerType) => ({
              label: automationServerType.name,
              description: automationServerType.description,
              value: automationServerType.type,
            }))}
            isRequired
          />
        </PageForm>
      </ModalFormDiv>
    </Modal>
  );
}
