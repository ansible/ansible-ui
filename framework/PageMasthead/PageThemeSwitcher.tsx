import { Button, Tooltip } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useContext } from 'react';
import { PageSettingsContext } from '../PageSettings/PageSettingsProvider';
import { useTranslation } from 'react-i18next';

export function PageThemeSwitcher() {
  const { t } = useTranslation();
  const [settings, setSettings] = useContext(PageSettingsContext);

  if (settings.activeTheme === 'dark') {
    return (
      <Tooltip content={t`Enable light mode`} position="bottom">
        <Button
          icon={<MoonIcon />}
          data-cy="settings-icon"
          data-testid="settings-icon"
          variant="plain"
          onClick={() => setSettings({ ...settings, theme: 'light' })}
        />
      </Tooltip>
    );
  }

  return (
    <Tooltip content={t`Enable dark mode`} position="bottom">
      <Button
        icon={<SunIcon />}
        data-cy="theme-icon"
        data-testid="theme-icon"
        variant="plain"
        onClick={() => setSettings({ ...settings, theme: 'dark' })}
      />
    </Tooltip>
  );
}
