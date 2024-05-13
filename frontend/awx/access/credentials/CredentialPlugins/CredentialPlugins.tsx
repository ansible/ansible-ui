import { useTranslation } from 'react-i18next';
import {
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { PageFormExternalCredentialSelect } from './components/PageFormExternalCredentialSelect';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { useWatch } from 'react-hook-form';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGetItem } from '../../../../common/crud/useGet';
import { CredentialType } from '../../../interfaces/CredentialType';
import { PageFormSingleSelect } from '../../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { Credential } from '../../../interfaces/Credential';

export interface CredentialPluginsForm {
  source_credential: number;
  [key: string]: string | number;
}

export function CredentialPlugins({
  onCancel,
  handleSubmit,
  defaultValues,
}: {
  onCancel: () => void;
  handleSubmit: PageFormSubmitHandler<CredentialPluginsForm>;
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
    return (
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
    );
  };
  return (
    <PageLayout>
      <PageHeader title={t('Secret Management System')} />
      <AwxPageForm
        submitText={t('Finish')}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        defaultValue={defaultValues}
      >
        <PageFormSection title={t('Select external credential')}>
          <PageFormExternalCredentialSelect name="source_credential" isRequired />
        </PageFormSection>
        <CredentialSubForm />
      </AwxPageForm>
    </PageLayout>
  );
}
