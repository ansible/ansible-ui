import {
  Divider,
  Flex,
  FlexItem,
  PageSection,
  PageSectionTypes,
  Skeleton,
  Tab,
  Tabs,
} from '@patternfly/react-core';
import { Children, ReactNode, isValidElement, useCallback, useState } from 'react';

export function PageTabs(props: {
  children: ReactNode;
  preComponents?: ReactNode;
  postComponents?: ReactNode;
  initialTabIndex?: number;
  loading?: boolean;
}) {
  const { loading } = props;
  const [activeKey, setActiveKey] = useState<number>(props?.initialTabIndex ?? 0);
  const onSelect = useCallback(
    (_: unknown, key: string | number) => setActiveKey(key as number),
    [setActiveKey]
  );
  const children = Children.toArray(props.children);
  const tabs = children.map((child, index) => {
    if (isValidElement(child)) {
      if (child.type === PageTab) {
        const label = (child.props as { label: string }).label;
        return (
          <Tab
            key={label ?? index}
            title={label ? label : <Skeleton width="60px" />}
            eventKey={index}
          />
        );
      }
    }
    return child;
  });
  const content = children[activeKey];

  if (loading) {
    return (
      <PageTabs>
        <PageTab>
          <PageSection variant="light">
            <Skeleton />
          </PageSection>
        </PageTab>
      </PageTabs>
    );
  }

  return (
    <>
      <PageSection type={PageSectionTypes.tabs} className="border-bottom">
        <Flex spaceItems={{ default: 'spaceItemsNone' }}>
          {props.preComponents && (
            <>
              <FlexItem
              // style={{ paddingLeft: 16 }}
              >
                {props.preComponents}
              </FlexItem>
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
              isBox
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

export function PageTab(props: { label?: string; children: ReactNode }) {
  return <>{props.children}</>;
}
