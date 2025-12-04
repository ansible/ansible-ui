import { Button } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useContext } from 'react';
import { PageSettingsContext } from '../PageSettings/PageSettingsProvider';

export function PageThemeSwitcher() {
  const [settings, setSettings] = useContext(PageSettingsContext);
  if (settings.activeTheme === 'dark') {
    return (
      <Button
        icon={<MoonIcon />}
        data-cy="settings-icon"
        data-testid="settings-icon"
        variant="plain"
        onClick={() => setSettings({ ...settings, theme: 'light' })}
      />
    );
  }
  return (
    <Button
      icon={<SunIcon />}
      data-cy="theme-icon"
      data-testid="theme-icon"
      variant="plain"
      onClick={() => setSettings({ ...settings, theme: 'dark' })}
    />
  );
}
