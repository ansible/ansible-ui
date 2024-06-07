import { useMemo } from 'react';
import { useGatewayService } from '../../../main/GatewayServices';
import { useTranslation } from 'react-i18next';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useParams } from 'react-router-dom';
import { PageRoutedTabs } from '../../../../frontend/common/PageRoutedTabs';

export function PlatformTeamRoles() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');
  const rolesTabs = useMemo(() => {
    return [
      ...(awxService
        ? [{ label: t('Automation Execution'), page: PlatformRoute.AwxTeamRoles as string }]
        : []),
      ...(edaService
        ? [{ label: t('Automation Decisions'), page: PlatformRoute.EdaTeamRoles as string }]
        : []),
    ];
  }, [awxService, edaService, t]);
  return (
    <>
      <PageRoutedTabs tabs={rolesTabs} isBox={false} params={{ id: params.id }} />
    </>
  );
}
