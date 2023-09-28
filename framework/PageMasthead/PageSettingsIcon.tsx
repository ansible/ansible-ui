import { Button, ButtonVariant } from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useSettingsDialog } from '../Settings';

export function PageSettingsIcon() {
  const { t } = useTranslation();
  const openSettings = useSettingsDialog(t);
  return (
    <Button
      data-cy="settings-icon"
      icon={<CogIcon />}
      variant={ButtonVariant.plain}
      onClick={openSettings}
    />
  );
}
