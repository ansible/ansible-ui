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

export function OccurrencesList() {
  const { t } = useTranslation();

  const rowActions = useMemo<IPageAction<{ rrule: string }>[]>(
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

  const columns = useMemo<ITableColumn<{ rrule: string }>[]>(
    () => [
      {
        header: 'Rrule',
        type: 'text',
        value: (item: { rrule: string }) => item.rrule,
      },
      {
        header: 'Description',
        type: 'text',
        value: (item: { rrule: string }) => {
          const options = RRule.fromString(item.rrule);
          return options.toText();
        },
      },
    ],
    []
  );

  const view = {
    pageItems: [
      {
        rrule: 'FREQ=DAILY;INTERVAL=1;COUNT=10',
      },
    ],
    keyFn: (item: { rrule: string }) => item.rrule,
    tableColumns: columns,
    itemCount: 1,
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
      <PageTable<{ rrule: string }>
        id="awx-schedule-rules-table"
        rowActions={rowActions}
        errorStateTitle={t('Error loading rule')}
        emptyStateTitle={t('No rules yet')}
        emptyStateDescription={t('To get started, create a rule.')}
        emptyStateButtonText={t('Create Rule')}
        emptyStateButtonClick={() => {}}
        defaultSubtitle={t('Rules')}
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
