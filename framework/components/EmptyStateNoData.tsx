import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { ReactElement, ReactNode, ComponentClass } from 'react';
import { EmptyStateCustom } from './EmptyStateCustom';

export function EmptyStateNoData(props: {
  button?: ReactElement;
  title: string;
  description: ReactNode;
  variant?: 'xs' | 'sm' | 'lg' | 'xl' | 'full' | undefined;
  icon?: ComponentClass;
}) {
  const { button, description, title, variant, icon: Icon } = props;
  return (
    <EmptyStateCustom
      icon={Icon ?? (button ? PlusCircleIcon : CubesIcon)}
      title={title}
      description={description}
      button={button}
      variant={variant}
    />
  );
}
