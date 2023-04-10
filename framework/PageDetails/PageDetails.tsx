import { DescriptionList, PageSection } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useSettings } from '../Settings';

export function PageDetails(props: {
  children?: ReactNode;
  disablePadding?: boolean;
  numberOfColumns?: 'multiple' | 'single';
}) {
  const { disablePadding } = props;
  const settings = useSettings();
  const orientation = settings.formLayout;
  const numberOfColumns = props.numberOfColumns ? props.numberOfColumns : settings.formColumns;
  const isCompact = false;
  return (
    <PageSection variant="light" padding={{ default: 'noPadding' }} className="dark-1">
      <DescriptionList
        orientation={{
          sm: orientation,
          md: orientation,
          lg: orientation,
          xl: orientation,
          '2xl': orientation,
        }}
        columnModifier={
          numberOfColumns === 'multiple'
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
