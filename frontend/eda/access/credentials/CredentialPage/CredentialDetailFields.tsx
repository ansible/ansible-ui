import { PageDetail, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { capitalizeFirstLetter } from '@ansible/ansible-ui-framework/utils/strings';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { LabelGroup, Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';
import { CredentialPluginsInputSource } from '../hooks/useCredentialSecretModal';

export function CredentialDetailFields(props: {
  credential: EdaCredential;
  inputSources?: Record<string, CredentialPluginsInputSource>;
}) {
  const { t } = useTranslation();
  const { credential, inputSources = {} } = props;

  if (!credential?.inputs) return <></>;

  const enabledOptions: string[] = [];
  Object.entries(credential.inputs).forEach(([label, value]) => {
    if (typeof value === 'boolean' && value === true) {
      enabledOptions.push(capitalizeFirstLetter(label));
    }
  });

  return (
    <>
      {Object.entries(credential.inputs).map(([fieldName, fieldValue]) => {
        const inputSource = inputSources[fieldName];
        const isBoolean = typeof fieldValue === 'boolean';

        if (isBoolean) {
          return <></>;
        }

        if (inputSource) {
          return (
            <CredentialExternalField
              key={fieldName}
              fieldName={fieldName}
              inputSource={inputSource}
            />
          );
        }

        return (
          <PageDetail key={fieldName} label={capitalizeFirstLetter(fieldName)}>
            {fieldValue === '$encrypted$' ? t('Encrypted') : String(fieldValue)}
          </PageDetail>
        );
      })}
      {enabledOptions.length > 0 && (
        <PageDetail key={'enabled_options'} label={t('Enabled options')}>
          {enabledOptions.join(', ')}
        </PageDetail>
      )}
    </>
  );
}

function CredentialExternalField(props: {
  fieldName: string;
  inputSource: CredentialPluginsInputSource;
}) {
  const { t } = useTranslation();
  const { fieldName, inputSource } = props;
  const getPageUrl = useGetPageUrl();

  const { data: sourceCredential } = useGet<EdaCredential>(
    inputSource.source_credential
      ? edaAPI`/eda-credentials/${inputSource.source_credential}/`
      : undefined
  );

  const credentialKind = sourceCredential?.credential_type?.kind || 'external';
  const credentialName = sourceCredential?.name || 'External credential';

  return (
    <>
      <PageDetail key={fieldName} label={capitalizeFirstLetter(fieldName) + ' *'}>
        <LabelGroup numLabels={1}>
          <Label color="blue" isClickable>
            <Link
              to={getPageUrl(EdaRoute.CredentialPage, {
                params: { id: inputSource.source_credential },
              })}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <strong>{capitalizeFirstLetter(credentialKind)}: </strong>
              {credentialName}
            </Link>
          </Label>
        </LabelGroup>
      </PageDetail>
      {inputSource.metadata && Object.keys(inputSource.metadata).length > 0 && (
        <PageDetailCodeEditor
          label={t('Metadata')}
          value={JSON.stringify(inputSource.metadata, null, 2)}
        />
      )}
    </>
  );
}
