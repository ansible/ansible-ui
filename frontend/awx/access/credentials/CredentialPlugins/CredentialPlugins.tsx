import {
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '@ansible/ansible-ui-framework';
import { PageFormSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { Credential } from '../../../interfaces/Credential';
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialsTestButton } from '../utils/CredentialsTestButton';
import { PageFormExternalCredentialSelect } from './components/PageFormExternalCredentialSelect';

export interface CredentialPluginsForm {
  source_credential: number;
  [key: string]: string | number;
}

export interface CredentialsRetainInput {
  metadata: Record<string, unknown>;
}

export function CredentialPlugins({
  onCancel,
  handleSubmit,
  handleTest,
  defaultValues,
}: {
  onCancel: () => void;
  handleSubmit: PageFormSubmitHandler<CredentialPluginsForm>;
  handleTest: (data: CredentialPluginsForm) => Promise<void>;
  defaultValues?: CredentialPluginsForm;
}) {
  const { t } = useTranslation();

  const CredentialSubForm = () => {
    const watchedCredentialTypeId = useWatch<{ source_credential: number }>({
      name: 'source_credential',
    });
    const useCredentialFields = (credentialId: number) => {
      const { data } = useGetItem<Credential>(awxAPI`/credentials/`, credentialId);
      const { data: credentialType } = useGetItem<CredentialType>(
        awxAPI`/credential_types/`,
        data?.summary_fields?.credential_type?.id
      );
      return credentialType as CredentialType;
    };

    const credentialType = useCredentialFields(watchedCredentialTypeId);

    if (!credentialType) {
      return null;
    }
    return credentialType?.inputs?.metadata ? (
      <PageFormSection title={t('Metadata')}>
        {credentialType?.inputs?.metadata.map((input) => {
          if ('choices' in input) {
            return (
              <PageFormSingleSelect
                defaultValue={input?.default}
                name={input.id}
                key={input.id}
                label={input.label}
                placeholder={input.label}
                labelHelp={input.help_text}
                options={
                  input.choices
                    ? input.choices?.map((choice) => ({ label: choice, value: choice }))
                    : []
                }
                isRequired={credentialType.inputs.required.includes(input.id)}
              />
            );
          }
          if (!input.multiline) {
            return (
              <PageFormTextInput
                name={input.id}
                key={input.id}
                label={input.label}
                type={'text'}
                labelHelp={input.help_text}
                isRequired={credentialType.inputs.required.includes(input.id)}
              />
            );
          }
          if (input.multiline) {
            return (
              <PageFormTextArea
                name={input.id}
                key={input.id}
                label={input.label}
                labelHelp={input.help_text}
                isRequired={credentialType.inputs.required.includes(input.id)}
              />
            );
          }
        })}
      </PageFormSection>
    ) : null;
  };
  return (
    <PageLayout>
      <PageHeader title={t('Secret Management System')} />
      <AwxPageForm
        submitText={t('Finish')}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        defaultValue={defaultValues}
        additionalActions={<CredentialsTestButton handleTest={handleTest} />}
      >
        <PageFormSection title={t('Select external credential')}>
          <PageFormExternalCredentialSelect name="source_credential" isRequired />
        </PageFormSection>
        <CredentialSubForm />
      </AwxPageForm>
    </PageLayout>
  );
}
