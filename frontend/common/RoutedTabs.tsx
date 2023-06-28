import {
  Children,
  isValidElement,
  ReactNode,
  ReactElement,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Divider,
  Flex,
  FlexItem,
  PageSection,
  PageSectionTypes,
  Skeleton,
  Tab,
  Tabs,
  TabsComponent,
  TabTitleText,
} from '@patternfly/react-core';
import { CaretLeftIcon } from '@patternfly/react-icons';
import { getPersistentFilters } from './PersistentFilters';

interface IRoutedTabProps {
  label?: string;
  url: string;
  children: ReactNode;
  persistentFilterKey?: string;
}

export function RoutedTabs(props: {
  baseUrl: string;
  children: ReactNode;
  preComponents?: ReactNode;
  postComponents?: ReactNode;
  initialTabIndex?: number;
  isLoading?: boolean;
}) {
  const { isLoading } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const baseUrl = replaceRouteParams(props.baseUrl, params);
  const children = useMemo<ReactElement<IRoutedTabProps>[]>(
    () =>
      Children.toArray(props.children).filter((child) => {
        if (!isValidElement(child)) {
          return false;
        }
        return child.type === RoutedTab || child.type === PageBackTab;
      }) as ReactElement<IRoutedTabProps>[],
    [props.children]
  );
  const activeKey = children.findIndex((child) => {
    const { url } = child.props;
    return location.pathname === replaceRouteParams(url, params);
  });
  useEffect(() => {
    if (activeKey === -1) {
      const firstTab = children.find((child) => child.type === RoutedTab);
      if (firstTab) {
        const url = firstTab.props.url;
        navigate(replaceRouteParams(url, params));
      }
    }
  });

  const handleSelect = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>, key: string | number) => {
      const match = children[Number(key)];
      if (!match) {
        return;
      }
      event.preventDefault();
      let url;
      if (match.type === RoutedTab) {
        url = replaceRouteParams(match.props.url, params);
      } else {
        const qs = getPersistentFilters(match.props.persistentFilterKey);
        url = `${match.props.url}${qs}`;
      }
      navigate(replaceRouteParams(url, params));
    },
    [navigate, children, params]
  );

  if (isLoading) {
    const child = activeKey === -1 ? children[0] : children[activeKey];
    return (
      <RoutedTabs baseUrl={baseUrl}>
        <RoutedTab {...child.props}>
          <PageSection variant="light">
            <Skeleton />
          </PageSection>
        </RoutedTab>
      </RoutedTabs>
    );
  }

  return (
    <>
      <PageSection type={PageSectionTypes.tabs} className="border-bottom">
        <Flex spaceItems={{ default: 'spaceItemsNone' }}>
          {props.preComponents && (
            <>
              <FlexItem>{props.preComponents}</FlexItem>
              <Divider orientation={{ default: 'vertical' }} component="div" />
            </>
          )}
          <FlexItem grow={{ default: 'grow' }}>
            <Tabs
              activeKey={activeKey}
              onSelect={handleSelect}
              inset={
                props.preComponents
                  ? undefined
                  : {
                      default: 'insetNone',
                      sm: 'insetNone',
                      md: 'insetNone',
                      lg: 'insetNone',
                      xl: 'insetSm',
                      ['2xl']: 'insetSm',
                    }
              }
              hasBorderBottom={false}
              component={TabsComponent.nav}
            >
              {children.map((child, index) => {
                const { label, url } = child.props;
                if (child.type === PageBackTab) {
                  return (
                    <PageBackTab
                      key={label ?? index}
                      label={label}
                      url={url}
                      persistentFilterKey={child.props.persistentFilterKey as string}
                      eventKey={index}
                    />
                  );
                }
                return (
                  <Tab
                    key={label ?? index}
                    title={label ? label : <Skeleton width="60px" />}
                    eventKey={index}
                    href={replaceRouteParams(url, params)}
                  />
                );
              })}
            </Tabs>
          </FlexItem>
          {props.postComponents && (
            <>
              <Divider orientation={{ default: 'vertical' }} />
              <FlexItem style={{ paddingRight: 16 }}>{props.postComponents}</FlexItem>
            </>
          )}
        </Flex>
      </PageSection>
      <Routes>
        {children.map((child, index) => {
          const { label, url = '', children } = child.props;

          return (
            <Route
              key={label ?? index}
              path={url.replace(props.baseUrl.replace('*', ''), '')}
              element={children}
            />
          );
        })}
      </Routes>
    </>
  );
}

export function RoutedTab(props: IRoutedTabProps) {
  return <>{props.children}</>;
}

export function PageBackTab(props: {
  label: React.ReactNode;
  url: string;
  persistentFilterKey?: string;
  eventKey?: number;
}) {
  const { label, url, persistentFilterKey, eventKey } = props;
  const qs = getPersistentFilters(persistentFilterKey);

  return (
    <Tab
      title={
        <TabTitleText>
          <CaretLeftIcon />
          {label}
        </TabTitleText>
      }
      href={`${url}${qs}`}
      eventKey={eventKey ?? 99}
    />
  );
}

function replaceRouteParams(path: string, params: { [key: string]: string | undefined }) {
  let newPath = path;
  Object.keys(params).forEach((key) => {
    newPath = newPath.replace(`:${key}`, params[key] ?? `:${key}`);
  });
  return newPath;
}
