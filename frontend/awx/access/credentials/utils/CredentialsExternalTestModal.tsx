import { AlertProps, Modal } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { CredentialInputField, CredentialType } from '../../../interfaces/CredentialType';
import {
  IPageAlertToaster,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
} from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { Credential } from '../../../interfaces/Credential';

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
      variant="small"
      position="default"
      title={t`Test external credential`}
      hasNoBodyWrapper
      isOpen
      onClose={() => props.popDialog()}
    >
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
    </Modal>
  );
}
