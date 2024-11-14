import { PFColorE, TextCell } from '@ansible/ansible-ui-framework';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export const SignStatus = ({ state }: { state: 'signed' | 'unsigned' | undefined }) => {
  const { t } = useTranslation();

  switch (state) {
    case 'signed':
      return <TextCell text={t('Signed')} color={PFColorE.Success} icon={<CheckCircleIcon />} />;
    case 'unsigned':
      return (
        <TextCell
          text={t('Unsigned')}
          color={PFColorE.Warning}
          icon={<ExclamationTriangleIcon />}
        />
      );
  }

  return null;
};
