import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { EdaRoute } from '../../main/EdaRoutes';
import {
  useCredentialTypeRowActions,
  useCredentialTypeToolbarActions,
} from './hooks/useCredentialTypeActions';
import { useCredentialTypeCredentialsFilters } from './hooks/useCredentialTypeCredentialsFilters';
import { useCredentialTypesColumns } from './hooks/useCredentialTypesColumns';

export function CredentialTypes() {
  const { t } = useTranslation();
  const tableColumns = useCredentialTypesColumns();
  const getPageUrl = useGetPageUrl();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/credential-types/`);
  const canCreateCredentialTypes = Boolean(data && data.actions && data.actions['POST']);
  const toolbarFilters = useCredentialTypeCredentialsFilters();

  const view = useEdaView<EdaCredentialType>({
    url: edaAPI`/credential-types/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useCredentialTypeToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useCredentialTypeRowActions(view.unselectItemsAndRefresh);
  return (
    <PageLayout>
      <PageHeader
        title={t('Credential Types')}
        description={t(
          'Define custom credential types to support authentication with other systems during automation.'
        )}
        titleHelpTitle={t('Credential Types')}
        titleHelp={t(
          'Define custom credential types to support authentication with other systems during automation.'
        )}
      />
      <PageTable<EdaCredentialType>
        id="Eda-credential-types"
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credential types')}
        emptyState={
          canCreateCredentialTypes ? (
            <PageTableEmptyState
              title={t('There are currently no credential types added.')}
              description={t('Please create a credential type by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant="primary"
                href={getPageUrl(EdaRoute.CreateCredentialType)}
              >
                {t('Create credential type')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create a credential type.')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
      />
    </PageLayout>
  );
}
