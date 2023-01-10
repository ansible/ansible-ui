import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageDetail,
  PageDetails,
  PageActions,
  PageBody,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  useInMemoryView,
  PageTable,
} from '../../../framework';
import { Scrollable } from '../../../framework';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { useRulebookActions } from './hooks/useRulebookActions';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { formatDateString } from '../../../framework/utils/formatDateString';
import { useRulesetFilters } from './hooks/useRulesetFilters';
import { useRulesetColumns } from './hooks/useRulesetColumns';
import { idKeyFn } from '../../hub/usePulpView';
import { EdaRuleset } from '../interfaces/EdaRuleset';
import { useRulesetActions } from './hooks/useRulesetActions';

export function RulebookDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rulebook, mutate: refresh } = useGet<EdaRulebook>(
    `/api/rulebooks/${params.id ?? ''}`
  );
  const itemActions = useRulebookActions(rulebook, refresh);

  const renderRulebookDetailsTab = (rulebook: EdaRulebook | undefined): JSX.Element => {
    return (
      <Scrollable>
        <PageSection variant="light">
          <PageDetails>
            <PageDetail label={t('Name')}>{rulebook?.name || ''}</PageDetail>
            <PageDetail label={t('Description')}>{rulebook?.description || ''}</PageDetail>
            <PageDetail label={t('Number of rule sets')}>
              {rulebook?.ruleset_count || 'Git'}
            </PageDetail>
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
    const { data: rulesets, mutate: refresh } = useGet<EdaRuleset[]>(
      `/api/rulebooks/${params?.id || ''}/rulesets`
    );
    const tableColumns = useRulesetColumns();
    const view = useInMemoryView<EdaRuleset>({
      items: rulesets,
      tableColumns,
      toolbarFilters,
      keyFn: idKeyFn,
    });

    const rowActions = useRulesetActions(undefined, refresh);
    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          rowActions={rowActions}
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
          { label: t('Rulebooks'), to: RouteE.EdaRulebooks },
          { label: rulebook?.name },
        ]}
        headerActions={
          <PageActions<EdaRulebook>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={rulebook}
          />
        }
      />
      <Scrollable>
        <PageBody>
          {rulebook ? (
            <PageTabs>
              <PageTab label={t('Details')}>{renderRulebookDetailsTab(rulebook)}</PageTab>
              <PageTab label={t('Rule Sets')}>
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
        </PageBody>
      </Scrollable>
    </PageLayout>
  );
}
