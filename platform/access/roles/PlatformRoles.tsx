/* eslint-disable i18next/no-literal-string */
import { LoadingPage, PageHeader, PageLayout, PageTable } from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useTranslation } from 'react-i18next';
import { usePlatformView } from '../../hooks/usePlatformView';
import { PlatformRole } from '../../interfaces/PlatformRole';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { usePlatformRoleColumns } from './hooks/usePlatformRoleColumns';
import { usePlatformRoleRowActions } from './hooks/usePlatformRoleRowActions';
import { usePlatformRolesFilters } from './hooks/usePlatformRolesFilters';
import { usePlatformRoleToolbarActions } from './hooks/usePlatformRoleToolbarActions';
import { useGetResourceTypes } from './hooks/useResourceType';

export function PlatformRoles() {
  const { t } = useTranslation();
  const { data: resourceTypeData, error, isLoading } = useGetResourceTypes();
  const resourceTypeNames =
    resourceTypeData?.results?.map((resourceType) => ({
      name: resourceType.model,
      value: resourceType.api_slug,
    })) ?? [];
  const tableColumns = usePlatformRoleColumns();
  const toolbarFilters = usePlatformRolesFilters(resourceTypeNames);
  const view = usePlatformView<PlatformRole>({
    url: gatewayAPI`/role_definitions/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = usePlatformRoleToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = usePlatformRoleRowActions(view.unselectItemsAndRefresh);
  const docsUrl = useGetDocsUrl(undefined, 'roles');

  if (error) return <AwxError error={error} />;
  if (isLoading) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        description={t(
          'A role represents set of actions that a team or user may perform on a resource or set of resources.'
        )}
        titleHelpTitle={t('Roles')}
        titleHelp={t(
          'A role represents set of actions that a team or user may perform on a resource or set of resources.'
        )}
        titleDocLink={docsUrl}
      />
      <PageTable<PlatformRole>
        {...view}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading roles')}
        emptyStateTitle={t('No roles found')}
        disableCardView
        disableListView
      />
    </PageLayout>
  );
}
