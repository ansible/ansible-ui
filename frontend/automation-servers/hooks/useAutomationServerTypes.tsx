import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationServerType } from '../AutomationServer';
import AwxIcon from '../../assets/AWX.svg';
import EdaIcon from '../../assets/EDA.svg';

export function useAutomationServerTypes() {
  const { t } = useTranslation();
  return useMemo(() => {
    const automationServerTranslations: Record<
      AutomationServerType,
      { type: AutomationServerType; name: string; description: string; icon: ReactNode }
    > = {
      [AutomationServerType.AWX]: {
        type: AutomationServerType.AWX,
        name: t('AWX'),
        description: t('Define, operate, scale, and delegate automation across your enterprise.'),
        icon: <AwxIcon />,
      },
      [AutomationServerType.EDA]: {
        type: AutomationServerType.EDA,
        name: t('Event Driven Automation'),
        description: t(
          'Connect intelligence, analytics and service requests to enable more responsive and resilient automation.'
        ),
        icon: <EdaIcon />,
      },
      [AutomationServerType.Galaxy]: {
        type: AutomationServerType.Galaxy,
        name: t('Galaxy'),
        description: t(
          'Community-driven hub for sharing, finding, and enhancing Ansible roles and collections.'
        ),
        icon: '',
      },
      [AutomationServerType.HUB]: {
        type: AutomationServerType.HUB,
        name: t('Automation Hub'),
        description: t('Discover, publish, and manage your Ansible collections.'),
        icon: '',
      },
    };
    return automationServerTranslations;
  }, [t]);
}
