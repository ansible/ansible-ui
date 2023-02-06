import { DescriptionList, PageSection } from '@patternfly/react-core';
import { ReactNode } from 'react';

export function PageDetailsSection(props: { children?: ReactNode; disablePadding?: boolean }) {
  const { disablePadding } = props;
  const isCompact = false;
  return (
    <PageSection padding={{ default: 'noPadding' }} className="dark-2">
      <DescriptionList
        style={{ maxWidth: 1200, padding: disablePadding ? undefined : 24 }}
        isCompact={isCompact}
      >
        {props.children}
      </DescriptionList>
    </PageSection>
  );
}
