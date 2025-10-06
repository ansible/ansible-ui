import {
  LoadingPage,
  PageActions,
  PageDetails,
  PageDetailsFromColumns,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformRole } from '../../interfaces/PlatformRole';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { usePlatformRoleColumns } from './hooks/usePlatformRoleColumns';
import { usePlatformRoleRowActions } from './hooks/usePlatformRoleRowActions';

export function PlatformRoleDetails(props: { breadcrumbLabelForPreviousPage?: string }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const columns = usePlatformRoleColumns({ disableLinks: true });
  const params = useParams<{ id: string }>();
  const {
    data: role,
    // error,
    // refresh,
  } = useGetItem<PlatformRole>(gatewayAPI`/role_definitions/`, params.id);
  const itemActions = usePlatformRoleRowActions(() => {
    pageNavigate(PlatformRoute.Roles);
  });
  // if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[
          {
            label: props.breadcrumbLabelForPreviousPage || t('Roles'),
            to: getPageUrl(PlatformRoute.Roles),
          },
          { label: role?.name },
        ]}
        headerActions={
          <PageActions<PlatformRole> actions={itemActions} position={'right'} selectedItem={role} />
        }
      />
      <PageDetails disableScroll>
        <PageDetailsFromColumns<PlatformRole> item={role} columns={columns} />
      </PageDetails>
    </PageLayout>
  );
}
