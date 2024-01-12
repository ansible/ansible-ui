import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../../framework';
import { PageNotImplemented } from '../../../../framework/PageEmptyStates/PageNotImplemented';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';

export function ManagementJobs() {
  const { t } = useTranslation();
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Management Jobs')}
        description={t(
          'Management Jobs assist in the cleaning of old data including system tracking information, tokens, job histories, and activity streams.'
        )}
        titleHelpTitle={t('Management Jobs')}
        titleHelp={t(
          'Management Jobs assist in the cleaning of old data including system tracking information, tokens, job histories, and activity streams.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/management_jobs.html`}
      />
      <PageNotImplemented />
    </PageLayout>
  );
}
