/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useAwxActiveUser } from '@ansible/awx-ui/common/useAwxActiveUser';
import { useAwxView } from '@ansible/awx-ui/common/useAwxView';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { Alert, AlertGroup, ButtonVariant, PageSection } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useLegacyTokenColumns } from './hooks/useLegacyTokenColumns';
import { useLegacyTokensFilters } from './hooks/useLegacyTokenFilters';
import { useLegacyTokenRowActions } from './hooks/useLegacyTokenRowActions';
import { useLegacyTokenToolbarActions } from './hooks/useLegacyTokenToolbarActions';

export function LegacyTokensTable() {
  const { id, applicationId } = useParams<{ id?: string; applicationId?: string }>();
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useLegacyTokenColumns();
  const toolbarFilters = useLegacyTokensFilters();

  const queryParams = useMemo<{ user: string } | { application: string } | undefined>(() => {
    // If viewing from a specific user page (user details), always filter by that user
    if (id) {
      // we are on the users page but we do not want to use the uis as it is the gateway id
      // we instead use the awx user id
      return { user: activeAwxUser ? activeAwxUser.id.toString() : '' };
    }

    if (applicationId) {
      return { application: applicationId };
    }

    // In global mode, restrict to current user's tokens unless user is super user or auditor
    const hasAdminAccess = activeAwxUser?.is_superuser || activeAwxUser?.is_system_auditor;

    if (!hasAdminAccess && activeAwxUser?.id) {
      return { user: activeAwxUser.id.toString() };
    }

    // Super users and auditors can see all tokens in global mode
    return undefined;
  }, [id, applicationId, activeAwxUser]);

  const view = useAwxView<Token>({
    url: awxAPI`/tokens/`,
    toolbarFilters,
    tableColumns,
    queryParams,
  });
  const toolbarActions = useLegacyTokenToolbarActions(view);
  const rowActions = useLegacyTokenRowActions((tokens) => view.unselectItemsAndRefresh(tokens));
  return (
    <>
      <PageSection>
        <AlertGroup>
          <Alert
            variant="warning"
            title={t(
              'Legacy tokens are used for backwards compatibility with existing automation.'
            )}
            isInline
            isExpandable
          >
            {t(
              'Existing controller automation should be updated to platform automation. Legacy tokens should be deleted and replaced with platform tokens in the API Tokens section.'
            )}
          </Alert>
        </AlertGroup>
      </PageSection>
      <PageTable<Token>
        id="api-tokens"
        errorStateTitle={t('Error loading Legacy tokens')}
        emptyState={
          <PageTableEmptyState
            title={t('There are currently no Legacy tokens.')}
            description={t('Create an Legacy token by clicking the button below.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(PlatformRoute.CreateLegacyToken)}
            >
              {t('Create Legacy token')}
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
    </>
  );
}
