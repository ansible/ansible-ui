import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { AwxError } from '../../common/AwxError';
import { AwxRoute } from '../../main/AwxRoutes';
import { useSettingsGroups } from './AwxSettings';
import { OptionActionsForm } from './OptionActionsForm';

export function AwxSettingsCategory() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { category } = useParams<{ category: string }>();
  const { isLoading, error, groups } = useSettingsGroups();
  if (error) return <AwxError error={error} />;
  if (isLoading) return <LoadingPage />;
  const group = groups.find((group) => group.name === category);
  if (!group) return <AwxError error={new Error(`Category not found: ${category}`)} />;
  return (
    <PageLayout>
      <PageHeader
        title={category}
        breadcrumbs={[
          { label: t('Settings'), to: getPageUrl(AwxRoute.Settings) },
          { label: category },
        ]}
      />
      <OptionActionsForm options={group.categories[0].slugs[0].options} />
    </PageLayout>
  );
}
