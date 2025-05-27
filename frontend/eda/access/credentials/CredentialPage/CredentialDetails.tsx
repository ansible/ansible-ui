import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';
import { CredentialDetailFields } from './CredentialDetailFields';

export function CredentialDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const { data: credential } = useGet<EdaCredential>(edaAPI`/eda-credentials/${params.id ?? ''}/`);
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
      <CredentialDetailFields credential={credential} />
      <PageDetail label={t('Created')}>
        <DateTimeCell value={credential?.created_at} author={credential?.created_by?.username} />
      </PageDetail>
      <LastModifiedPageDetail
        value={credential?.modified_at ? credential.modified_at : ''}
        author={credential?.modified_by?.username}
      />
    </PageDetails>
  );
}
