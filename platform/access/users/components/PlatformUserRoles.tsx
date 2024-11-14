import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageRoutedTabs } from '../../../../frontend/common/PageRoutedTabs';
import { useGatewayService } from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function PlatformUserRoles() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');
  const hubService = useGatewayService('hub');
  const rolesTabs = useMemo(() => {
    return [
      ...(awxService
        ? [{ label: t('Automation Execution'), page: PlatformRoute.AwxUserRoles as string }]
        : []),
      ...(edaService
        ? [{ label: t('Automation Decisions'), page: PlatformRoute.EdaUserRoles as string }]
        : []),
      ...(hubService
        ? [{ label: t('Automation Content'), page: PlatformRoute.HubUserRoles as string }]
        : []),
    ];
  }, [awxService, edaService, hubService, t]);
  return (
    <>
      <PageRoutedTabs tabs={rolesTabs} isBox={false} params={{ id: params.id }} />
    </>
  );
}
