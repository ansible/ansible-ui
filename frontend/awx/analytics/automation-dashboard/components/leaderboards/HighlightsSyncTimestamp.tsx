import { Content, Icon } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export function HighlightsSyncTimestamp(props: Readonly<{ lastSyncedAt: string | null }>) {
  const { t } = useTranslation();
  const { lastSyncedAt } = props;

  // "no data collected yet" message belongs here — deferred for now, so render nothing.
  // An unparseable timestamp is treated the same way rather than showing "Invalid Date".
  const syncedAt = lastSyncedAt ? new Date(lastSyncedAt) : null;
  if (!syncedAt || Number.isNaN(syncedAt.getTime())) {
    return null;
  }

  const formatted = syncedAt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });

  return (
    <Content
      component="small"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        color: 'var(--pf-t--global--text--color--subtle)',
      }}
    >
      <Icon size="sm">
        <InfoCircleIcon color="var(--pf-t--global--text--color--subtle)" />
      </Icon>
      {t('All data is shown as from the last 30 days with the last sync on {{timestamp}} UTC', {
        timestamp: formatted,
      })}
    </Content>
  );
}
