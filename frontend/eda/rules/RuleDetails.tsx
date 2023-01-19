import { PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../framework';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaRule } from '../interfaces/EdaRule';
import { formatDateString } from '../../../framework/utils/formatDateString';

export function RuleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rule } = useGet<EdaRule>(`/api/rules/${params.id ?? ''}`);

  const renderRuleDetailsTab = (rule: EdaRule | undefined): JSX.Element => {
    return (
      <PageDetails>
        <PageDetail label={t('Name')}>{rule?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{rule?.description || ''}</PageDetail>
        <PageDetail label={t('Rule set')}>{rule?.ruleset?.name || ''}</PageDetail>
        <PageDetail label={t('Action type')}>
          {rule?.action ? Object.keys(rule?.action) : ''}
        </PageDetail>
        <PageDetail label={t('Project')}>{rule?.project?.name || ''}</PageDetail>
        <PageDetail label={t('Rule type')}>{rule?.type || ''}</PageDetail>
        <PageDetail label={t('Fire count')}>{rule?.fired_stats?.fire_count || 0}</PageDetail>
        <PageDetail label={t('Last fired date')}>
          {rule?.fired_stats?.fired_date ? formatDateString(rule?.fired_stats?.fired_date) : ''}
        </PageDetail>
        <PageDetail label={t('Created')}>
          {rule?.created_at ? formatDateString(rule.created_at) : ''}
        </PageDetail>
        <PageDetail label={t('Modified')}>
          {rule?.modified_at ? formatDateString(rule.modified_at) : ''}
        </PageDetail>
      </PageDetails>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={rule?.name}
        breadcrumbs={[{ label: t('Rules'), to: RouteE.EdaRules }, { label: rule?.name }]}
      />
      {rule ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderRuleDetailsTab(rule)}</PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
