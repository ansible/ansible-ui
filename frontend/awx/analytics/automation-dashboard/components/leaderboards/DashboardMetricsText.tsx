import { Content, Title } from '@patternfly/react-core';
import { ReactNode } from 'react';

export function MetricValue({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Title headingLevel="h2" size="2xl" style={{ lineHeight: 1.1 }}>
      {children}
    </Title>
  );
}

export function MetricLabel({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Content
      component="small"
      style={{ marginTop: 2, color: 'var(--pf-t--global--text--color--subtle)' }}
    >
      {children}
    </Content>
  );
}
