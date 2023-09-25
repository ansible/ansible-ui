import { PageSection, Tab, Tabs } from '@patternfly/react-core';
import { Outlet, useLocation } from 'react-router-dom';
import { useGetPageUrl, usePageNavigate } from '../../framework';

export function PageRoutedTabs(props: {
  tabs: { label: string; page: string }[];
  params?: { [key: string]: string | number };
  preComponents?: React.ReactNode;
}) {
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const onSelect = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    eventKey: number | string
  ) => {
    event.preventDefault();
    pageNavigate(eventKey.toString(), { params: props.params });
  };
  const location = useLocation();
  const activeTab = props.tabs.find(
    (tab) => getPageUrl(tab.page, { params: props.params }) === location.pathname
  );
  return (
    <>
      <Tabs
        onSelect={onSelect}
        isBox
        activeKey={activeTab?.page}
        style={{ backgroundColor: 'var(--pf-c-tabs__link--BackgroundColor)' }}
      >
        {props.preComponents}
        {props.tabs.map((tab) => (
          <Tab
            key={tab.page}
            eventKey={tab.page}
            title={tab.label}
            href={getPageUrl(tab.page, { params: props.params })}
          />
        ))}
      </Tabs>
      <PageSection variant="light" isFilled padding={{ default: 'noPadding' }}>
        <Outlet />
      </PageSection>
    </>
  );
}
