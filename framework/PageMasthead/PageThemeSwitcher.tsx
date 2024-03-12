import { Button } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useContext } from 'react';
import { PageSettingsContext } from '../PageSettings/PageSettingsProvider';

export function PageThemeSwitcher() {
  const [settings, setSettings] = useContext(PageSettingsContext);
  if (settings.activeTheme === 'dark') {
    return (
      <Button
        data-cy="settings-icon"
        variant="plain"
        onClick={() => setSettings({ ...settings, theme: 'light' })}
      >
        <MoonIcon />
      </Button>
    );
  }
  return (
    <Button
      data-cy="theme-icon"
      variant="plain"
      onClick={() => setSettings({ ...settings, theme: 'dark' })}
    >
      <SunIcon />
    </Button>
  );
}
