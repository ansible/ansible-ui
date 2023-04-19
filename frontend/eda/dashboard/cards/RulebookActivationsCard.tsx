import { Divider } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable, useVisibleModalColumns } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../Routes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from '../../rulebook-activations/hooks/useRulebookActivationColumns';
import { IEdaView } from '../../useEventDrivenView';

export function RulebookActivationsCard(props: { view: IEdaView<EdaRulebookActivation> }) {
  const { view } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useRulebookActivationColumns();
  const columns = useVisibleModalColumns(tableColumns);
  return (
    <PageDashboardCard
      title={t('Rulebook Activations')}
      height="xxl"
      linkText={t('Go to Rulebook Activations')}
      to={RouteObj.EdaRulebookActivations}
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
