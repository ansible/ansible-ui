/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCredentialActions } from '../hooks/useCredentialActions';

export function CredentialPage() {
  const { t } = useTranslation();
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
            actions={actions}
            position={DropdownPosition.right}
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
          { label: t('Details'), page: AwxRoute.CredentialDetails },
          { label: t('Access'), page: AwxRoute.CredentialAccess },
          { label: t('Job Templates'), page: AwxRoute.CredentialJobTemplates },
        ]}
        params={{ id: params.id || 0 }}
      />
    </PageLayout>
  );
}
