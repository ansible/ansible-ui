import { useTranslation } from 'react-i18next';
import {
  IPageAlertToaster,
  PageFormSubmitHandler,
  usePageAlertToaster,
  usePageDialogs,
} from '../../../../../../framework';
import { AlertProps, Modal, ModalVariant } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { CredentialType } from '../../../../interfaces/CredentialType';
import { CredentialPluginsForm, CredentialPlugins } from '../CredentialPlugins';
import { CredentialInputSource } from '../../../../interfaces/CredentialInputSource';
import { postRequest } from '../../../../../common/crud/Data';
import { awxAPI } from '../../../../common/api/awx-utils';

export interface CredentialPluginsInputSource
  extends Omit<CredentialInputSource, 'target_credential' | 'summary_fields'> {}

export interface CredentialPluginsModalProps {
  field: CredentialType['inputs']['fields'][0];
  setCredentialPluginValues: (values: CredentialPluginsInputSource[]) => void;
  onClose?: () => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
}

function CredentialPluginsModal(
  props: CredentialPluginsModalProps & { alertToaster: IPageAlertToaster }
) {
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

  const handleTest = (data: CredentialPluginsForm) => {
    return new Promise<void>((resolve, reject) => {
      const { source_credential, ...rest } = data;
      const alert: AlertProps = {
        variant: 'success',
        title: t('Test passed.'),
        timeout: 2000,
      };

      const payload = {
        metadata: rest,
      };

      postRequest(awxAPI`/credentials/${String(source_credential)}/test/`, payload)
        .then(() => {
          props.alertToaster.addAlert(alert);
        })
        .catch((error) => {
          props.alertToaster.addAlert({
            variant: 'danger',
            title: t('Something went wrong with the request to test this credential.'),
            children: error instanceof Error && error.message,
          });
        });
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
        handleTest={handleTest}
        defaultValues={getDefaultValues()}
      />
    </Modal>
  );
}

export function useCredentialPluginsModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<CredentialPluginsModalProps>();
  const toaster = usePageAlertToaster();

  useEffect(() => {
    if (props) {
      pushDialog(<CredentialPluginsModal {...props} onClose={popDialog} alertToaster={toaster} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog, toaster]);
  return setProps;
}
