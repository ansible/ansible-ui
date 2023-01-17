import React, { ReactElement, ReactNode } from 'react';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { EmptyStateCustom } from './EmptyStateCustom';

export function EmptyStateNoData(props: {
  button?: ReactElement;
  title: string;
  description: ReactNode;
}) {
  const { button, description, title } = props;
  return (
    <EmptyStateCustom
      icon={button ? PlusCircleIcon : CubesIcon}
      title={title}
      description={description}
      button={button}
    />
  );
}
