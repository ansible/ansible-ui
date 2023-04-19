import { Divider } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable, useVisibleModalColumns } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../Routes';
import { useDecisionEnvironmentColumns } from '../../Resources/decision-environments/hooks/useDecisionEnvironmentColumns';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { IEdaView } from '../../useEventDrivenView';

export function DecisionEnvironmentsCard(props: { view: IEdaView<EdaDecisionEnvironment> }) {
  const { view } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useDecisionEnvironmentColumns();
  const columns = useVisibleModalColumns(tableColumns);
  return (
    <PageDashboardCard
      title={t('Decision Environments')}
      height="xxl"
      linkText={t('Go to Decision Environments')}
      to={RouteObj.EdaDecisionEnvironments}
    >
      {view.itemCount !== 0 && <Divider />}
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading activations')}
        emptyStateIcon={CubesIcon}
        emptyStateVariant={'light'}
        emptyStateTitle={t('There are currently no rulebook activations')}
        emptyStateDescription={t('Create a rulebook activation by clicking the button below.')}
        emptyStateButtonText={t('Create rulebook activation')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaRulebookActivation)}
        {...view}
        defaultSubtitle={t('Activation')}
        compact
      />
    </PageDashboardCard>
  );
}
