import { DescriptionList, PageSection } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { usePageSettings } from '../../../framework/PageSettings/PageSettingsProvider';

export function PageDetailsSection(props: { children?: ReactNode; disablePadding?: boolean }) {
  const { disablePadding } = props;
  const settings = usePageSettings();
  const isCompact = false;
  return (
    <PageSection
      padding={{ default: 'noPadding' }}
      style={{
        backgroundColor:
          settings.theme === 'dark'
            ? 'var(--pf-v5-global--BackgroundColor--300)'
            : 'var(--pf-v5-global--BackgroundColor--100)',
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
