import { Tab, TabProps, TabTitleText, Tabs } from '@patternfly/react-core';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout, useGetPageUrl, usePageNavigate } from '..';
import { getPersistentFilters } from '../../frontend/common/PersistentFilters';
import { usePageBreadcrumbs } from './PageBreadcrumbs';
import './PageTabs.css';

export function PageRoutedTabs(props: {
  backTab?: { label: string; page: string; persistentFilterKey: string };
  tabs: ({ label: string; page: string; dataCy?: string } | false)[];
  params?: { [key: string]: string | number | undefined };
  // Use to pass data to tab's component. To access data in that component use useOutletContext()
  componentParams?: { [key: string]: unknown };

  // url query keys that are shared accross tabs, the rest query strings will dissappear when switching tabs
  sharedQueryKeys?: string[];
}) {
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  const location = useLocation();
  const { setTabBreadcrumb } = usePageBreadcrumbs();

  const activeTab = props.tabs.find(
    (tab) => tab && getPageUrl(tab.page, { params: props.params }) === location.pathname
  );

  // Set current active tab to tabBreadcrumb in the PageBreadcrumbContext
  useEffect(() => {
    if (activeTab) {
      setTabBreadcrumb({ label: activeTab.label });
      return () => setTabBreadcrumb(undefined);
    } else {
      setTabBreadcrumb(undefined);
    }
  }, [activeTab, setTabBreadcrumb]);

  const [searchParams] = useSearchParams();

  const sharedQueryKeysObj: Record<string, string | number | undefined> = {};
  if (props.sharedQueryKeys) {
    for (const key of props.sharedQueryKeys) {
      sharedQueryKeysObj[key] = searchParams.get(key) || '';
    }
  }

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
      pageNavigate(eventKey.toString(), { params: props.params, query: sharedQueryKeysObj });
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
          href={getPageUrl(tab.page, { params: props.params, query: sharedQueryKeysObj })}
          data-cy={tab.dataCy}
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
        style={{
          backgroundColor: 'var(--pf-v5-c-tabs__link--BackgroundColor)',
          flexShrink: 0,
        }}
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
            data-cy={props.backTab.label.replace(' ', '-').toLocaleLowerCase()}
          />
        )}
        {tabs}
      </Tabs>

      {/* This div is needed to flex grow to fill the page space. */}
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* PageLayout now sets its max height to 100% which is 100% of the div above, which allows it's contents to scroll. */}
        <PageLayout>
          <Outlet context={props.componentParams} />
        </PageLayout>
      </div>
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
