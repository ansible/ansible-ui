import { useTranslation } from 'react-i18next';
import { PageFormSubmitHandler, usePageDialog } from '../../../../../../framework';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { CredentialType } from '../../../../interfaces/CredentialType';
import { CredentialPluginsForm, CredentialPlugins } from '../CredentialPlugins';

export interface CredentialPluginsModalProps {
  field: CredentialType['inputs']['fields'][0];
  setCredentialPluginValues: (values: { [key: string]: CredentialPluginsForm }) => void;
  onClose?: () => void;
}

function CredentialPluginsModal(props: CredentialPluginsModalProps) {
  const [_dialog, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const onClose = () => {
    setDialog(undefined);
    props.onClose?.();
  };

  const handleSubmit: PageFormSubmitHandler<CredentialPluginsForm> = (
    data: CredentialPluginsForm
  ) => {
    return new Promise<void>((resolve, reject) => {
      props.setCredentialPluginValues({ [props.field.id]: data });
      onClose();
      try {
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
  return (
    <Modal
      aria-label={t('Credential Plugins')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.large}
    >
      <CredentialPlugins onCancel={onClose} handleSubmit={handleSubmit} />
    </Modal>
  );
}

export function useCredentialPluginsModal() {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<CredentialPluginsModalProps>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      setDialog(<CredentialPluginsModal {...props} onClose={onCloseHandler} />);
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog]);
  return setProps;
}
