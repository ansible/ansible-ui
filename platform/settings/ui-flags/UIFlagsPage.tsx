import { PageHeader, PageLayout, PageTable, useInMemoryView } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { IUIFlag } from './IUIFlag';
import { useUIFlagColumns } from './useUIFlagColumns';
import { useUIFlagRowActions } from './useUIFlagRowActions';
import { useUIFlags } from './useUIFlags';

export function UIFlagsPage() {
  const { t } = useTranslation();
  const { flags } = useUIFlags();
  const columns = useUIFlagColumns();
  const rowActions = useUIFlagRowActions();
  const view = useInMemoryView<IUIFlag>({
    keyFn: (flag) => flag.id,
    items: flags,
    tableColumns: columns,
  });

  return (
    <PageLayout>
      <PageHeader
        title={t('User Interface Flags')}
        description={t(
          'UI-side-only flags are per-user settings that control visual or behavioral aspects of the UI without affecting backend functionality.'
        )}
        titleHelp={t(
          'UI-side-only flags are feature flags that affect only the UI and do not impact backend functionality. These flags are stored per user in local storage. They control visual elements, UI behavior, or experimental features without requiring backend changes.'
        )}
      />
      <PageTable<IUIFlag>
        id="feature-flags"
        tableColumns={columns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading feature flags')}
        {...view}
      />
    </PageLayout>
  );
}
