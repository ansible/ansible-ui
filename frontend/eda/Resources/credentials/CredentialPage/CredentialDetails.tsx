import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetail, PageDetails } from '../../../../../framework';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { useGet } from '../../../../common/crud/useGet';
import { SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { CredentialOptions } from '../EditCredential';
import { edaAPI } from '../../../api/eda-utils';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';

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
    edaAPI`/credentials/${params.id ?? ''}/`,
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
      <LastModifiedPageDetail
        format="date-time"
        value={credential?.modified_at ? formatDateString(credential.modified_at) : ''}
      />
    </PageDetails>
  );
}
