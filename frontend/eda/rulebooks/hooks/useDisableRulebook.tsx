import { Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageForm, usePageDialog } from '../../../../framework';
import { PageFormSchema } from '../../../../framework/PageForm/PageFormSchema';
import { EdaRulebook } from '../../interfaces/EdaRulebook';

export function useDisableRulebook() {
  const [_, setDialog] = usePageDialog();
  const disableRulebook = useCallback(
    (rulebook: EdaRulebook) => setDialog(<DisableRulebookDialog rulebook={rulebook} />),
    [setDialog]
  );
  return disableRulebook;
}

export function DisableRulebookDialog({ rulebook: EdaRulebook }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const onSubmit = (data: EdaRulebook) => {
    onClose();
    return Promise.resolve();
  };

  return (
    <Modal title={t('Disable')} isOpen onClose={onClose} variant={ModalVariant.small}>
      <PageForm
        schema={DataType}
        submitText={t('Disable rulebook')}
        cancelText={t('Cancel')}
        onSubmit={onSubmit}
        singleColumn
        disableScrolling
      >
        <PageFormSchema schema={DataType} />
      </PageForm>
    </Modal>
  );
}
