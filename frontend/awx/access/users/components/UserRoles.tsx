import { Chip, ChipGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { AwxUser } from '../../../interfaces/User';

export function UserRoles(props: { user: AwxUser }) {
  const { user } = props;
  const { t } = useTranslation();
  return (
    <ChipGroup>
      {user.is_superuser && <Chip isReadOnly>{t('System administrator')}</Chip>}
      {!user.is_superuser && <Chip isReadOnly>{t('Normal user')}</Chip>}
    </ChipGroup>
  );
}
