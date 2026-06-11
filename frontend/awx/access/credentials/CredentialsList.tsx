import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useAwxView } from '../../common/useAwxView';
import { Credential } from '../../interfaces/Credential';
import { AwxRoute } from '../../main/AwxRoutes';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialToolbarActions } from './hooks/useCredentialToolbarActions';
import { useCredentialsColumns } from './hooks/useCredentialsColumns';
import { useCredentialsFilters } from './hooks/useCredentialsFilters';

export function CredentialsList(props: { url: string }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useCredentialsColumns();

  usePersistentFilters('credentials');
  const toolbarFilters = useCredentialsFilters();

  const view = useAwxView<Credential>({
    url: props.url,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialToolbarActions(view);
  const rowActions = useCredentialActions({
    onDeleted: () => void view.refresh(),
    onCredentialCopied: () => void view.refresh(),
  });

  return (
    <PageTable<Credential>
      id="awx-credentials-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading credentials')}
      emptyState={
        <PageTableEmptyState
          title={t('No credentials yet')}
          description={t('To get started, create an credential.')}
        >
          <ButtonLink
            icon={<PlusCircleIcon />}
            variant={ButtonVariant.primary}
            href={getPageUrl(AwxRoute.CreateCredential)}
          >
            {t('Create credential')}
          </ButtonLink>
        </PageTableEmptyState>
      }
      {...view}
      defaultSubtitle={t('Credential')}
    />
  );
}
