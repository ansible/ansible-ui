import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaControllerToken } from '../../interfaces/EdaControllerToken';
import { useControllerTokenActions } from './hooks/useControllerTokenActions';
import { useControllerTokensColumns } from './hooks/useControllerTokensColumns';
import { useControllerTokensActions } from './hooks/useControllerTokensActions';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';

export function ControllerTokens() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useControllerTokensColumns();

  const view = useEdaView<EdaControllerToken>({
    url: `${API_PREFIX}/users/me/awx-tokens/`,
    tableColumns,
  });
  const toolbarActions = useControllerTokensActions(view);
  const rowActions = useControllerTokenActions(view);
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading controller tokens')}
        emptyStateTitle={t('You currently do not have any tokens from Automation Controller.')}
        emptyStateDescription={t(
          'Please create a token from Automation Controller by using the button below.'
        )}
        emptyStateButtonText={t('Create controller token')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaControllerToken)}
        {...view}
        defaultSubtitle={t('Controller tokens')}
      />
    </PageLayout>
  );
}
