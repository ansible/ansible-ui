import { useTranslation } from 'react-i18next';
import { DateTimeCell, PageDetail, PageDetails, useGetPageUrl } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { useNavigate, useParams } from 'react-router-dom';
import { CredentialType } from '../../../interfaces/CredentialType';
import { AwxRoute } from '../../../AwxRoutes';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { Label } from '@patternfly/react-core';
import { jsonToYaml } from '../../../../../framework/utils/codeEditorUtils';
import { awxAPI } from '../../../api/awx-utils';

export function CredentialTypeDetails() {
  const params = useParams<{ id: string }>();
  const { data: credentialType } = useGetItem<CredentialType>(
    awxAPI`/credential_types/`,
    params.id
  );
  return credentialType ? <CredentialTypeDetailInner credentialType={credentialType} /> : null;
}

export function CredentialTypeDetailInner(props: { credentialType: CredentialType }) {
  const { t } = useTranslation();
  const history = useNavigate();
  const getPageUrl = useGetPageUrl();
  function renderCredentialTypeName(credentialType: CredentialType) {
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
        helpText={t('Input schema which defines a set of ordered fields for that type.')}
        label={t('Input configuration')}
        value={jsonToYaml(JSON.stringify(props.credentialType.inputs))}
      />
      <PageDetailCodeEditor
        helpText={t(
          'Environment variables or extra variables that specify the values a credential type can inject.'
        )}
        label={t('Injector configuration')}
        value={jsonToYaml(JSON.stringify(props.credentialType.injectors))}
      />
      <PageDetail label={t('Created')}>
        <DateTimeCell
          format="since"
          value={props.credentialType.created}
          author={props.credentialType.summary_fields?.created_by?.username}
          onClick={() =>
            history(
              getPageUrl(AwxRoute.UserDetails, {
                params: {
                  id: (props.credentialType.summary_fields?.created_by?.id ?? 0).toString(),
                },
              })
            )
          }
        />
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        <DateTimeCell
          format="since"
          value={props.credentialType.modified}
          author={props.credentialType.summary_fields?.modified_by?.username}
          onClick={() =>
            history(
              getPageUrl(AwxRoute.UserDetails, {
                params: {
                  id: (props.credentialType.summary_fields?.modified_by?.id ?? 0).toString(),
                },
              })
            )
          }
        />
      </PageDetail>
    </PageDetails>
  );
}
