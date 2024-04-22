import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { DateTimeCell, PageDetail, PageDetails, useGetPageUrl } from '../../../../framework';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaDecisionEnvironmentRead } from '../../interfaces/EdaDecisionEnvironment';
import { EdaRoute } from '../../main/EdaRoutes';

export function DecisionEnvironmentDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const imageHelpBlock = (
    <>
      <p>
        {t(
          'The full image location, including the container registry, image name, and version tag.'
        )}
      </p>
      <br />
      <p>{t('Examples: ')}</p>
      <Trans>
        <code>quay.io/ansible/awx-latest repo/project/image-name:tag</code>
      </Trans>
    </>
  );
  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironmentRead>(
    edaAPI`/decision-environments/${params.id ?? ''}/`
  );

  const { data: credential } = useGet<EdaCredential>(
    edaAPI`/eda-credentials/` + `${decisionEnvironment?.eda_credential?.id.toString() ?? ''}/`
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{decisionEnvironment?.name || ''}</PageDetail>
      <PageDetail label={t('Description')}>{decisionEnvironment?.description || ''}</PageDetail>
      <PageDetail label={t('Organization')}>
        {decisionEnvironment && decisionEnvironment.organization ? (
          <Link
            to={getPageUrl(EdaRoute.OrganizationPage, {
              params: { id: decisionEnvironment?.organization?.id },
            })}
          >
            {decisionEnvironment?.organization?.name}
          </Link>
        ) : (
          decisionEnvironment?.organization?.name || ''
        )}
      </PageDetail>

      <PageDetail label={t('Image')} helpText={imageHelpBlock}>
        {decisionEnvironment?.image_url || ''}
      </PageDetail>
      <PageDetail
        label={t('Credential')}
        helpText={t('The token needed to utilize the Decision environment image.')}
      >
        {decisionEnvironment && decisionEnvironment.eda_credential?.id ? (
          <Link
            to={getPageUrl(EdaRoute.CredentialPage, {
              params: { id: decisionEnvironment?.eda_credential?.id },
            })}
          >
            {credential?.name}
          </Link>
        ) : (
          credential?.name || ''
        )}
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={decisionEnvironment?.created_at} />
      </PageDetail>
      <LastModifiedPageDetail value={decisionEnvironment?.modified_at} />
    </PageDetails>
  );
}
