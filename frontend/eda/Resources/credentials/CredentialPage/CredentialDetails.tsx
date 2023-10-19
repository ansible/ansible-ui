import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetail, PageDetails, LoadingPage } from '../../../../../framework';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { useGet } from '../../../../common/crud/useGet';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { CredentialOptions } from '../EditCredential';

export function CredentialDetails() {
  const { t } = useTranslation();
  const credentialTypeHelpBlock = (
    <>
      <p>{t('The credential type defines what the credential will be used for.')}</p>
      <br />
      <p>{t('There are three types:')}</p>
      <p>{t('GitHub Personal Access Token')}</p>
      <p>{t('GitLab Personal Access Token')}</p>
      <p>{t('Container Registry')}</p>
    </>
  );
  const params = useParams<{ id: string }>();
  const { data: credential } = useGet<EdaCredential>(
    `${API_PREFIX}/credentials/${params.id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );
  const credentialOption = CredentialOptions(t).find(
    (option) => option.value === credential?.credential_type
  );
  if (!credential) {
    return <LoadingPage />;
  }
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{credential?.name || ''}</PageDetail>
      <PageDetail label={t('Description')}>{credential?.description || ''}</PageDetail>
      <PageDetail label={t('Credential type')} helpText={credentialTypeHelpBlock}>
        {credentialOption ? credentialOption?.label : credential?.credential_type}
      </PageDetail>
      <PageDetail label={t('Username')}>{credential?.username || ''}</PageDetail>
      <PageDetail label={t('Created')}>
        {credential?.created_at ? formatDateString(credential.created_at) : ''}
      </PageDetail>
      <PageDetail label={t('Last modified')}>
        {credential?.modified_at ? formatDateString(credential.modified_at) : ''}
      </PageDetail>
    </PageDetails>
  );
}
