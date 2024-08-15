import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetail, PageDetails } from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { jsonToYaml } from '../../../../../framework/utils/codeEditorUtils';
import { useGetItem } from '../../../../common/crud/useGet';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { edaAPI } from '../../../common/eda-utils';

export function CredentialTypeDetails() {
  const params = useParams<{ id: string }>();
  const { data: credentialType } = useGetItem<EdaCredentialType>(
    edaAPI`/credential-types/`,
    params.id
  );
  return credentialType ? <CredentialTypeDetailInner credentialType={credentialType} /> : null;
}

export function CredentialTypeDetailInner(props: { credentialType: EdaCredentialType }) {
  const { t } = useTranslation();

  function renderCredentialTypeName(credentialType: EdaCredentialType) {
    if (credentialType.managed) {
      return (
        <>
          {credentialType.name}
          <Label style={{ marginLeft: '10px' }}>{t('Read-only')}</Label>
        </>
      );
    } else {
      return <>{credentialType.name}</>;
    }
  }

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{renderCredentialTypeName(props.credentialType)}</PageDetail>
      <PageDetail label={t('Description')}>{props.credentialType.description}</PageDetail>
      <PageDetailCodeEditor
        helpText={t(
          'Input schema which defines a set of ordered fields for that type, either in JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.'
        )}
        label={t('Input configuration')}
        value={jsonToYaml(JSON.stringify(props.credentialType.inputs))}
      />
      <PageDetailCodeEditor
        helpText={t(
          'Environment variables or extra variables that specify the values a credential type can inject, either in JSON or YAML syntax. Refer to the Ansible Controller documentation for example syntax.'
        )}
        label={t('Injector configuration')}
        value={jsonToYaml(JSON.stringify(props.credentialType.injectors))}
      />
    </PageDetails>
  );
}
