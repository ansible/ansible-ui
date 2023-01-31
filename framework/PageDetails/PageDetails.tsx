import { DescriptionList, PageSection } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useSettings } from '../Settings';

export function PageDetails(props: { children?: ReactNode; disablePadding?: boolean }) {
  const { disablePadding } = props;
  const settings = useSettings();
  const orientation = settings.formLayout;
  const columns = settings.formColumns;
  const isCompact = false;
  return (
    <PageSection
      padding={{ default: 'noPadding' }}
      style={{
        backgroundColor:
          settings.activeTheme === 'dark'
            ? 'var(--pf-global--BackgroundColor--300)'
            : 'var(--pf-global--BackgroundColor--100)',
      }}
    >
      <DescriptionList
        orientation={{
          sm: orientation,
          md: orientation,
          lg: orientation,
          xl: orientation,
          '2xl': orientation,
        }}
        columnModifier={
          columns === 'multiple'
            ? {
                default: '1Col',
                sm: '1Col',
                md: '2Col',
                lg: '2Col',
                xl: '3Col',
                '2xl': '3Col',
              }
            : undefined
        }
        style={{ maxWidth: 1200, padding: disablePadding ? undefined : 24 }}
        isCompact={isCompact}
      >
        {props.children}
      </DescriptionList>
    </PageSection>
  );
}
