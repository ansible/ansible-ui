import { useTranslation } from 'react-i18next';
import { ITableColumn, PageHeader, PageTable } from '../../../../../framework';
import { useMemo } from 'react';
import { RRule } from 'rrule';
import { useRuleRowActions } from '../hooks/useRuleRowActions';
import { RuleListItemType } from '../types';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function RulesList(props: {
  setIsOpen: (isOpen: boolean | number) => void;
  ruleType: string;
  rules: RuleListItemType[];
}) {
  const { t } = useTranslation();

  const isExceptions = props.ruleType === 'exception';

  const rowActions = useRuleRowActions(props.rules, props.setIsOpen);
  const columns = useMemo<ITableColumn<RuleListItemType>[]>(
    () => [
      {
        header: 'Rrule',
        type: 'text',
        value: (item: RuleListItemType) => {
          return RRule.optionsToString(item.rule.options);
        },
      },
      {
        header: 'Description',
        type: 'text',
        value: (item: RuleListItemType) => {
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
    pageItems: props.rules,
    keyFn: (item: RuleListItemType) => {
      return item?.id?.toString();
    },
    tableColumns: columns,
    itemCount: props.rules?.length || 0,
  };
  const description = isExceptions
    ? t(
        'Schedule rules are a component of an overall schedule.  A schedule rule is used to determine when a schedule will run.  A schedule can have multiple rules.'
      )
    : t(
        'Schedule exceptions are a component of an overall schedule.  A schedule exception is used to exclude dates from the schedule.  A schedule can have multiple exceptions.'
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
      <PageTable<RuleListItemType>
        id="awx-schedule-rules-table"
        rowActions={rowActions}
        errorStateTitle={isExceptions ? t('Error loading exceptions') : t('Error loading rules')}
        emptyStateTitle={isExceptions ? t('No exceptions yet') : t('No rules yet')}
        emptyStateDescription={
          isExceptions
            ? t('To get started, create an exception.')
            : t('To get started, create an rule.')
        }
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={isExceptions ? t('Create exception') : t('Create Rule')}
        emptyStateButtonClick={() => props.setIsOpen(true)}
        defaultSubtitle={isExceptions ? t('Exceptions') : t('Rules')}
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
