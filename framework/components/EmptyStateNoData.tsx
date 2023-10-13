import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { ReactElement, ReactNode } from 'react';
import { EmptyStateCustom } from './EmptyStateCustom';

export function EmptyStateNoData(props: {
  button?: ReactElement;
  title: string;
  description: ReactNode;
  variant?: 'xs' | 'sm' | 'lg' | 'xl' | 'full' | undefined;
}) {
  const { button, description, title, variant } = props;
  return (
    <EmptyStateCustom
      icon={button ? PlusCircleIcon : CubesIcon}
      title={title}
      description={description}
      button={button}
      variant={variant}
    />
  );
}
