import React, { ReactElement, ReactNode } from 'react';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { EmptyStateCustom } from './EmptyStateCustom';

export function EmptyStateNoData(props: {
  button?: ReactElement;
  title: string;
  description: ReactNode;
  variant: 'xs' | 'xl' | 'small' | 'large' | 'full' | undefined;
}) {
  const { button, description, title, variant } = props;
  return (
    <EmptyStateCustom
      icon={button ? PlusCircleIcon : CubesIcon}
      title={title}
      description={description}
      button={button}
      variant={variant}
      style={{ paddingTop: '48px' }}
    />
  );
}
