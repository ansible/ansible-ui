/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useViewActivityStream } from '../../common/useViewActivityStream';
import { useCredentialActions } from '../hooks/useCredentialActions';

export function CredentialPage() {
  const { t } = useTranslation();
  const activityStream = useViewActivityStream('credential');
  const params = useParams<{ id: string }>();
  const { data: credential } = useGetItem<Credential>(awxAPI`/credentials`, params.id);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const actions = useCredentialActions({
    onDeleted: () => pageNavigate(AwxRoute.Credentials),
  });
  return (
    <PageLayout>
      <PageHeader
        title={credential?.name}
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(AwxRoute.Credentials) },
          { label: credential?.name },
        ]}
        headerActions={
          <PageActions<Credential>
            actions={[...activityStream, ...actions]}
            position={'right'}
            selectedItem={credential}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Credentials'),
          page: AwxRoute.Credentials,
          persistentFilterKey: 'credentials',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.CredentialDetails, dataCy: 'credential-details' },
          {
            label: t('Job Templates'),
            page: AwxRoute.CredentialJobTemplates,
            dataCy: 'job-templates',
          },
          { label: t('Team Access'), page: AwxRoute.CredentialTeamAccess, dataCy: 'team-access' },
          { label: t('User Access'), page: AwxRoute.CredentialUserAccess, dataCy: 'user-access' },
        ]}
        params={{ id: params.id || 0 }}
      />
    </PageLayout>
  );
}
