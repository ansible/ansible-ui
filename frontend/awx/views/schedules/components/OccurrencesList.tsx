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
export type ListItemType = { id: number } & { [key: string]: RRule };
export function OccurrencesList(props: {
  listItems: ListItemType[];
  ruleType: string;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { setIsOpen, ruleType, listItems } = props;
  const isExceptions = ruleType === 'exception';
  const { t } = useTranslation();
  const rowActions = useMemo<IPageAction<ListItemType>[]>(
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
  const columns = useMemo<ITableColumn<ListItemType>[]>(
    () => [
      {
        header: 'Rrule',
        type: 'text',
        value: (item: ListItemType) => RRule.optionsToString(item.rule.options),
      },
      {
        header: 'Description',
        type: 'text',
        value: (item: ListItemType) => {
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
    pageItems: listItems,
    keyFn: (item: ListItemType) => {
      return item?.id?.toString();
    },
    tableColumns: columns,
    itemCount: listItems?.length || 0,
  };
  const description = isExceptions
    ? t(
        'Schedule rules are a component of an overall schedule.  A schedule rule is used to determine when a schedule will run.  A schedule can have multiple rules.'
      )
    : t(
        'Schedule exception are a component of an overall schedule.  A schedule exception is used to exclude dates from the schedule.  A schedule can have multiple exceptions.'
      );
  return (
    <div>
      <PageHeader
        title={isExceptions ? t('Schedule Exceptions') : t('Schedule Rules')}
        titleHelpTitle={isExceptions ? t('Schedule Exceptions') : t('Schedule Rules')}
        titleHelp={t('Create as many schedule rules as you need.')}
        titleDocLink="https://docs.ansible.com/automation-controller/latest/html/userguide/scheduling.html"
        description={description}
      />
      <PageTable<ListItemType>
        id="awx-schedule-rules-table"
        rowActions={rowActions}
        errorStateTitle={
          isExceptions ? t('Error loading exceptions') : t('Error loading occurrences')
        }
        emptyStateTitle={isExceptions ? t('No exceptions yet') : t('No occurrences yet')}
        emptyStateDescription={
          isExceptions
            ? t('To get started, create an exception.')
            : t('To get started, create an occurrence.')
        }
        emptyStateButtonText={isExceptions ? t('Create exception') : t('Create Occurrence')}
        emptyStateButtonClick={() => setIsOpen(true)}
        defaultSubtitle={isExceptions ? t('Exceptions') : t('Occurrences')}
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
