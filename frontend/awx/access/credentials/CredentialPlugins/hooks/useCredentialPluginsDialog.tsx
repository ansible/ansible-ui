import { useTranslation } from 'react-i18next';
import { PageFormSubmitHandler, usePageDialogs } from '../../../../../../framework';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { CredentialType } from '../../../../interfaces/CredentialType';
import { CredentialPluginsForm, CredentialPlugins } from '../CredentialPlugins';
import { CredentialInputSource } from '../../../../interfaces/CredentialInputSource';

export interface CredentialPluginsInputSource
  extends Omit<CredentialInputSource, 'target_credential' | 'summary_fields'> {}

export interface CredentialPluginsModalProps {
  field: CredentialType['inputs']['fields'][0];
  setCredentialPluginValues: (values: CredentialPluginsInputSource[]) => void;
  onClose?: () => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
}

function CredentialPluginsModal(props: CredentialPluginsModalProps) {
  const { t } = useTranslation();
  const onClose = () => {
    props.onClose?.();
  };

  function getDefaultValues(): CredentialPluginsForm | undefined {
    const pluginValues = props.accumulatedPluginValues?.find(
      (plugin) => plugin.input_field_name === props.field.id
    );
    if (pluginValues) {
      const { metadata, source_credential } = pluginValues;
      return {
        source_credential,
        ...metadata,
      };
    } else {
      return undefined;
    }
  }

  const handleSubmit: PageFormSubmitHandler<CredentialPluginsForm> = (data) => {
    return new Promise<void>((resolve, reject) => {
      const { source_credential, ...rest } = data;
      props.setCredentialPluginValues([
        {
          input_field_name: props.field.id,
          metadata: {
            ...rest,
          },
          source_credential: source_credential,
        },
      ]);
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
      <CredentialPlugins
        onCancel={onClose}
        handleSubmit={handleSubmit}
        defaultValues={getDefaultValues()}
      />
    </Modal>
  );
}

export function useCredentialPluginsModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<CredentialPluginsModalProps>();
  useEffect(() => {
    if (props) {
      pushDialog(<CredentialPluginsModal {...props} onClose={popDialog} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog]);
  return setProps;
}
