import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../common/Routes';
import { API_PREFIX } from '../../constants';
import { EdaControllerToken } from '../../interfaces/EdaControllerToken';
import { useEdaView } from '../../useEventDrivenView';
import { useControllerTokenActions } from './hooks/useControllerTokenActions';
import { useControllerTokensColumns } from './hooks/useControllerTokensColumns';

export function ControllerTokens() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useControllerTokensColumns();

  const view = useEdaView<EdaControllerToken>({
    url: `${API_PREFIX}/users/me/awx-tokens/`,
    tableColumns,
  });
  const rowActions = useControllerTokenActions(view);
  return (
    <PageLayout>
      <PageTable
        id="eda-controller-tokens-table"
        tableColumns={tableColumns}
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
