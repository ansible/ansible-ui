import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { AwxUser } from '../../../interfaces/User';

export function UserRoles(props: { user: AwxUser }) {
  const { user } = props;
  const { t } = useTranslation();
  return (
    <LabelGroup>
      {user.is_superuser && <Label variant="outline">{t('System administrator')}</Label>}
      {!user.is_superuser && <Label variant="outline">{t('Normal user')}</Label>}
    </LabelGroup>
  );
}
