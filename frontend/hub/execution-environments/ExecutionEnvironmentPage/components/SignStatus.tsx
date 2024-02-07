import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export const SignStatus = ({ state }: { state: 'signed' | 'unsigned' | undefined }) => {
  const { t } = useTranslation();

  switch (state) {
    case 'signed':
      return (
        <Label icon={<CheckCircleIcon />} variant="outline" color="green">
          {' ' + t('Signed')}
        </Label>
      );
    case 'unsigned':
      return (
        <Label icon={<ExclamationTriangleIcon />} variant="outline" color="orange">
          {' ' + t('Unsigned')}
        </Label>
      );
  }

  return null;
};
