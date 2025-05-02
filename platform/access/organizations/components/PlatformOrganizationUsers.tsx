import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useGatewayService } from '../../../main/GatewayServices';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function PlatformOrganizationUsers() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const awxService = useGatewayService('controller');

  const usersTabs = useMemo(() => {
    return [
      {
        label: t('Ansible Automation Platform'),
        page: PlatformRoute.AAPOrganizationUsers as string,
      },
      ...(awxService
        ? [{ label: t('Automation Execution'), page: PlatformRoute.AwxOrganizationUsers as string }]
        : []),
    ];
  }, [awxService, t]);

  return (
    <>
      <PageRoutedTabs tabs={usersTabs} isBox={false} params={{ id: params.id }} />
    </>
  );
}
