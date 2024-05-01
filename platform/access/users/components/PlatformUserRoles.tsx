import { useMemo } from 'react';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGatewayServices } from '../../../main/GatewayServices';
import { useTranslation } from 'react-i18next';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useParams } from 'react-router-dom';

export function PlatformUserRoles() {
  const [gatewayServices, _] = useGatewayServices();
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const awxService = gatewayServices.find(
    (service) => service.summary_fields?.service_cluster?.service_type === 'controller'
  );
  const edaService = gatewayServices.find(
    (service) => service.summary_fields?.service_cluster?.service_type === 'eda'
  );
  const rolesTabs = useMemo(() => {
    return [
      ...(awxService
        ? [{ label: t('Automation Execution'), page: PlatformRoute.AwxUserRoles as string }]
        : []),
      ...(edaService
        ? [{ label: t('Automation Decisions'), page: PlatformRoute.EdaUserRoles as string }]
        : []),
    ];
  }, [awxService, edaService, t]);
  return (
    <>
      <PageRoutedTabs tabs={rolesTabs} isBox={false} params={{ id: params.id }} />
    </>
  );
}
