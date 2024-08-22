import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { EdaRoute } from '../../main/EdaRoutes';
import {
  useCredentialTypeRowActions,
  useCredentialTypeToolbarActions,
} from './hooks/useCredentialTypeActions';
import { useCredentialTypesColumns } from './hooks/useCredentialTypesColumns';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { useCredentialTypeCredentialsFilters } from './hooks/useCredentialTypeCredentialsFilters';

export function CredentialTypes() {
  const { t } = useTranslation();
  const tableColumns = useCredentialTypesColumns();
  const pageNavigate = usePageNavigate();
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
        emptyStateTitle={
          canCreateCredentialTypes
            ? t('There are currently no credential types created for your organization.')
            : t('You do not have permission to create a credential type.')
        }
        emptyStateDescription={
          canCreateCredentialTypes
            ? t('Please create a credential type by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateCredentialTypes ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateCredentialTypes ? t('Create credential type') : undefined}
        emptyStateButtonClick={
          canCreateCredentialTypes ? () => pageNavigate(EdaRoute.CreateCredential) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
