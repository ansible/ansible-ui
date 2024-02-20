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
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialType } from '../../../interfaces/CredentialType';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCredentialTypeRowActions } from '../hooks/useCredentialTypeActions';

export function CredentialTypePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: credentialType,
    refresh,
  } = useGetItem<CredentialType>(awxAPI`/credential_types`, params.id);
  const pageNavigate = usePageNavigate();
  const actions = useCredentialTypeRowActions(() => pageNavigate(AwxRoute.CredentialTypes));
  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!credentialType) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={credentialType?.name}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(AwxRoute.CredentialTypes) },
          { label: credentialType?.name },
        ]}
        headerActions={
          <PageActions<CredentialType>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={credentialType}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Credential Types'),
          page: AwxRoute.CredentialTypes,
          persistentFilterKey: 'credential-types',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.CredentialTypeDetails },
          { label: t('Credentials'), page: AwxRoute.CredentialTypeCredentials },
        ]}
        params={{ id: credentialType.id }}
      />
    </PageLayout>
  );
}
