import { DescriptionList, PageSection } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useSettings } from '../../../framework/Settings';

export function PageDetailsSection(props: { children?: ReactNode; disablePadding?: boolean }) {
  const { disablePadding } = props;
  const settings = useSettings();
  const isCompact = false;
  return (
    <PageSection
      padding={{ default: 'noPadding' }}
      style={{
        backgroundColor:
          settings.theme === 'dark'
            ? 'var(--pf-global--BackgroundColor--300)'
            : 'var(--pf-global--BackgroundColor--100)',
      }}
    >
      <DescriptionList
        style={{ maxWidth: 1200, padding: disablePadding ? undefined : 24 }}
        isCompact={isCompact}
      >
        {props.children}
      </DescriptionList>
    </PageSection>
  );
}
