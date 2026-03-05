import {
  IPageAlertToaster,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
} from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { AlertProps, Modal, ModalHeader, ModalVariant, ModalBody } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { Credential } from '../../../interfaces/Credential';
import { CredentialInputField, CredentialType } from '../../../interfaces/CredentialType';

export interface CredentialsExternalTestModalProps {
  credential?: Credential;
  credentialType: CredentialType;
  watchedSubFormFields: unknown[];
}

export interface CredentialsRetainInput {
  inputs: object;
  metadata: { [k: string]: string };
}

export function CredentialsExternalTestModal(
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
      inputs: props.credentialType.inputs.fields.reduce(
        (filteredInputs, field, idx) => {
          filteredInputs[field.id] =
            props.watchedSubFormFields[idx] ||
            props.credentialType.inputs.fields[idx].default ||
            '';
          return filteredInputs;
        },
        {} as Record<string, unknown>
      ),
      metadata: populatedInput,
    };
    props.credential
      ? await postRequest(awxAPI`/credentials/${String(props.credential.id)}/test/`, payload)
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
          awxAPI`/credential_types/${String(props.credentialType.id)}/test/`,
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
      disableFocusTrap={process.env.NODE_ENV === 'test'}
    >
      <ModalHeader title={t`Test external credential`} />
      <ModalBody>
        <AwxPageForm
          submitText={t('Run')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          singleColumn
        >
          {props.credentialType.inputs.metadata.map((field: CredentialInputField) => {
            const isRequired = props.credentialType.inputs?.required.includes(field.id);
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
        </AwxPageForm>
      </ModalBody>
    </Modal>
  );
}
