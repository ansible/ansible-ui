import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  CopyCell,
  ITableColumn,
  PageHeader,
  PageTable,
} from '../../../../../framework';
import { useAwxConfig } from '../../../common/useAwxConfig';
import { useGetDocsUrl } from '../../../common/util/useGetDocsUrl';
import { useRuleRowActions } from '../hooks/useRuleRowActions';
import { RuleListItemType } from '../types';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Label } from '@patternfly/react-core';
import { formatDateString } from '../../../../../framework/utils/dateTimeHelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { postRequest } from '../../../../common/crud/Data';
import { LabelGroupWrapper } from '../../../../common/label-group-wrapper';

export function RulesList(props: {
  setIsOpen?: (isOpen: boolean | number) => void;
  ruleType: string;
  rules: RuleListItemType[];
  needsHeader?: boolean;
}) {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const [occurrences, setOccurrences] = useState<
    { utc: string[]; local: string[]; id: number; error: string }[] | []
  >([]);

  useEffect(() => {
    async function fetchRules() {
      const promises = await Promise.all(
        props.rules.map(async ({ rule, id }) => {
          try {
            const { utc, local } = await postRequest<{ utc: string[]; local: string[] }>(
              awxAPI`/schedules/preview/`,
              {
                rrule: rule.toString(),
              }
            );

            return {
              utc,
              local,
              id,
              error: '',
            };
          } catch (ex) {
            return { utc: [], local: [], id: -1, error: 'Error' + ex?.toString() };
          }
        })
      );

      setOccurrences(promises);
    }
    void fetchRules();
  }, [props.rules]);
  const isExceptions = props.ruleType === 'exception';

  const rowActions = useRuleRowActions(props.rules, props.setIsOpen);
  const columns = useMemo<ITableColumn<RuleListItemType>[]>(
    () => [
      {
        header: props.ruleType === 'rules' ? t('Rules') : t('Exceptions'),
        cell: (item: RuleListItemType) => {
          let labels: JSX.Element | undefined = undefined;
          occurrences.map(({ id, local, error }) => {
            if (id === item.id && !error) {
              labels = (
                <LabelGroupWrapper numLabels={5}>
                  {local.map((dateTimeString) => (
                    <Label key={dateTimeString}>
                      {formatDateString(dateTimeString, item.rule.options.tzid as string)}
                    </Label>
                  ))}
                </LabelGroupWrapper>
              );
            }

            if (!labels) {
              labels = <div>{t(`Error loading preview`)}</div>;
            }
          });

          return labels;
        },
      },
      {
        header: t('Rrule'),
        cell: (rule: RuleListItemType) => <CopyCell text={rule.rule.toString()} />,
        modal: ColumnModalOption.hidden,
        dashboard: ColumnModalOption.hidden,
      },
    ],
    [t, occurrences, props.ruleType]
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
          title={isExceptions ? t('Schedule Exceptions') : t('Schedule Rules')}
          titleHelpTitle={isExceptions ? t('Schedule Exceptions') : t('Schedule Rules')}
          titleHelp={t('Create as many schedule rules as you need.')}
          titleDocLink={docUrl}
          description={description}
          headerActions={
            <>
              {t('iCalendar RFC ')}
              <a
                key="refDocLink"
                target="_blank"
                href="https://datatracker.ietf.org/doc/html/rfc5545"
                rel="noreferrer"
              >
                {t('documentation')}
              </a>
            </>
          }
        />
      ) : null}
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
        emptyStateButtonClick={() => (props.setIsOpen ? props.setIsOpen(true) : null)}
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
