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
import { getDocsBaseUrl } from '../../../common/util/getDocsBaseUrl';
import { useRuleRowActions } from '../hooks/useRuleRowActions';
import { RuleListItemType } from '../types';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { Label, LabelGroup } from '@patternfly/react-core';
import { formatDateString } from '../../../../../framework/utils/dateTimeHelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { postRequest } from '../../../../common/crud/Data';

export function RulesList(props: {
  setIsOpen?: (isOpen: boolean | number) => void;
  ruleType: string;
  rules: RuleListItemType[];
  needsHeader?: boolean;
}) {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const [occurrences, setOccurrences] = useState<
    { utc: string[]; local: string[]; id: number }[] | []
  >([]);

  useEffect(() => {
    async function fetchRules() {
      const promises = await Promise.all(
        props.rules.map(async ({ rule, id }) => {
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
          };
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
        header: props.ruleType === 'rules' ? t('Rules') : t('Exclusions'),
        cell: (item: RuleListItemType) => {
          let labels;
          occurrences.map(({ id, local }) => {
            if (id === item.id) {
              labels = (
                <LabelGroup numLabels={5}>
                  {local.map((dateTimeString) => (
                    <Label key={dateTimeString}>
                      {formatDateString(dateTimeString, item.rule.options.tzid as string)}
                    </Label>
                  ))}
                </LabelGroup>
              );
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
        'Schedule rules are a component of an overall schedule.  A schedule rule is used to determine when a schedule will run.  A schedule can have multiple rules.'
      )
    : t(
        'Schedule exceptions are a component of an overall schedule.  A schedule exception is used to exclude dates from the schedule.  A schedule can have multiple exceptions.'
      );
  return (
    <div>
      {props.needsHeader ? (
        <PageHeader
          title={isExceptions ? t('Schedule Exceptions') : t('Schedule Rules')}
          titleHelpTitle={isExceptions ? t('Schedule Exceptions') : t('Schedule Rules')}
          titleHelp={t('Create as many schedule rules as you need.')}
          titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/scheduling.html`}
          description={description}
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
