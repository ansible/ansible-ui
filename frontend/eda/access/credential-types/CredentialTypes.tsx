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

export function CredentialTypes() {
  const { t } = useTranslation();
  const tableColumns = useCredentialTypesColumns();
  const pageNavigate = usePageNavigate();

  const view = useEdaView<EdaCredentialType>({
    url: edaAPI`/credential-types/`,
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
        rowActions={rowActions}
        errorStateTitle={t('Error loading credential types')}
        emptyStateTitle={t('There are currently no credential types added.')}
        emptyStateDescription={t('Please create a credential type by using the button below.')}
        emptyStateIcon={CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create credential type')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateCredentialType)}
        {...view}
      />
    </PageLayout>
  );
}
