import {
  IPageAlertToaster,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
  usePageAlertToaster,
  usePageDialogs,
} from '@ansible/ansible-ui-framework';
import { useEffect, useState } from 'react';
import { EdaCredentialType, EdaCredentialTypeField } from '../../../interfaces/EdaCredentialType';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { isFieldRequired } from '../CredentialFormTypes';
import { useTranslation } from 'react-i18next';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { AlertProps, Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { EdaPageForm } from '../../../common/EdaPageForm';
import { edaAPI } from '../../../common/eda-utils';

export interface CredentialsExternalTestModalProps {
  credential?: EdaCredential;
  credentialType: EdaCredentialType;
  watchedSubFormFields: unknown[];
}

export interface CredentialsRetainInput {
  inputs: object;
  metadata: { [k: string]: string };
}

export function useCredentialsTestModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<CredentialsExternalTestModalProps>();
  const toaster = usePageAlertToaster();

  useEffect(() => {
    if (props) {
      pushDialog(
        <CredentialsExternalTestModal
          {...{ ...props, popDialog: popDialog, alertToaster: toaster }}
        />
      );
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog, toaster]);

  return setProps;
}

function CredentialsExternalTestModal(
  props: CredentialsExternalTestModalProps & { popDialog: () => void } & {
    alertToaster: IPageAlertToaster;
  }
) {
  const { t } = useTranslation();
  const postRequest = usePostRequest<CredentialsRetainInput>();
  const alertToaster = props.alertToaster;

  const onSubmit: PageFormSubmitHandler<CredentialsRetainInput> = async (
    retainInput: CredentialsRetainInput
  ) => {
    const alert: AlertProps = {
      variant: 'success',
      title: t('Test passed.'),
      timeout: 2000,
    };

    const populatedInput = Object.fromEntries(
      Object.entries(retainInput).map(([key, value]) => [key, value || ''])
    );

    const payload = {
      inputs:
        props.credentialType.inputs?.fields?.reduce(
          (filteredInputs, field, idx) => {
            filteredInputs[field.id] = props.watchedSubFormFields[idx] || field.default || '';
            return filteredInputs;
          },
          {} as Record<string, unknown>
        ) || {},
      metadata: populatedInput,
    };
    props.credential
      ? await postRequest(edaAPI`/eda-credentials/${String(props.credential.id)}/test/`, payload)
          .then(() => {
            alertToaster.addAlert(alert);
          })
          .catch((error) => {
            alertToaster.addAlert({
              variant: 'danger',
              title: t('Something went wrong with the request to test this credential.'),
              children: error instanceof Error && error.message,
            });
          })
      : await postRequest(
          edaAPI`/credential-types/${String(props.credentialType.id)}/test/`,
          payload
        )
          .then(() => {
            alertToaster.addAlert(alert);
          })
          .catch((error) => {
            alertToaster.addAlert({
              variant: 'danger',
              title: t('Something went wrong with the request to test this credential.'),
              children: error instanceof Error && error.message,
            });
          });
  };
  const onCancel = () => props.popDialog();

  return (
    <Modal
      aria-label={t(`Test external credential`)}
      variant={ModalVariant.small}
      position="default"
      isOpen
      onClose={() => props.popDialog()}
    >
      <ModalHeader title={t`Test external credential`} />
      <ModalBody>
        <EdaPageForm
          submitText={t('Run')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          singleColumn
          defaultValue={
            props.credential && props.credentialType.inputs?.metadata
              ? props.credentialType.inputs.metadata.reduce(
                  (acc, field: EdaCredentialTypeField) => {
                    if (props.credential?.inputs && field.id in props.credential.inputs) {
                      acc[field.id] = props.credential.inputs[field.id];
                    }
                    return acc;
                  },
                  {} as Record<string, unknown>
                )
              : {}
          }
        >
          {props.credentialType.inputs?.metadata?.map((field: EdaCredentialTypeField) => {
            const isRequired = isFieldRequired(props.credentialType.inputs?.required, field.id);
            if (field.type === 'string') {
              if (field.choices) {
                return (
                  <PageFormSelect
                    key={field.id}
                    name={field.id}
                    label={field.label}
                    labelHelp={field.help_text}
                    isRequired={isRequired}
                    options={field.choices.map((choice) => ({
                      value: choice,
                      key: choice,
                      label: choice,
                    }))}
                  />
                );
              }

              if (field.multiline) {
                return (
                  <PageFormTextArea
                    key={field.id}
                    name={field.id}
                    label={field.label}
                    labelHelp={field.help_text}
                    isRequired={isRequired}
                  />
                );
              }

              return (
                <PageFormTextInput
                  key={field.id}
                  name={field.id}
                  label={field.label}
                  labelHelp={field.help_text}
                  type="text"
                  isRequired={isRequired}
                />
              );
            }

            return null;
          })}
        </EdaPageForm>
      </ModalBody>
    </Modal>
  );
}
