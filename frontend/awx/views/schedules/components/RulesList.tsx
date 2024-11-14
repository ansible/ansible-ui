import {
  ColumnModalOption,
  CopyCell,
  ITableColumn,
  PageHeader,
  PageTable,
} from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAwxConfig } from '../../../common/useAwxConfig';
import { useGetDocsUrl } from '../../../common/util/useGetDocsUrl';
import { useRuleRowActions } from '../hooks/useRuleRowActions';
import { TimezoneToggle } from '../SchedulePage/TimezoneToggle';
import { RuleListItemType } from '../types';
import { ScheduleSummary } from './ScheduleSummary';
import { ExternalLink } from '../../../../hub/common/ExternalLink';

export function RulesList(props: {
  setIsOpen?: (isOpen: boolean | number) => void;
  ruleType: string;
  rules: RuleListItemType[];
  timezone: string;
  needsHeader?: boolean;
  isLocalForDetails?: boolean;
}) {
  const [isLocal, setIsLocal] = useState(true);

  const { t } = useTranslation();
  const config = useAwxConfig();
  const isExceptions = props.ruleType === 'exception';
  const rowActions = useRuleRowActions(props.rules, props.setIsOpen);
  const columns = useMemo<ITableColumn<RuleListItemType>[]>(
    () => [
      {
        header:
          props.ruleType === 'rules'
            ? t('Next occurrence timestamps')
            : t('Next exclusion timestamps'),
        cell: (item: RuleListItemType) => {
          return (
            <ScheduleSummary
              rrule={item.rule}
              isLocal={props.isLocalForDetails !== undefined ? props.isLocalForDetails : isLocal}
              hideColumnTitle
            />
          );
        },
      },
      {
        header: props.ruleType === 'rules' ? t('RRule') : t('Exrule'),
        cell: (rule: RuleListItemType) => <CopyCell text={rule.rule} />,
        modal: ColumnModalOption.hidden,
        dashboard: ColumnModalOption.hidden,
      },
    ],
    [t, props.ruleType, isLocal, props.isLocalForDetails]
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
        'Schedule exceptions are a component of an overall schedule.  A schedule exception is used to exclude dates from the schedule.  A schedule can have multiple exceptions.'
      )
    : t(
        'Schedule rules are a component of an overall schedule.  A schedule rule is used to determine when a schedule will run.  A schedule can have multiple rules.'
      );
  const docUrl = useGetDocsUrl(config, 'schedules');
  return (
    <div>
      {props.needsHeader ? (
        <PageHeader
          controls={
            <TimezoneToggle
              isLocal={isLocal}
              setIsLocal={(b) => setIsLocal(b)}
              localTimezone={props.timezone}
            />
          }
          title={isExceptions ? t('Schedule Exceptions') : t('Schedule Rules')}
          titleHelpTitle={isExceptions ? t('Schedule Exceptions') : t('Schedule Rules')}
          titleHelp={t('Create as many schedule rules as you need.')}
          titleDocLink={docUrl}
          description={description}
          headerActions={
            <>
              {t('iCalendar RFC ')}
              <ExternalLink key="refDocLink" href="https://datatracker.ietf.org/doc/html/rfc5545">
                {t('documentation')}
              </ExternalLink>
            </>
          }
        />
      ) : null}
      <PageTable<RuleListItemType>
        id="awx-schedule-rules-table"
        rowActions={rowActions}
        errorStateTitle={isExceptions ? t('Error loading exceptions') : t('Error loading rules')}
        emptyState={
          <PageTableEmptyState
            title={isExceptions ? t('No exceptions yet') : t('No rules yet')}
            description={
              isExceptions
                ? t('To get started, create an exception.')
                : t('To get started, create an rule.')
            }
          >
            <Button
              variant="primary"
              icon={<PlusCircleIcon />}
              onClick={() => (props.setIsOpen ? props.setIsOpen(true) : null)}
            >
              {isExceptions ? t('Create exception') : t('Create Rule')}
            </Button>
          </PageTableEmptyState>
        }
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
