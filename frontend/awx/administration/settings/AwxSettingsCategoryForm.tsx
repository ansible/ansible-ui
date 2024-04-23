import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxSettingsForm, AwxSettingsOptionsAction } from './AwxSettingsForm';
import {
  awxSettingsExcludeKeys,
  useAwxSettingsGroups,
  useAwxSettingsGroupsBase,
} from './useAwxSettingsGroups';

export function AwxSettingsCategoryFormRoute() {
  const { category: categoryId } = useParams<{ category: string }>();
  return <AwxSettingsCategoryForm categoryId={categoryId ?? ''} />;
}

export function AwxSettingsCategoryForm(props: { categoryId: string }) {
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

  const groupsBase = useAwxSettingsGroupsBase();

  if (error) return <AwxError error={error} />;
  if (isLoading || !group || !category) return <LoadingPage />;
  if (all.error) return <AwxError error={all.error} />;
  if (all.isLoading || !all.data) return <LoadingPage />;

  const title = groupsBase.find((group) => group.id === categoryId)?.name;

  return (
    <PageLayout>
      <PageHeader title={title ?? category.name} />
      <AwxSettingsForm options={categoryOptions} data={all.data} />
    </PageLayout>
  );
}
