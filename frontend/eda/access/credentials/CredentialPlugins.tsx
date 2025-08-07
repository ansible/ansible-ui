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
import { useWatch, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@patternfly/react-core';
import { edaAPI } from '../../common/eda-utils';
import { EdaPageForm } from '../../common/EdaPageForm';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { isFieldRequired } from './CredentialFormTypes';
import { PageFormSingleSelectEdaResource } from '../../common/PageFormSingleSelectEdaResource';

function CredentialsTestButton({
  handleTest,
}: {
  handleTest: (data: CredentialPluginsForm) => Promise<void>;
}) {
  const { t } = useTranslation();
  const {
    getValues,
    formState: { isValid },
  } = useFormContext<CredentialPluginsForm>();

  const getData = () => {
    const formData = getValues();
    void handleTest(formData);
  };

  return (
    <Button variant="secondary" onClick={getData} isDisabled={!isValid}>
      {t('Test')}
    </Button>
  );
}

function CredentialSubForm() {
  const { t } = useTranslation();
  const watchedCredentialTypeId = useWatch<{ source_credential: number }>({
    name: 'source_credential',
  });

  const useCredentialFields = (credentialId: number) => {
    const { data } = useGetItem<EdaCredential>(edaAPI`/eda-credentials/`, credentialId);
    const { data: credentialType } = useGetItem<EdaCredentialType>(
      edaAPI`/credential-types/`,
      data?.credential_type?.id
    );
    return credentialType as EdaCredentialType;
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
              isRequired={isFieldRequired(credentialType.inputs?.required, input.id)}
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
              isRequired={isFieldRequired(credentialType.inputs?.required, input.id)}
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
              isRequired={isFieldRequired(credentialType.inputs?.required, input.id)}
            />
          );
        }
      })}
    </PageFormSection>
  ) : null;
}

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

  return (
    <PageLayout>
      <PageHeader title={t('Secret Management System')} />
      <EdaPageForm
        submitText={t('Finish')}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        defaultValue={defaultValues}
        additionalActions={<CredentialsTestButton handleTest={handleTest} />}
      >
        <PageFormSection title={t('Select external credential')}>
          <PageFormSingleSelectEdaResource<EdaCredential>
            name="source_credential"
            id="id"
            label={t('External credential')}
            placeholder={t('Select external credential')}
            queryPlaceholder={t('Loading credentials...')}
            queryErrorText={t('Error loading credentials')}
            isRequired
            url={edaAPI`/eda-credentials/?credential_type__kind=external`}
            tableColumns={[]}
            toolbarFilters={[]}
          />
        </PageFormSection>
        <CredentialSubForm />
      </EdaPageForm>
    </PageLayout>
  );
}
