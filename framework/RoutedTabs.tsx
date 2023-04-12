import { Children, isValidElement, ReactNode, useCallback, useState, useMemo } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
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

function replaceRouteParams(path: string, params: { [key: string]: string | undefined }) {
  let newPath = path;
  Object.keys(params).forEach((key) => {
    newPath = newPath.replace(`:${key}`, params[key] ?? `:${key}`);
  });
  return newPath;
}

export function RoutedTabs(props: {
  baseUrl: string;
  children: ReactNode;
  preComponents?: ReactNode;
  postComponents?: ReactNode;
  initialTabIndex?: number;
  isLoading?: boolean;
}) {
  const params = useParams<{ [key: string]: string | undefined }>();
  const { isLoading } = props;
  const baseUrl = replaceRouteParams(props.baseUrl, params);
  const children = useMemo(
    () =>
      Children.toArray(props.children).filter(
        (child) => isValidElement(child) && child.type === RoutedTab
      ),
    [props.children]
  );
  const [activeKey, setActiveKey] = useState<number>(props?.initialTabIndex ?? 0);
  const navigate = useNavigate();

  const handleSelect = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>, key: number) => {
      // const match = tabsArray.find((tab) => tab.id === eventKey);
      const match = children[key];
      if (match) {
        event.preventDefault();
        setActiveKey(key);
        const url = match.props.url;
        navigate(replaceRouteParams(url, params));
      }
    },
    [setActiveKey, navigate, children, params]
  );
  const tabs = children.map((child, index) => {
    const { label, url } = child.props as RoutedTabProps;
    return (
      <Tab
        key={label ?? index}
        title={label ? label : <Skeleton width="60px" />}
        eventKey={index}
        href={replaceRouteParams(url, params)}
      />
    );
  });
  const routes = children.map((child, index) => {
    const { label, url = '', children } = child.props as RoutedTabProps;
    return (
      <Route
        key={label ?? index}
        path={url.replace(props.baseUrl.replace('*', ''), '')}
        element={children}
      />
    );
  });
  console.log(routes);

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
        {tabs}
      </Tabs>
      <Routes>{routes}</Routes>
    </>
  );

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
              onSelect={onSelect}
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
            >
              {tabs}
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
      {content}
    </>
  );
}

export function RoutedTab(props: RoutedTabProps) {
  return <>{props.children}</>;
}
