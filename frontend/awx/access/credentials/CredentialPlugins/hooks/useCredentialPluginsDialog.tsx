import {
  IPageAlertToaster,
  PageFormSubmitHandler,
  usePageAlertToaster,
  usePageDialogs,
} from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import {
  Alert,
  AlertProps,
  Button,
  CodeBlock,
  CodeBlockCode,
  Modal,
  ModalVariant,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../../common/api/awx-utils';
import { CredentialInputSource } from '../../../../interfaces/CredentialInputSource';
import { CredentialTestResponse } from '../../../../interfaces/CredentialTestResponse';
import { CredentialType } from '../../../../interfaces/CredentialType';
import { CredentialPlugins, CredentialPluginsForm } from '../CredentialPlugins';

export interface CredentialPluginsInputSource
  extends Omit<CredentialInputSource, 'target_credential' | 'summary_fields'> {}

export interface CredentialPluginsModalProps {
  field: CredentialType['inputs']['fields'][0];
  setCredentialPluginValues: (values: CredentialPluginsInputSource[]) => void;
  onClose?: () => void;
  accumulatedPluginValues?: CredentialPluginsInputSource[];
}

interface CredentialsRetainInput {
  metadata: Record<string, unknown>;
}

export function CredentialPluginsModal(
  props: CredentialPluginsModalProps & { alertToaster: IPageAlertToaster }
) {
  const { t } = useTranslation();
  const postRequest = usePostRequest<CredentialsRetainInput, CredentialTestResponse>();
  const [testResponse, setTestResponse] = useState<CredentialTestResponse | null>(null);
  const [testFailed, setTestFailed] = useState(false);
  const [lastFormValues, setLastFormValues] = useState<Record<string, string | number> | undefined>(
    undefined
  );

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

  const defaultValues = getDefaultValues();

  const hasJwtPayload = Boolean(testResponse?.details?.sent_jwt_payload);
  const modalTitle = testResponse && hasJwtPayload ? t('Payload of JWT') : t('Credential Plugins');

  const handleSubmit: PageFormSubmitHandler<CredentialPluginsForm> = (data) => {
    const { source_credential, job_template_id: _job_template_id, ...rest } = data;
    props.setCredentialPluginValues([
      {
        input_field_name: props.field.id,
        metadata: { ...rest },
        source_credential,
      },
    ]);
    onClose();
    return Promise.resolve();
  };

  const handleTest = async (data: CredentialPluginsForm) => {
    const { source_credential, job_template_id, ...rest } = data;
    // Store form values for retry functionality
    setLastFormValues({ ...rest, ...(job_template_id && { job_template_id }) });

    const payload = {
      metadata: {
        ...rest,
        ...(job_template_id && { job_template_id }),
      },
    };

    try {
      const response = await postRequest(
        awxAPI`/credentials/${String(source_credential)}/test/`,
        payload
      );
      const isFailed = response.status === 'failed';

      if (response?.details?.sent_jwt_payload) {
        setTestFailed(isFailed);
        setTestResponse(response);
      } else {
        const alert: AlertProps = isFailed
          ? {
              variant: 'danger',
              title: t('Test failed.'),
            }
          : {
              variant: 'success',
              title: t('Test passed.'),
              timeout: 2000,
            };
        props.alertToaster.addAlert(alert);
        if (!isFailed) onClose();
      }
    } catch (error) {
      const errorData = (error as { json?: unknown })?.json as CredentialTestResponse | undefined;
      if (errorData?.details?.sent_jwt_payload) {
        setTestFailed(true);
        setTestResponse(errorData);
        return;
      }
      props.alertToaster.addAlert({
        variant: 'danger',
        title: t('Something went wrong with the request to test this credential.'),
        children: error instanceof Error && error.message,
      });
    }
  };

  return (
    <Modal
      aria-label={modalTitle}
      variant={ModalVariant.large}
      position="default"
      isOpen
      onClose={onClose}
      disableFocusTrap={process.env.NODE_ENV === 'test'}
    >
      <ModalHeader title={modalTitle} />
      <ModalBody>
        {testResponse && hasJwtPayload ? (
          <>
            <Alert
              variant={testFailed ? 'danger' : 'success'}
              title={
                testFailed
                  ? t('Something went wrong with the request to test this credential.')
                  : t('Test passed.')
              }
              isInline
              customIcon={testFailed ? <ExclamationCircleIcon /> : <CheckCircleIcon />}
              className="pf-v6-u-mb-md"
            />
            <p className="pf-v6-u-mb-md">
              {t('JWT claims associated to the Controller job template:')}
            </p>
            <CodeBlock>
              <CodeBlockCode>
                {JSON.stringify(testResponse.details?.sent_jwt_payload, null, 2)}
              </CodeBlockCode>
            </CodeBlock>
          </>
        ) : (
          <CredentialPlugins
            onCancel={onClose}
            handleSubmit={handleSubmit}
            handleTest={handleTest}
            defaultValues={
              lastFormValues && defaultValues
                ? ({ ...defaultValues, ...lastFormValues } as CredentialPluginsForm)
                : defaultValues
            }
          />
        )}
      </ModalBody>
      {testResponse && hasJwtPayload && (
        <ModalFooter>
          {testFailed ? (
            <>
              <Button
                variant="primary"
                onClick={() => {
                  setTestResponse(null);
                  setTestFailed(false);
                }}
              >
                {t('Retry')}
              </Button>
              <Button variant="link" onClick={onClose}>
                {t('Cancel')}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={onClose}>
              {t('Close')}
            </Button>
          )}
        </ModalFooter>
      )}
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
