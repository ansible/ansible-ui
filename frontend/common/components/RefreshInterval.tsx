import { Tooltip } from '@patternfly/react-core';
import { ReactNode, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRConfig } from 'swr';
import { SettingsContext } from '../../../framework';
import { PageSingleSelect } from '../../../framework/PageInputs/PageSingleSelect';

export function RefreshIntervalSelect() {
  const { t } = useTranslation();
  const { settings, setSettings } = useContext(SettingsContext);
  const interval = settings.refreshInterval || 60;
  const setInterval = useCallback(
    (value: number) => setSettings((settings) => ({ ...settings, refreshInterval: value })),
    [setSettings]
  );
  return (
    <Tooltip content={t('Refresh interval')}>
      <PageSingleSelect
        placeholder={t('Select interval')}
        value={interval}
        onSelect={setInterval}
        options={[
          { label: t('1 second'), value: 1 },
          { label: t('5 seconds'), value: 5 },
          { label: t('10 seconds'), value: 10 },
          { label: t('30 seconds'), value: 30 },
          { label: t('1 minute'), value: 60 },
          { label: t('5 minutes'), value: 300 },
          { label: t('10 minutes'), value: 600 },
          { label: t('30 minutes'), value: 1800 },
          { label: t('1 hour'), value: 3600 },
          { label: t('Never'), value: 0 },
        ]}
      />
    </Tooltip>
  );
}

export function RefreshIntervalProvider(props: { children: ReactNode }) {
  const { settings } = useContext(SettingsContext);
  return (
    <SWRConfig value={{ refreshInterval: (settings.refreshInterval || 60) * 1000 }}>
      {props.children}
    </SWRConfig>
  );
}
