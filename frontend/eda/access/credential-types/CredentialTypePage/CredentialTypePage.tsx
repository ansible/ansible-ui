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
import { LoadingPage } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useCredentialTypeRowActions } from '../hooks/useCredentialTypeActions';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { edaAPI } from '../../../common/eda-utils';

export function CredentialTypePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: credentialType } = useGetItem<EdaCredentialType>(
    edaAPI`/credential-types`,
    params.id
  );
  const pageNavigate = usePageNavigate();
  const actions = useCredentialTypeRowActions(() => pageNavigate(EdaRoute.CredentialTypes));
  const getPageUrl = useGetPageUrl();

  if (!credentialType) return <LoadingPage breadcrumbs tabs />;

  const isActionTab = location.href.includes(
    getPageUrl(EdaRoute.CredentialTypeDetails, { params: { id: credentialType?.id } })
  );

  return (
    <PageLayout>
      <PageHeader
        title={credentialType?.name}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(EdaRoute.CredentialTypes) },
          { label: credentialType?.name },
        ]}
        headerActions={
          isActionTab ? (
            <PageActions<EdaCredentialType>
              actions={actions}
              position={DropdownPosition.right}
              selectedItem={credentialType}
            />
          ) : (
            <></>
          )
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Credential Types'),
          page: EdaRoute.CredentialTypes,
          persistentFilterKey: 'credential-types',
        }}
        tabs={[
          { label: t('Details'), page: EdaRoute.CredentialTypeDetails },
          { label: t('Credentials'), page: EdaRoute.CredentialTypeCredentials },
          { label: t('Team Access'), page: EdaRoute.CredentialTypeTeamAccess },
          { label: t('User Access'), page: EdaRoute.CredentialTypeUserAccess },
        ]}
        params={{ id: credentialType.id }}
      />
    </PageLayout>
  );
}
