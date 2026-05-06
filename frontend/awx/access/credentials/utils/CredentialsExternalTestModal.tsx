import {
  IPageAlertToaster,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
} from '@ansible/ansible-ui-framework';
import { PageFormJobTemplateSelect } from '../../../resources/templates/components/PageFormJobTemplateSelect';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import {
  Alert,
  AlertProps,
  Button,
  CodeBlock,
  CodeBlockCode,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { Credential } from '../../../interfaces/Credential';
import { CredentialInputField, CredentialType } from '../../../interfaces/CredentialType';
import { CredentialTestResponse } from '../../../interfaces/CredentialTestResponse';

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
  const postRequest = usePostRequest<CredentialsRetainInput, CredentialTestResponse>();
  const alertToaster = props.alertToaster;
  const [testResponse, setTestResponse] = useState<CredentialTestResponse | null>(null);
  const [testFailed, setTestFailed] = useState(false);
  const [lastFormValues, setLastFormValues] = useState<Record<string, string> | undefined>(
    undefined
  );

  // Check if this is an OIDC credential type
  const isOidcCredential =
    props.credentialType?.namespace === 'hashivault-kv-oidc' ||
    props.credentialType?.namespace === 'hashivault-ssh-oidc';

  // Check if response has JWT payload
  const hasJwtPayload = Boolean(testResponse?.details?.sent_jwt_payload);

  // Dynamic modal title
  const modalTitle =
    testResponse && hasJwtPayload ? t('Payload of JWT') : t('Test external credential');

  const onSubmit: PageFormSubmitHandler<CredentialsRetainInput> = async (
    retainInput: CredentialsRetainInput
  ) => {
    const populatedInput = Object.fromEntries(
      Object.entries(retainInput).map(([key, value]) => [key, value || ''])
    );
    setLastFormValues(populatedInput as Record<string, string>);

    const payload = {
      inputs: props.credentialType.inputs.fields.reduce(
        (filteredInputs, field, idx) => {
          filteredInputs[field.id] =
            props.watchedSubFormFields[idx] !== undefined
              ? props.watchedSubFormFields[idx]
              : (props.credentialType.inputs.fields[idx].default ?? '');
          return filteredInputs;
        },
        {} as Record<string, unknown>
      ),
      metadata: populatedInput,
    };

    const endpoint = props.credential
      ? awxAPI`/credentials/${String(props.credential.id)}/test/`
      : awxAPI`/credential_types/${String(props.credentialType.id)}/test/`;

    try {
      const response = await postRequest(endpoint, payload);
      const isFailed = response.status === 'failed';

      // Store response for OIDC credentials with JWT payload
      if (isOidcCredential && response?.details?.sent_jwt_payload) {
        setTestFailed(isFailed);
        setTestResponse(response);
      } else {
        // For non-OIDC credentials, show simple toast alert and close modal
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
        alertToaster.addAlert(alert);
        if (!isFailed) props.popDialog();
      }
    } catch (error) {
      const errorData = (error as { json?: unknown })?.json as CredentialTestResponse | undefined;
      if (isOidcCredential && errorData?.details?.sent_jwt_payload) {
        setTestFailed(true);
        setTestResponse(errorData);
        return;
      }
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Something went wrong with the request to test this credential.'),
        children: error instanceof Error && error.message,
      });
    }
  };
  const onCancel = () => props.popDialog();

  return (
    <Modal
      aria-label={modalTitle}
      variant={ModalVariant.small}
      position="default"
      isOpen
      onClose={() => props.popDialog()}
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
              style={{ marginBottom: '16px' }}
            />
            <p style={{ marginBottom: '16px' }}>
              {t('JWT claims associated to the Controller job template:')}
            </p>
            <CodeBlock>
              <CodeBlockCode>
                {JSON.stringify(testResponse.details?.sent_jwt_payload, null, 2)}
              </CodeBlockCode>
            </CodeBlock>
          </>
        ) : (
          <AwxPageForm
            submitText={t('Run')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            singleColumn
            defaultValue={lastFormValues}
          >
            {/* Render metadata fields in order */}
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

            {/* Add job template selector for OIDC credentials after other fields */}
            {isOidcCredential && (
              <PageFormJobTemplateSelect
                key="job_template_id"
                name="job_template_id"
                id="job-template-select"
                label={t('Controller Job Template')}
                isRequired
              />
            )}
          </AwxPageForm>
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
              <Button variant="link" onClick={() => props.popDialog()}>
                {t('Cancel')}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => props.popDialog()}>
              {t('Close')}
            </Button>
          )}
        </ModalFooter>
      )}
    </Modal>
  );
}
