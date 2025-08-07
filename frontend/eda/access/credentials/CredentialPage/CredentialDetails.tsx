import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import styled from 'styled-components';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';
import { EdaResult } from '../../../interfaces/EdaResult';
import { CredentialPluginsInputSource } from '../hooks/useCredentialSecretModal';
import { CredentialDetailFields } from './CredentialDetailFields';

const PluginFieldText = styled.p`
  margin-top: 10px;
`;

export function CredentialDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const { data: credential } = useGet<EdaCredential>(edaAPI`/eda-credentials/${params.id ?? ''}/`);

  const { data: credentialInputSourcesResponse } = useGet<EdaResult<CredentialPluginsInputSource>>(
    credential?.id
      ? edaAPI`/credential-input-sources/?target_credential=${credential.id}`
      : undefined
  );

  const credentialInputSources = useMemo(() => {
    return credentialInputSourcesResponse?.results || [];
  }, [credentialInputSourcesResponse]);

  const inputSourcesMap = useMemo(() => {
    return credentialInputSources.reduce(
      (map: Record<string, CredentialPluginsInputSource>, inputSource) => {
        map[inputSource.input_field_name] = inputSource;
        return map;
      },
      {}
    );
  }, [credentialInputSources]);

  if (!credential) {
    return <LoadingPage />;
  }

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{credential?.name || ''}</PageDetail>
      <PageDetail label={t('Description')}>{credential?.description || ''}</PageDetail>
      <PageDetail label={t('Organization')}>
        {credential && credential.organization ? (
          <Link
            to={getPageUrl(EdaRoute.OrganizationPage, {
              params: { id: credential?.organization?.id },
            })}
          >
            {credential?.organization?.name}
          </Link>
        ) : (
          credential?.organization?.name || ''
        )}
      </PageDetail>
      <PageDetail label={t('Credential type')}>
        {credential.credential_type?.name || credential.credential_type?.id || ''}
      </PageDetail>
      <CredentialDetailFields credential={credential} inputSources={inputSourcesMap} />
      <PageDetail label={t('Created')}>
        <DateTimeCell value={credential?.created_at} author={credential?.created_by?.username} />
      </PageDetail>
      <LastModifiedPageDetail
        value={credential?.modified_at ? credential.modified_at : ''}
        author={credential?.modified_by?.username}
      />
      {credentialInputSources && credentialInputSources.length > 0 && (
        <PluginFieldText>
          {t(
            `* This field will be retrieved from an external secret management system using the specified credential.`
          )}
        </PluginFieldText>
      )}
    </PageDetails>
  );
}
