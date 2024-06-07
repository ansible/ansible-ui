import { useTranslation } from 'react-i18next';
import { PageRoutedTabs } from '../../frontend/common/PageRoutedTabs';
import { useGatewayService } from '../main/GatewayServices';
import { useMemo } from 'react';

export function PlatformServiceNavigation(props: { awx?: string; eda?: string; hub?: string }) {
  const { t } = useTranslation();
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');
  const hubService = useGatewayService('hub');
  const tabs = useMemo(() => {
    const rolesTabs = [];
    if (awxService) {
      rolesTabs.push({ label: t('Automation Execution'), page: props.awx as string });
    }

    if (edaService) {
      rolesTabs.push({ label: t('Automation Decisions'), page: props.eda as string });
    }

    if (hubService) {
      rolesTabs.push({ label: t('Automation Content'), page: props.hub as string });
    }

    return rolesTabs.filter((tab: { label: string; page: string }) => !!tab.page);
  }, [awxService, edaService, hubService, props.awx, props.eda, props.hub, t]);

  return <PageRoutedTabs tabs={tabs} />;
}
