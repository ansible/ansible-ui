import { Label, LabelProps } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-icon';
import OutlinedClockIcon from '@patternfly/react-icons/dist/esm/icons/outlined-clock-icon';
import SyncAltIcon from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';
import React from 'react';
import { useTranslation } from 'react-i18next';

const typeToVariantMap: Record<string, LabelProps['variant']> = {
  primary: 'outline',
  secondary: 'filled',
};

interface IProps {
  status?: string;
  type?: 'primary' | 'secondary';
  className?: string;
}

export function ImportStatusIndicator({ status, type = 'primary', className }: IProps) {
  const { t } = useTranslation();

  const statusToProps = (
    status?: string
  ): {
    color: LabelProps['color'];
    icon: React.ReactElement;
    text: string;
  } | null => {
    switch (status) {
      case 'waiting':
        return {
          color: 'blue',
          text: t`Pending`,
          icon: <OutlinedClockIcon />,
        };

      case 'skipped':
      case 'canceled':
        return {
          color: 'orange',
          text: t`Canceled`,
          icon: <ExclamationIcon />,
        };

      case 'running':
        return {
          color: 'blue',
          text: t`Running`,
          icon: <SyncAltIcon />,
        };

      case 'completed':
        return {
          color: 'green',
          text: t`Completed`,
          icon: <CheckCircleIcon />,
        };

      case 'failed':
        return {
          color: 'red',
          text: t`Failed`,
          icon: <ExclamationCircleIcon />,
        };
    }
    return null;
  };

  const labelProps = statusToProps(status);
  if (!labelProps) {
    return <>---</>;
  }

  return (
    <Label
      variant={typeToVariantMap[type]}
      color={labelProps.color}
      icon={labelProps.icon}
      className={className}
    >
      {labelProps.text}
    </Label>
  );
}
