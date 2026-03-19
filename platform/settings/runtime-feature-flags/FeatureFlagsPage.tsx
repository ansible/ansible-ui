import {
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageNotFound,
  PageTable,
  ToolbarFilterType,
  useInMemoryView,
} from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformActiveUser } from '../../main/PlatformActiveUserProvider';
import { IFeatureFlag } from './IFeatureFlag';
import { useFeatureFlagColumns } from './useFeatureFlagColumns';
import { useFeatureFlagRowActions } from './useFeatureFlagRowActions';
import { useRuntimeFeatureFlags } from './useRuntimeFeatureFlags';
import { useRuntimeFeatureFlagsEnabled } from './useRuntimeFeatureFlagsEnabled';

export function FeatureFlagsPage() {
  const { t } = useTranslation();
  const { activePlatformUser } = usePlatformActiveUser();
  const { isEnabled: runtimeFeatureFlagsEnabled, isLoading } = useRuntimeFeatureFlagsEnabled();
  const isSuperuser = !!activePlatformUser?.is_superuser;
  const isAuditor = !!activePlatformUser?.is_platform_auditor;
  const { flags, error, refresh } = useRuntimeFeatureFlags();
  const columns = useFeatureFlagColumns({ isReadOnly: !isSuperuser });
  const rowActions = useFeatureFlagRowActions({ refresh });

  const labelOptions = useMemo(
    () =>
      [...new Set(flags.flatMap((flag) => flag.labels))]
        .sort((a, b) => a.localeCompare(b))
        .map((label) => ({
          label,
          value: label,
        })),
    [flags]
  );

  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: ToolbarFilterType.MultiText,
        comparison: 'contains',
        query: 'ui_name',
        placeholder: t('Filter by name'),
      },
      {
        key: 'support_level',
        label: t('Support level'),
        type: ToolbarFilterType.MultiSelect,
        query: 'support_level',
        placeholder: t('Filter by support level'),
        options: [
          { label: t('Technology preview'), value: 'TECHNOLOGY_PREVIEW' },
          { label: t('Developer preview'), value: 'DEVELOPER_PREVIEW' },
        ],
      },
      {
        key: 'labels',
        label: t('Labels'),
        type: ToolbarFilterType.MultiSelect,
        query: 'labels',
        placeholder: t('Filter by label'),
        options: labelOptions,
      },
    ],
    [t, labelOptions]
  );

  const view = useInMemoryView<IFeatureFlag>({
    keyFn: (flag) => flag.id,
    items: flags,
    tableColumns: columns,
    toolbarFilters,
  });

  if (!isSuperuser && !isAuditor) {
    return <PageNotFound />;
  }

  if (!isLoading && !runtimeFeatureFlagsEnabled) {
    return <PageNotFound />;
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Feature Flags')}
        description={t(
          'Feature flags allow you to enable or disable platform features. Runtime flags can be toggled on or off, while install-time flags are read-only.'
        )}
      />
      <PageTable<IFeatureFlag>
        id="runtime-feature-flags"
        toolbarFilters={toolbarFilters}
        tableColumns={columns}
        rowActions={isSuperuser ? rowActions : undefined}
        errorStateTitle={t('Error loading feature flags')}
        emptyStateTitle={t('No feature flags')}
        emptyStateDescription={t('No feature flags are available.')}
        {...view}
        error={error}
      />
    </PageLayout>
  );
}
