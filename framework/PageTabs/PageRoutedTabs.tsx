import { PageSection, Tab, TabProps, TabTitleText, Tabs } from '@patternfly/react-core';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGetPageUrl, usePageNavigate } from '..';
import { getPersistentFilters } from '../../frontend/common/PersistentFilters';

export function PageRoutedTabs(props: {
  backTab?: { label: string; page: string; persistentFilterKey: string };
  tabs: ({ label: string; page: string } | false)[];
  params?: { [key: string]: string | number | undefined };
}) {
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  const location = useLocation();
  const activeTab = props.tabs.find(
    (tab) => tab && getPageUrl(tab.page, { params: props.params }) === location.pathname
  );
  const querystring = getPersistentFilters(props.backTab?.persistentFilterKey);
  const query = parseQuery(querystring);
  const onSelect = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    eventKey: number | string
  ) => {
    event.preventDefault();
    if (eventKey === props.backTab?.page) {
      navigate(getPageUrl(eventKey.toString(), { params: props.params, query }));
    } else {
      pageNavigate(eventKey.toString(), { params: props.params });
    }
  };

  const tabs = props.tabs
    .filter((tab) => !!tab)
    .map((tab) =>
      tab ? (
        <Tab
          key={tab.page}
          eventKey={tab.page}
          title={tab.label}
          href={getPageUrl(tab.page, { params: props.params })}
        />
      ) : null
    ) as unknown as TabsChild;

  return (
    <>
      <Tabs
        onSelect={onSelect}
        inset={{ default: 'insetSm' }}
        isBox
        activeKey={activeTab ? activeTab.page : undefined}
        style={{ backgroundColor: 'var(--pf-c-tabs__link--BackgroundColor)' }}
      >
        {props.backTab && (
          <Tab
            key={props.backTab.page}
            eventKey={props.backTab.page}
            title={
              <TabTitleText>
                <CaretLeftIcon />
                <span style={{ marginLeft: 6 }}>{props.backTab.label}</span>
              </TabTitleText>
            }
            href={getPageUrl(props.backTab.page, { params: props.params, query })}
          />
        )}
        {tabs}
      </Tabs>
      <PageSection variant="light" isFilled padding={{ default: 'noPadding' }}>
        <Outlet />
      </PageSection>
    </>
  );
}

function parseQuery(queryString: string) {
  const query: Record<string, string> = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    if (pair.length < 2) continue;
    const key = decodeURIComponent(pair[0]);
    const value = decodeURIComponent(pair[1] || '');
    query[key] = decodeURIComponent(value);
  }
  return query;
}

type TabElement = React.ReactElement<TabProps, React.JSXElementConstructor<TabProps>>;
type TabsChild = TabElement | boolean | null | undefined;
