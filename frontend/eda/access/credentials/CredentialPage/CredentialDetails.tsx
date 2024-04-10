import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { LoadingPage, PageDetail, PageDetails, useGetPageUrl } from '../../../../../framework';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { CredentialDetailFields } from './CredentialDetailFields';
import { EdaRoute } from '../../../main/EdaRoutes';

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
        {credential?.created_at ? formatDateString(credential.created_at) : ''}
      </PageDetail>
      <LastModifiedPageDetail value={credential?.modified_at ? credential.modified_at : ''} />
    </PageDetails>
  );
}
