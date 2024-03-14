import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  ITableColumn,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageTable,
} from '../../../../../framework';
import { useMemo } from 'react';
import { PencilAltIcon } from '@patternfly/react-icons';
import { RRule } from 'rrule';
import { useFormContext } from 'react-hook-form';

export function OccurrencesList(props: { setIsOpen: (isOpen: boolean) => void }) {
  const { t } = useTranslation();
  const { getValues } = useFormContext();
  const rules = getValues('rules') as { id: number; rule: RRule }[];

  const rowActions = useMemo<IPageAction<{ rule: RRule }>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit rule'),
        onClick: () => {},
        isPinned: true,
      },
    ],
    [t]
  );
  const columns = useMemo<ITableColumn<{ rule: RRule }>[]>(
    () => [
      {
        header: 'Rrule',
        type: 'text',
        value: (item: { rule: RRule }) => RRule.optionsToString(item.rule.options),
      },
      {
        header: 'Description',
        type: 'text',
        value: (item: { rule: RRule }) => {
          const ruleOptions = new RRule(item.rule.options);
          const text = t('Non-parseable rule');
          try {
            ruleOptions?.toText();
            return ruleOptions?.toText();
          } catch {
            return text;
          }
        },
      },
    ],
    [t]
  );

  const view = {
    pageItems: rules,
    keyFn: (item: { rule: RRule; id: number }) => {
      return item?.id?.toString();
    },
    tableColumns: columns,
    itemCount: rules?.length || 0,
  };

  return (
    <div>
      <PageHeader
        title={t('Schedule Rules')}
        titleHelpTitle={t('Schedule Rules')}
        titleHelp={t('Create as many schedule rules as you need.')}
        titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/scheduling.html"
        description={t(
          'Schedule rules are a component of an overall schedule.  A schedule rule is used to determine when a schedule will run.  A schedule can have multiple rules.'
        )}
      />
      <PageTable<{ id: number; rule: RRule }>
        id="awx-schedule-rules-table"
        rowActions={rowActions}
        errorStateTitle={t('Error loading occurrences')}
        emptyStateTitle={t('No occurrences yet')}
        emptyStateDescription={t('To get started, create an occurrence.')}
        emptyStateButtonText={t('Create Occurrence')}
        emptyStateButtonClick={() => props.setIsOpen(true)}
        defaultSubtitle={t('Occurrences')}
        disablePagination
        page={1}
        perPage={1}
        setPage={() => 1}
        setPerPage={() => 1}
        {...view}
      />
    </div>
  );
}
