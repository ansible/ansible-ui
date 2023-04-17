import { Button, CardFooter, Divider } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable } from '../../../framework';
import { PageDashboardCard } from '../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../Routes';
import { API_PREFIX } from '../constants';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useEdaView } from '../useEventDrivenView';
import { useActivationColumns } from './hooks/useActivationColumns';

export function ActivationsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useActivationColumns();
  const view = useEdaView<EdaRulebookActivation>({
    url: `${API_PREFIX}/activations/`,
    viewPage: 1,
    viewPerPage: 4,
    tableColumns,
  });
  return (
    <PageDashboardCard
      title={t('Rulebook Activations')}
      height="lg"
      to={RouteObj.EdaRulebookActivations}
    >
      <Divider />
      <div style={{ flexGrow: 1 }}>
        <PageTable
          disableBodyPadding={true}
          tableColumns={tableColumns}
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
      </div>
      <Divider />
      {view?.itemCount && view.itemCount === 0 && (
        <CardFooter>
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            onClick={() => navigate(RouteObj.CreateEdaRulebookActivation)}
          >
            {t('Create rulebook activation')}
          </Button>
        </CardFooter>
      )}
    </PageDashboardCard>
  );
}
