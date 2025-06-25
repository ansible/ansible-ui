import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useGatewayService } from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function PlatformTeamUsers() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const awxService = useGatewayService('controller');
  const hubService = useGatewayService('hub');

  const usersTabs = useMemo(() => {
    return [
      {
        label: t('Ansible Automation Platform'),
        page: PlatformRoute.AAPTeamUsers as string,
      },
      ...(awxService
        ? [{ label: t('Automation Execution'), page: PlatformRoute.AwxTeamUsers as string }]
        : []),
      ...(hubService
        ? [{ label: t('Automation Content'), page: PlatformRoute.HubTeamUsers as string }]
        : []),
    ];
  }, [awxService, hubService, t]);

  return (
    <>
      <PageRoutedTabs tabs={usersTabs} isBox={false} params={{ id: params.id }} />
    </>
  );
}
