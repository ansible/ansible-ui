import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useGetDocsUrl } from '../../common/util/useGetDocsUrl';
import { CredentialType } from '../../interfaces/CredentialType';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { AwxRoute } from '../../main/AwxRoutes';
import {
  useCredentialTypeRowActions,
  useCredentialTypeToolbarActions,
} from './hooks/useCredentialTypeActions';
import { useCredentialTypesColumns } from './hooks/useCredentialTypesColumns';
import { useCredentialTypesFilters } from './hooks/useCredentialTypesFilters';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { usePersistentFilters } from '../../../common/PersistentFilters';

export function CredentialTypes() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  usePersistentFilters('credential_types');
  const toolbarFilters = useCredentialTypesFilters();
  const tableColumns = useCredentialTypesColumns();
  const pageNavigate = usePageNavigate();

  const view = useAwxView<CredentialType>({
    url: awxAPI`/credential_types/`,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useCredentialTypeToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useCredentialTypeRowActions(view.unselectItemsAndRefresh);

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/credential_types/`);
  const canCreateCredentialType = Boolean(data && data.actions && data.actions['POST']);

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
        titleDocLink={useGetDocsUrl(config, 'credentialTypes')}
        headerActions={<ActivityStreamIcon type={'credential_type'} />}
      />
      <PageTable<CredentialType>
        id="awx-credential-types"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credential types')}
        emptyStateTitle={
          canCreateCredentialType
            ? t('There are currently no credential types added.')
            : t('You do not have permission to create a credential type.')
        }
        emptyStateDescription={
          canCreateCredentialType
            ? t('Please create a credential type by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateCredentialType ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateCredentialType ? t('Create credential type') : undefined}
        emptyStateButtonClick={
          canCreateCredentialType ? () => pageNavigate(AwxRoute.CreateCredentialType) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
