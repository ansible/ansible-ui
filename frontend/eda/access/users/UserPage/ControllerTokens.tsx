import { useTranslation } from 'react-i18next';
import { PageLayout, PageTable, usePageNavigate } from '../../../../../framework';
import { edaAPI } from '../../../common/eda-utils';
import { useEdaView } from '../../../common/useEventDrivenView';
import { EdaControllerToken } from '../../../interfaces/EdaControllerToken';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useControllerTokenActions } from '../hooks/useControllerTokenActions';
import { useControllerTokensActions } from '../hooks/useControllerTokensActions';
import { useControllerTokensColumns } from '../hooks/useControllerTokensColumns';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function ControllerTokens() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const tableColumns = useControllerTokensColumns();

  const view = useEdaView<EdaControllerToken>({
    url: edaAPI`/users/me/awx-tokens/`,
    tableColumns,
  });
  const toolbarActions = useControllerTokensActions(view);
  const rowActions = useControllerTokenActions(view);
  return (
    <PageLayout>
      <PageTable
        id="eda-controller-tokens-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading controller tokens')}
        emptyStateTitle={t('You currently do not have any tokens from Automation Controller.')}
        emptyStateDescription={t(
          'Please create a token from Automation Controller by using the button below.'
        )}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create controller token')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateControllerToken)}
        {...view}
        defaultSubtitle={t('Controller tokens')}
      />
    </PageLayout>
  );
}
