import { PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  Scrollable,
  useInMemoryView,
} from '../../../framework';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../constants';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { EdaRuleset } from '../interfaces/EdaRuleset';
import { useRulesetColumns } from './hooks/useRulesetColumns';
import { useRulesetFilters } from './hooks/useRulesetFilters';

export function RulebookDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rulebook } = useGet<EdaRulebook>(
    `${API_PREFIX}/rulebooks/${params.id ?? ''}/`,
    undefined,
    SWR_REFRESH_INTERVAL
  );

  const renderRulebookDetailsTab = (rulebook: EdaRulebook | undefined): JSX.Element => {
    return (
      <Scrollable>
        <PageSection variant="light">
          <PageDetails>
            <PageDetail label={t('Name')}>{rulebook?.name || ''}</PageDetail>
            <PageDetail label={t('Description')}>{rulebook?.description || ''}</PageDetail>
            <PageDetail label={t('Number of rules')}>{rulebook?.rule_count || ''}</PageDetail>
            <PageDetail label={t('Fire count')}>{rulebook?.fire_count || ''}</PageDetail>
            <PageDetail label={t('Created')}>
              {rulebook?.created_at ? formatDateString(rulebook.created_at) : ''}
            </PageDetail>
            <PageDetail label={t('Modified')}>
              {rulebook?.modified_at ? formatDateString(rulebook.modified_at) : ''}
            </PageDetail>
          </PageDetails>
        </PageSection>
      </Scrollable>
    );
  };

  // eslint-disable-next-line react/prop-types
  function RulesetsTab() {
    const params = useParams<{ id: string }>();
    const { t } = useTranslation();
    const toolbarFilters = useRulesetFilters();
    const { data: rulesets } = useGet<EdaResult<EdaRuleset>>(
      `${API_PREFIX}/rulebooks/${params?.id || ''}/rulesets/`
    );
    const tableColumns = useRulesetColumns();
    const view = useInMemoryView<EdaRuleset>({
      items: rulesets?.results,
      tableColumns,
      toolbarFilters,
      keyFn: (item) => item?.id,
    });

    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading rulesets')}
          emptyStateTitle={t('No rulesets yet')}
          emptyStateDescription={t('No rule sets in this rulebook')}
          {...view}
          defaultSubtitle={t('Rulebook')}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={rulebook?.name}
        breadcrumbs={[
          { label: t('Rulebooks'), to: RouteObj.EdaRulebooks },
          { label: rulebook?.name },
        ]}
      />
      {rulebook ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderRulebookDetailsTab(rulebook)}</PageTab>
          <PageTab label={t('Rule sets')}>
            <RulesetsTab />
          </PageTab>
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
