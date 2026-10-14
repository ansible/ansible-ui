import { Content } from '@patternfly/react-core';
import { ReactNode } from 'react';

/** A `<p>`, not a heading — a data value (e.g. "1,234"), not a section title. */
export function MetricValue({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Content
      component="p"
      // --pf-t--global--* tokens (defined on :root), not --pf-v6-c-title--*, which only
      // exists under a .pf-v6-c-title ancestor this <p> doesn't have.
      style={{
        fontSize: 'var(--pf-t--global--font--size--2xl)',
        fontWeight: 'var(--pf-t--global--font--weight--heading--default)',
        lineHeight: 1.1,
        margin: 0,
      }}
    >
      {children}
    </Content>
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
