import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../../framework';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useGetDocsUrl } from '../../common/util/useGetDocsUrl';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { ApplicationsTable } from './ApplicationsTable';

export function Applications() {
  const { t } = useTranslation();
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('OAuth Applications')}
        description={t(
          'Create and configure token-based authentication for external applications.'
        )}
        titleHelpTitle={t('Applications')}
        titleHelp={t('Create and configure token-based authentication for external applications.')}
        titleDocLink={`${useGetDocsUrl(config, 'applications')}/userguide/applications_auth.html`}
        headerActions={<ActivityStreamIcon type={'o_auth2_application'} />}
      />
      <ApplicationsTable />
    </PageLayout>
  );
}
