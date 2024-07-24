import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaRoute } from '../../main/EdaRoutes';
import { useCredentialActions } from './hooks/useCredentialActions';
import { useCredentialColumns } from './hooks/useCredentialColumns';
import { useCredentialFilters } from './hooks/useCredentialFilters';
import { useCredentialsActions } from './hooks/useCredentialsActions';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';

export function Credentials() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('EDA');
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns();
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/eda-credentials/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useCredentialsActions(view);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/eda-credentials/`);
  const canCreateCredential = Boolean(data && data.actions && data.actions['POST']);
  const rowActions = useCredentialActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Credentials')}
        description={t(
          'Credentials are utilized by {{product}} for authentication when launching rulebooks.',
          { product }
        )}
        titleHelpTitle={t('Credentials')}
        titleHelp={t(
          'Credentials are utilized by {{product}} for authentication when launching rulebooks.',
          { product }
        )}
      />
      <PageTable
        id="eda-credentials-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credentials')}
        emptyStateTitle={
          canCreateCredential
            ? t('There are currently no credentials created for your organization.')
            : t('You do not have permission to create a credential.')
        }
        emptyStateDescription={
          canCreateCredential
            ? t('Please create a credential by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateCredential ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateCredential ? t('Create credential') : undefined}
        emptyStateButtonClick={
          canCreateCredential ? () => pageNavigate(EdaRoute.CreateCredential) : undefined
        }
        {...view}
        defaultSubtitle={t('Credential')}
      />
    </PageLayout>
  );
}
