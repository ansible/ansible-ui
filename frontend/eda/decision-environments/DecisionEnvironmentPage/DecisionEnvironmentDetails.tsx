import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
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
  const { data: decisionEnvironment, isLoading } = useGet<EdaDecisionEnvironmentRead>(
    edaAPI`/decision-environments/${params.id ?? ''}/`
  );

  const { data: optionsData, isLoading: isLoadingOptions } = useOptions<{
    actions: {
      POST: {
        pull_policy?: {
          choices?: Array<{ value: string; display_name: string }>;
        };
      };
    };
  }>(edaAPI`/decision-environments/`);

  const pullPolicyLabel = useMemo(() => {
    const choices = optionsData?.actions?.POST?.pull_policy?.choices;
    if (!choices || !decisionEnvironment?.pull_policy) {
      return decisionEnvironment?.pull_policy || '';
    }
    const choice = choices.find((c) => c.value === decisionEnvironment.pull_policy);
    return choice?.display_name || decisionEnvironment.pull_policy;
  }, [optionsData, decisionEnvironment?.pull_policy]);

  const getPageUrl = useGetPageUrl();

  if (isLoading || isLoadingOptions) {
    return <LoadingPage />;
  }

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
      <PageDetail id="pull-policy" label={t('Pull policy')}>
        {pullPolicyLabel}
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
            {decisionEnvironment?.eda_credential?.name}
          </Link>
        ) : (
          decisionEnvironment?.eda_credential?.name || ''
        )}
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell
          value={decisionEnvironment?.created_at}
          author={decisionEnvironment?.created_by?.username}
        />
      </PageDetail>
      <LastModifiedPageDetail
        value={decisionEnvironment?.modified_at}
        author={decisionEnvironment?.modified_by?.username}
      />
    </PageDetails>
  );
}
