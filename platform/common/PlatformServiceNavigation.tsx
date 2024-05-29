import { useTranslation } from 'react-i18next';
import { PageRoutedTabs } from '../../frontend/common/PageRoutedTabs';

export function PlatformServiceNavigation(props: { awx?: string; eda?: string; hub?: string }) {
  const { t } = useTranslation();
  return (
    <PageRoutedTabs
      tabs={[
        { label: t('Automation Execution'), page: props.awx as string },
        { label: t('Automation Decisions'), page: props.eda as string },
        { label: t('Automation Content'), page: props.hub as string },
      ].filter((tab) => !!tab.page)}
    />
  );
}
