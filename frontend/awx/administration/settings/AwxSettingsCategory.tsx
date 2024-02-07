import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { AwxError } from '../../common/AwxError';
import { awxAPI } from '../../common/api/awx-utils';
import { OptionActionsForm, OptionsAction } from './OptionActionsForm';
import { useAwxSettingsGroups } from './useAwxSettingsGroups';

export function AwxSettingsCategory() {
  const { t } = useTranslation();
  const { category: categoryId } = useParams<{ category: string }>();
  const { isLoading, error, groups, options } = useAwxSettingsGroups();
  const group = groups.find((group) =>
    group.categories.some((category) => category.id === categoryId)
  );
  const category = group?.categories.find((category) => category.id === categoryId);
  const all = useGet<{ results: { url: string; slug: string; name: string }[] }>(
    awxAPI`/settings/all`
  );

  const categoryOptions = useMemo(() => {
    const categoryOptions: Record<string, OptionsAction> = {};
    if (category && options) {
      for (const [key, value] of Object.entries(options)) {
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
      <PageHeader
        title={category.name}
        breadcrumbs={[
          {
            label: t('Settings'),
            // to: getPageUrl(AwxRoute.Settings)
          },
          { label: category.name },
        ]}
      />
      <OptionActionsForm options={categoryOptions} data={all.data} />
    </PageLayout>
  );
}
