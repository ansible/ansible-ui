import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '../../../../framework';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
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

export function CredentialTypes() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  usePersistentFilters('credential_types');
  const toolbarFilters = useCredentialTypesFilters();
  const tableColumns = useCredentialTypesColumns();
  const getPageUrl = useGetPageUrl();
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
        emptyState={
          canCreateCredentialType ? (
            <PageTableEmptyState
              title={t('There are currently no credential types added.')}
              description={t('Please create a credential type by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant="primary"
                href={getPageUrl(AwxRoute.CreateCredentialType)}
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
