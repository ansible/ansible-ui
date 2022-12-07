import { PageSection } from '@patternfly/react-core';
import { ReactNode } from 'react';

export function DetailInfo(props: { children: ReactNode; disablePaddingTop?: boolean }) {
  return (
    <PageSection
      className="pf-c-alert pf-m-inline pf-m-info"
      style={{
        border: 0,
        paddingTop: props.disablePaddingTop ? 0 : undefined,
      }}
    >
      {props.children}
    </PageSection>
  );
}
