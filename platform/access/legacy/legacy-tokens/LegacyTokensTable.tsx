/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PageTable } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useAwxActiveUser } from '@ansible/awx-ui/common/useAwxActiveUser';
import { useAwxView } from '@ansible/awx-ui/common/useAwxView';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { Alert, AlertGroup, PageSection } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useLegacyTokenColumns } from './hooks/useLegacyTokenColumns';
import { useLegacyTokensFilters } from './hooks/useLegacyTokenFilters';
import { useLegacyTokenRowActions } from './hooks/useLegacyTokenRowActions';
import { useLegacyTokenToolbarActions } from './hooks/useLegacyTokenToolbarActions';

export function LegacyTokensTable() {
  const { id, applicationId } = useParams<{ id?: string; applicationId?: string }>();
  const { t } = useTranslation();
  const { activeAwxUser } = useAwxActiveUser();
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
        errorStateTitle={t('Error loading legacy tokens')}
        emptyState={
          <PageTableEmptyState
            title={t('No legacy tokens found.')}
            description={t(
              'Please contact your organization administrator if there is an issue with your access.'
            )}
          />
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
