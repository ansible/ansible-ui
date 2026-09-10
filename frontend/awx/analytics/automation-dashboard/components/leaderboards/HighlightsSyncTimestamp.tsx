import { Content, Flex, FlexItem, Icon } from '@patternfly/react-core';
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

  // Shown in the viewer's local time zone.
  const formatted = syncedAt.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Flex
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      alignItems={{ default: 'alignItemsCenter' }}
      flexWrap={{ default: 'wrap' }}
      gap={{ default: 'gapSm' }}
      style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
    >
      <FlexItem>
        <Content component="small" style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
          {t('Data shown below is based on the last 30 days of your activity.')}
        </Content>
      </FlexItem>
      <FlexItem style={{ marginLeft: 'auto' }}>
        <Content
          component="small"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--pf-t--global--text--color--subtle)',
            whiteSpace: 'nowrap',
          }}
        >
          <Icon size="sm">
            <InfoCircleIcon color="var(--pf-t--global--text--color--subtle)" />
          </Icon>
          {t('Updated: {{timestamp}}', { timestamp: formatted })}
        </Content>
      </FlexItem>
    </Flex>
  );
}
