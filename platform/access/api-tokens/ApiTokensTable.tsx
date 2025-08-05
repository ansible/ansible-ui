/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { usePlatformView } from '../../hooks/usePlatformView';
import { Token } from '../../interfaces/Token';
import { usePlatformActiveUser } from '../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { useApiTokenColumns } from './hooks/useApiTokenColumns';
import { useApiTokensFilters } from './hooks/useApiTokenFilters';
import { useApiTokenRowActions } from './hooks/useApiTokenRowActions';
import { useApiTokenToolbarActions } from './hooks/useApiTokenToolbarActions';

export function ApiTokensTable() {
  const { id, applicationId } = useParams<{ id?: string; applicationId?: string }>();
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useApiTokenColumns();
  const toolbarFilters = useApiTokensFilters();

  const queryParams = useMemo<{ user: string } | { application: string } | undefined>(() => {
    // If viewing from a specific user page (user details), always filter by that user
    if (id) {
      return { user: id };
    }

    if (applicationId) {
      return { application: applicationId };
    }

    // In global mode, restrict to current user's tokens unless user is super user or auditor
    const hasAdminAccess =
      activePlatformUser?.is_superuser || activePlatformUser?.is_platform_auditor;

    if (!hasAdminAccess && activePlatformUser?.id) {
      return { user: activePlatformUser.id.toString() };
    }

    // Super users and auditors can see all tokens in global mode
    return undefined;
  }, [
    id,
    applicationId,
    activePlatformUser?.is_superuser,
    activePlatformUser?.is_platform_auditor,
    activePlatformUser?.id,
  ]);

  const view = usePlatformView<Token>({
    url: gatewayAPI`/tokens/`,
    toolbarFilters,
    tableColumns,
    queryParams,
  });
  const toolbarActions = useApiTokenToolbarActions(view);
  const rowActions = useApiTokenRowActions((tokens) => view.unselectItemsAndRefresh(tokens));
  return (
    <PageTable<Token>
      id="api-tokens"
      errorStateTitle={t('Error loading API tokens')}
      emptyState={
        <PageTableEmptyState
          title={t('There are currently no API tokens.')}
          description={t('Create an API token by clicking the button below.')}
        >
          <ButtonLink
            icon={<PlusCircleIcon />}
            variant={ButtonVariant.primary}
            href={getPageUrl(PlatformRoute.CreateApiToken)}
          >
            {t('Create API token')}
          </ButtonLink>
        </PageTableEmptyState>
      }
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      {...view}
      disableCardView
      disableListView
    />
  );
}
