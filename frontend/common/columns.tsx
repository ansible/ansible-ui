import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ColumnModalOption,
  ColumnTableOption,
  DateTimeCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../framework';
import { RouteObj } from './Routes';

export function useIdColumn<T extends { name: string; id: number }>() {
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Id'),
      cell: (team) => team.id,
      minWidth: 0,
      table: ColumnTableOption.Hidden,
      card: 'hidden',
      list: 'hidden',
      modal: ColumnModalOption.Hidden,
    }),
    [t]
  );
  return column;
}

export function useNameColumn<
  T extends { name?: string; hostname?: string; id: number },
>(options?: {
  header?: string;
  url?: string;
  onClick?: (item: T) => void;
  sort?: string;
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { url, onClick, disableSort, disableLinks } = options ?? {};
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: options?.header ?? t('Name'),
      cell: (item: T) => (
        <TextCell
          text={item.name || item.hostname}
          iconSize="sm"
          to={disableLinks ? undefined : url?.replace(':id', item.id.toString())}
          onClick={!disableLinks && onClick ? () => onClick?.(item) : undefined}
        />
      ),
      sort: disableSort ? undefined : options?.sort ?? 'name',
      card: 'name',
      list: 'name',
      defaultSort: true,
    }),
    [disableLinks, disableSort, options?.sort, onClick, options?.header, t, url]
  );
  return column;
}

export function useDescriptionColumn<T extends { description?: string | null | undefined }>() {
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Description'),
      type: 'description',
      value: (item) => item.description,
      table: ColumnTableOption.Description,
      list: 'description',
      card: 'description',
      modal: ColumnModalOption.Hidden,
    }),
    [t]
  );
  return column;
}

export function useCreatedColumn(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  sortKey?: string;
  hideByDefaultInTableView?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const column: ITableColumn<
    | { created?: string; created_on?: string; date_joined?: string; pulp_created?: string }
    | {
        created?: string;
        created_on?: string;
        date_joined?: string;
        pulp_created?: string;
        summary_fields?: { created_by?: { id?: number; username?: string } };
      }
  > = useMemo(
    () => ({
      header: t('Created'),
      cell: (item) => {
        if (!item.created && !item.created_on && !item.date_joined && !item.pulp_created)
          return <></>;
        return (
          <DateTimeCell
            format="since"
            value={
              item.created
                ? item.created
                : item.created_on
                ? item.created_on
                : item.date_joined
                ? item.date_joined
                : item.pulp_created
            }
            author={
              'summary_fields' in item ? item.summary_fields?.created_by?.username : undefined
            }
            onClick={
              options?.disableLinks || !('summary_fields' in item)
                ? undefined
                : () =>
                    navigate(
                      RouteObj.UserDetails.replace(
                        ':id',
                        (item.summary_fields?.created_by?.id ?? 0).toString()
                      )
                    )
            }
          />
        );
      },
      sort: options?.disableSort ? undefined : options?.sortKey ?? 'created',
      defaultSortDirection: 'desc',
      table: options?.hideByDefaultInTableView
        ? ColumnTableOption.Hidden
        : ColumnTableOption.Expanded,
      card: 'hidden',
      list: 'secondary',
      modal: ColumnModalOption.Hidden,
    }),
    [
      navigate,
      options?.disableLinks,
      options?.disableSort,
      options?.hideByDefaultInTableView,
      options?.sortKey,
      t,
    ]
  );
  return column;
}

export function useModifiedColumn(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  sortKey?: string;
  hideByDefaultInTableView?: boolean;
}) {
  const { t } = useTranslation();
  const history = useNavigate();
  const column: ITableColumn<
    | { modified?: string; modified_on?: string }
    | {
        modified?: string;
        modified_on?: string;
        summary_fields?: { modified_by?: { id?: number; username?: string } };
      }
  > = useMemo(
    () => ({
      header: t('Modified'),
      cell: (item) => {
        if (!item.modified && !item.modified_on) return <></>;
        return (
          <DateTimeCell
            format="since"
            value={item.modified ? item.modified : item.modified_on}
            author={
              'summary_fields' in item ? item.summary_fields?.modified_by?.username : undefined
            }
            onClick={
              options?.disableLinks || !('summary_fields' in item)
                ? undefined
                : () =>
                    history(
                      RouteObj.UserDetails.replace(
                        ':id',
                        (item.summary_fields?.modified_by?.id ?? 0).toString()
                      )
                    )
            }
          />
        );
      },
      sort: options?.disableSort ? undefined : options?.sortKey ?? 'modified',
      defaultSortDirection: 'desc',
      table: options?.hideByDefaultInTableView
        ? ColumnTableOption.Hidden
        : ColumnTableOption.Expanded,
      card: 'hidden',
      list: 'secondary',
      modal: ColumnModalOption.Hidden,
    }),
    [
      history,
      options?.disableLinks,
      options?.disableSort,
      options?.hideByDefaultInTableView,
      options?.sortKey,
      t,
    ]
  );
  return column;
}

export function useOrganizationNameColumn(
  orgDetailsRoute: string,
  options?: {
    disableLinks?: boolean;
    disableSort?: boolean;
  }
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column: ITableColumn<{
    summary_fields?: {
      organization?: {
        id: number;
        name: string;
      };
    };
  }> = useMemo(
    () => ({
      header: t('Organization'),
      cell: (item) => (
        <TextCell
          text={item.summary_fields?.organization?.name}
          to={getPageUrl(orgDetailsRoute, {
            params: { id: item.summary_fields?.organization?.id },
          })}
          disableLinks={options?.disableLinks}
        />
      ),
      value: (item) => item.summary_fields?.organization?.name,
      sort: options?.disableSort ? undefined : 'organization',
    }),
    [getPageUrl, options?.disableLinks, options?.disableSort, orgDetailsRoute, t]
  );
  return column;
}
export function useTypeColumn<T extends object>(options: {
  header?: string;
  url?: string;
  disableSort?: boolean;
  disableLinks?: boolean;
  sort?: string;
  makeReadable: (item: T) => string;
}) {
  const { makeReadable } = options ?? {};
  const { t } = useTranslation();
  const column: ITableColumn<T> = useMemo(
    () => ({
      header: t('Type'),
      value: (item) => makeReadable(item),
      type: 'text',
      card: 'subtitle',
      list: 'subtitle',
      sort: options?.disableSort ? undefined : options?.sort,
    }),
    [t, makeReadable, options.disableSort, options.sort]
  );
  return column;
}
