import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useGatewayService } from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function PlatformTeamRoles() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');
  const hubService = useGatewayService('hub');
  const rolesTabs = useMemo(() => {
    return [
      ...(awxService
        ? [{ label: t('Automation Execution'), page: PlatformRoute.AwxTeamRoles as string }]
        : []),
      ...(edaService
        ? [{ label: t('Automation Decisions'), page: PlatformRoute.EdaTeamRoles as string }]
        : []),
      ...(hubService
        ? [{ label: t('Automation Content'), page: PlatformRoute.HubTeamRoles as string }]
        : []),
    ];
  }, [awxService, edaService, hubService, t]);
  return (
    <>
      <PageRoutedTabs tabs={rolesTabs} params={{ id: params.id }} />
    </>
  );
}
