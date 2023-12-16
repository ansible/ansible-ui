import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { EdaRoute } from '../../../EdaRoutes';
import { EdaEventSource, EdaEventSourceRead } from '../../../interfaces/EdaEventSource';
import { EdaDecisionEnvironmentCell } from '../../decision-environments/components/EdaDecisionEnvironmentCell';

export function useEventSourcesColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaEventSource>[]>(
    () => [
      {
        header: t('Name'),
        cell: (eventSource) => (
          <TextCell
            text={eventSource.name}
            to={getPageUrl(EdaRoute.EventSourcePage, {
              params: { id: eventSource.id },
            })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Decision environment'),
        cell: (eventSource) => (
          <EdaDecisionEnvironmentCell id={eventSource.decision_environment_id} />
        ),
        value: (eventSource) => eventSource.decision_environment_id,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (source) => source.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (source) => source.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
    ],
    [getPageUrl, t]
  );
}

export function useEventSourceColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaEventSourceRead>[]>(
    () => [
      {
        header: t('Name'),
        cell: (eventSource) => (
          <TextCell
            text={eventSource.name}
            to={getPageUrl(
              EdaRoute.EventSourcePage,

              { params: { id: eventSource.id } }
            )}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Decision environment'),
        cell: (eventSource) => (
          <EdaDecisionEnvironmentCell id={eventSource?.decision_environment_id} />
        ),
        value: (eventSource) => eventSource?.decision_environment_id,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (source) => source.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (source) => source.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.Hidden,
      },
    ],
    [getPageUrl, t]
  );
}
