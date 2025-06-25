import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useParams } from 'react-router';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { AuthenticatorMap } from '../../../interfaces/AuthenticatorMap';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { t } from 'i18next';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useMappingPageActions } from '../hooks/useMappingActions';

export function PlatformAuthenticatorMappingPage() {
  const params = useParams<{ map_id: string; id: string }>();
  const map_id = params.map_id;
  const auth_id = params.id;
  const { data: mapping } = useGetItem<AuthenticatorMap>(gatewayAPI`/authenticator_maps/`, map_id);
  const { data: authenticator } = useGetItem<Authenticator>(gatewayAPI`/authenticators/`, auth_id);
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const pageActions = useMappingPageActions((_host) => {
    pageNavigate(PlatformRoute.AuthenticatorMappings, {
      params: {
        id: mapping?.authenticator.toString(),
      },
    });
  });

  if (!mapping) {
    return null;
  }

  return (
    <PageLayout>
      <PageHeader
        title={mapping.name}
        breadcrumbs={[
          {
            label: t('Authentication Methods'),
            to: getPageUrl(PlatformRoute.Authenticators),
          },
          {
            label: authenticator?.name,
            to: getPageUrl(PlatformRoute.AuthenticatorDetails, {
              params: {
                id: mapping.authenticator,
              },
            }),
          },
          {
            label: t('Mapping'),
            to: getPageUrl(PlatformRoute.AuthenticatorMappings, {
              params: {
                id: mapping.authenticator,
              },
            }),
          },
          {
            label: mapping.name,
          },
        ]}
        headerActions={
          <PageActions<AuthenticatorMap>
            actions={pageActions}
            position={'right'}
            selectedItem={mapping}
          />
        }
      ></PageHeader>
      <PageRoutedTabs
        backTab={{
          label: t('Back to Mapping'),
          page: PlatformRoute.AuthenticatorMappings,
          persistentFilterKey: 'authenticator-mappings',
        }}
        tabs={[
          {
            label: t('Details'),
            page: PlatformRoute.AuthenticatorMappingDetails,
          },
        ]}
        params={{ id: params.id ?? '', map_id: params.map_id }}
      />
    </PageLayout>
  );
}
