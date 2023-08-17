import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../../framework';
import { useGetCreateRuleRoute } from '../hooks/scheduleHelpers';
import { useMemo } from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusIcon } from '@patternfly/react-icons';

export function ScheduleRules(props: { rrule: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const createUrl: string = useGetCreateRuleRoute();
  const [_dtstart, ...rules] = props.rrule.split(' ');

  const mappedRRules = rules.map((rule) => ({ rrule: rule }));
  const rowActions = useMemo<IPageAction<{ rrule: string }>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit rule'),
        onClick: () => navigate(createUrl),
        isPinned: true,
      },
    ],
    [createUrl, navigate, t]
  );
  const toolbarActions = useMemo<IPageAction<{ rrule: string }>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Create rule'),
        href: createUrl,
      },
    ],
    [createUrl, t]
  );
  const columns = useMemo<ITableColumn<{ rrule: string }>>(
    () => ({
      header: 'Rrule',
      type: 'text',
      value: (item: { rrule: string }) => item.rrule,
    }),
    []
  );
  const view = {
    pageItems: mappedRRules,
    keyFn: (item: { rrule: string }) => item.rrule,
    tableColumns: [columns],
    itemCount: mappedRRules.length,
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Schedule Rules')}
        titleHelpTitle={t('Schedule Rules')}
        titleHelp={t('Create as many schedule rules as you need.')}
        titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/scheduling.html"
        description={t(
          'Schedule rules are a component of an overall schedule.  A schedule rule is used to determine when a schedule will run.  A schedule can have multiple rules.'
        )}
      />
      <PageTable<{ rrule: string }>
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        errorStateTitle={t('Error loading rule')}
        emptyStateTitle={t('No rules yet')}
        emptyStateDescription={t('To get started, create a rule.')}
        emptyStateButtonText={t('Create Rule')}
        emptyStateButtonClick={() => navigate(createUrl)}
        defaultSubtitle={t('Rules')}
        {...view}
      />
    </PageLayout>
  );
}
