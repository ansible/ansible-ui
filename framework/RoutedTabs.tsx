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
} from '@patternfly/react-core';

interface RoutedTabProps {
  label?: string;
  url: string;
  children: ReactNode;
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
  const children = useMemo<ReactElement<RoutedTabProps>[]>(
    () =>
      Children.toArray(props.children).filter(
        (child) => isValidElement(child) && child.type === RoutedTab
      ) as ReactElement<RoutedTabProps>[],
    [props.children]
  );
  const activeKey = children.findIndex((child) => {
    const { url } = child.props;
    return location.pathname === replaceRouteParams(url, params);
  });
  useEffect(() => {
    if (activeKey === -1) {
      const url = children[0].props.url;
      navigate(replaceRouteParams(url, params));
    }
  });

  const handleSelect = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>, key: string | number) => {
      const match = children[Number(key)];
      if (match) {
        event.preventDefault();
        const url = match.props.url;
        navigate(replaceRouteParams(url, params));
      }
    },
    [navigate, children, params]
  );

  if (isLoading) {
    return (
      <RoutedTabs baseUrl={baseUrl}>
        <RoutedTab url="#">
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

export function RoutedTab(props: RoutedTabProps) {
  return <>{props.children}</>;
}

function replaceRouteParams(path: string, params: { [key: string]: string | undefined }) {
  let newPath = path;
  Object.keys(params).forEach((key) => {
    newPath = newPath.replace(`:${key}`, params[key] ?? `:${key}`);
  });
  return newPath;
}
