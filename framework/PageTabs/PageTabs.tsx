import { PageSection, Skeleton, Tab, TabProps, Tabs } from '@patternfly/react-core';
import { Children, ReactNode, isValidElement, useCallback, useState } from 'react';

export function PageTabs(props: {
  children: ReactNode;
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
      <Tabs
        activeKey={activeKey}
        onSelect={onSelect}
        inset={{ default: 'insetSm' }}
        isBox
        style={{ flexShrink: 0, backgroundColor: 'var(--pf-v5-c-tabs__link--BackgroundColor)' }}
      >
        {tabs as unknown as TabsChild}
      </Tabs>
      {content}
    </>
  );
}

export function PageTab(props: { label?: string; children: ReactNode }) {
  return <>{props.children}</>;
}

type TabElement = React.ReactElement<TabProps, React.JSXElementConstructor<TabProps>>;
type TabsChild = TabElement | boolean | null | undefined;
