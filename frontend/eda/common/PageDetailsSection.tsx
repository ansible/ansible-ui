import { DescriptionList, PageSection } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useSettings } from '../../../framework/Settings';
import styled from 'styled-components';

export const Section = styled(PageSection)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 204px);
`;

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
