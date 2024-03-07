import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsActionsForm, AwxSettingsOptionsAction } from './AwxSettingsActionsForm';
import { awxSettingsExcludeKeys, useAwxSettingsGroups } from './useAwxSettingsGroups';

export function AwxSettingsCategoryRoute() {
  const { category: categoryId } = useParams<{ category: string }>();
  return <AwxSettingsCategory categoryId={categoryId ?? ''} />;
}

export function AwxSettingsCategory(props: { categoryId: string }) {
  const { isLoading, error, groups, options } = useAwxSettingsGroups();
  const { categoryId } = props;
  const group = groups.find((group) =>
    group.categories.some((category) => category.id === categoryId)
  );
  const category = group?.categories.find((category) => category.id === categoryId);
  const all = useGet<{ results: { url: string; slug: string; name: string }[] }>(
    awxAPI`/settings/all/`
  );

  const categoryOptions = useMemo(() => {
    const categoryOptions: Record<string, AwxSettingsOptionsAction> = {};
    if (category && options) {
      for (const [key, value] of Object.entries(options)) {
        if (awxSettingsExcludeKeys.includes(key)) continue;
        if (category?.slugs.includes(value.category_slug)) {
          categoryOptions[key] = value;
        }
      }
    }
    return categoryOptions;
  }, [category, options]);

  if (error) return <AwxError error={error} />;
  if (isLoading || !group || !category) return <LoadingPage />;
  if (all.error) return <AwxError error={all.error} />;
  if (all.isLoading || !all.data) return <LoadingPage />;

  return (
    <PageLayout>
      <PageHeader title={category.name} />
      <AwxSettingsActionsForm options={categoryOptions} data={all.data} />
    </PageLayout>
  );
}
