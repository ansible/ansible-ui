import { Label, LabelGroup } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  DateTimeCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
  usePageNavigate,
} from '../../framework';
import { AwxRoute } from '../awx/AwxRoutes';
import { CredentialLabel } from '../awx/common/CredentialLabel';
import { SummaryFieldCredential } from '../awx/interfaces/summary-fields/summary-fields';

export function useIdColumn<T extends { id: number }>(isHidden: boolean = true) {
  const { t } = useTranslation();
  const column = useMemo<ITableColumn<T>>(
    () => ({
      header: t('Id'),
      cell: (team) => team.id,
      minWidth: 0,
      table: isHidden ? ColumnTableOption.hidden : undefined,
      card: isHidden ? 'hidden' : undefined,
      list: isHidden ? 'hidden' : undefined,
      modal: isHidden ? ColumnModalOption.hidden : undefined,
    }),
    [isHidden, t]
  );
  return column;
}

export function useNameColumn<
  T extends
    | {
        name?: string;
        hostname?: string;
        id: number;
        summary_fields?: { user?: { username?: string } };
      }
    | {
        name?: string;
        hostname?: string;
        id: number;
      },
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
          text={
            item.name ||
            item.hostname ||
            ('summary_fields' in item ? item.summary_fields?.user?.username : undefined)
          }
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
      table: ColumnTableOption.description,
      list: 'description',
      card: 'description',
      modal: ColumnModalOption.hidden,
    }),
    [t]
  );
  return column;
}

export function useLastRanColumn(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  sortKey?: string;
  hideByDefaultInTableView?: boolean;
}) {
  const { t } = useTranslation();
  const column: ITableColumn<{ last_job_run: string | null }> = useMemo(
    () => ({
      header: t('Last Ran'),
      cell: (item) => {
        if (!item.last_job_run) return <></>;
        return <DateTimeCell format="since" value={item.last_job_run} />;
      },
      sort: options?.disableSort ? undefined : options?.sortKey ?? 'last_job_run',
      defaultSortDirection: 'desc',
    }),
    [options?.disableSort, options?.sortKey, t]
  );
  return column;
}

export function useLabelsColumn() {
  const { t } = useTranslation();
  const column: ITableColumn<{
    summary_fields?: { labels: { count: number; results: { id: number; name: string }[] } };
  }> = useMemo(
    () => ({
      header: t('Labels'),
      cell: (item) => {
        if (!item.summary_fields?.labels?.results) return <></>;
        return (
          <LabelGroup>
            {item.summary_fields.labels?.results.map((result) => (
              <Label key={result.id}>{result.name}</Label>
            ))}
          </LabelGroup>
        );
      },
      table: ColumnTableOption.expanded,
      card: 'hidden',
      list: 'hidden',
      modal: ColumnModalOption.hidden,
    }),
    [t]
  );
  return column;
}

export function useCredentialsColumn() {
  const { t } = useTranslation();
  const column: ITableColumn<{
    summary_fields?: { credentials?: SummaryFieldCredential[] };
  }> = useMemo(
    () => ({
      header: t('Credentials'),
      cell: (item) => (
        <LabelGroup>
          {item.summary_fields?.credentials?.map((credential) => (
            <CredentialLabel credential={credential} key={credential.id} />
          ))}
        </LabelGroup>
      ),
      value: (item) =>
        item.summary_fields?.credentials && item.summary_fields.credentials.length > 0,
      table: ColumnTableOption.expanded,
      card: 'hidden',
      list: 'hidden',
      modal: ColumnModalOption.hidden,
    }),
    [t]
  );
  return column;
}

export function useCreatedColumn(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  sort?: string;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const column: ITableColumn<
    | {
        created?: string;
        created_on?: string;
        date_joined?: string;
        pulp_created?: string;
      }
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
            value={item.created ?? item.created_on ?? item.date_joined ?? item.pulp_created}
            author={
              'summary_fields' in item ? item.summary_fields?.created_by?.username : undefined
            }
            onClick={
              options?.disableLinks || !('summary_fields' in item)
                ? undefined
                : () =>
                    pageNavigate(AwxRoute.UserDetails, {
                      params: { id: item.summary_fields?.created_by?.id },
                    })
            }
          />
        );
      },
      sort: options?.disableSort ? undefined : options?.sort ?? 'created',
      defaultSortDirection: 'desc',
      table: 'hidden',
      card: 'hidden',
      list: 'secondary',
      modal: 'hidden',
      dashboard: 'hidden',
    }),
    [t, options?.disableSort, options?.sort, options?.disableLinks, pageNavigate]
  );
  return column;
}

export function useModifiedColumn(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
  sort?: string;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
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
                    pageNavigate(AwxRoute.UserDetails, {
                      params: { id: item.summary_fields?.modified_by?.id },
                    })
            }
          />
        );
      },
      sort: options?.disableSort ? undefined : options?.sort ?? 'modified',
      defaultSortDirection: 'desc',
      table: 'hidden',
      card: 'hidden',
      list: 'secondary',
      modal: 'hidden',
      dashboard: 'hidden',
    }),
    [t, options?.disableSort, options?.sort, options?.disableLinks, pageNavigate]
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
      dashboard: 'hidden',
    }),
    [getPageUrl, options?.disableLinks, options?.disableSort, orgDetailsRoute, t]
  );
  return column;
}

export function useExecutionEnvColumn<
  T extends {
    type?: string;
    summary_fields?: {
      execution_environment?: {
        id: number;
        name: string;
      };
    };
  },
>(
  envDetailsRoute: string,
  options?: {
    disableLinks?: boolean;
    disableSort?: boolean;
  }
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column: ITableColumn<T> = useMemo(
    () => ({
      header: t('Execution Environment'),
      cell: (item) => {
        if (item.type !== 'job_template') {
          return <></>;
        } else {
          return (
            <TextCell
              text={item.summary_fields?.execution_environment?.name}
              to={getPageUrl(envDetailsRoute, {
                params: { id: item.summary_fields?.execution_environment?.id },
              })}
              disableLinks={options?.disableLinks}
            />
          );
        }
      },
      value: (item) => {
        if (item.type === 'job_template') {
          return item.summary_fields?.execution_environment?.name;
        } else {
          return undefined;
        }
      },
      sort: options?.disableSort ? undefined : 'execution_environment',
      table: ColumnTableOption.expanded,
      card: 'hidden',
      list: 'hidden',
      modal: ColumnModalOption.hidden,
    }),
    [t, options?.disableSort, options?.disableLinks, getPageUrl, envDetailsRoute]
  );
  return column;
}

export function useInventoryNameColumn(
  inventoryDetailsRoute: string,
  options?: {
    disableLinks?: boolean;
    disableSort?: boolean;
  }
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column: ITableColumn<{
    summary_fields?: {
      inventory?: {
        id: number;
        name: string;
      };
    };
  }> = useMemo(
    () => ({
      header: t('Inventory'),
      cell: (item) => (
        <TextCell
          text={item.summary_fields?.inventory?.name}
          to={getPageUrl(inventoryDetailsRoute, {
            params: { id: item.summary_fields?.inventory?.id },
          })}
          disableLinks={options?.disableLinks}
        />
      ),
      value: (item) => item.summary_fields?.inventory?.name,
      sort: options?.disableSort ? undefined : 'inventory',
      table: ColumnTableOption.expanded,
      card: 'hidden',
      list: 'hidden',
      modal: ColumnModalOption.hidden,
    }),
    [getPageUrl, options?.disableLinks, options?.disableSort, inventoryDetailsRoute, t]
  );
  return column;
}

export function useProjectNameColumn(
  projectDetailsRoute: string,
  options?: {
    disableLinks?: boolean;
    disableSort?: boolean;
  }
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const column: ITableColumn<{
    summary_fields?: {
      project?: {
        id: number;
        name: string;
      };
    };
  }> = useMemo(
    () => ({
      header: t('Project'),
      cell: (item) => (
        <TextCell
          text={item.summary_fields?.project?.name}
          to={getPageUrl(projectDetailsRoute, {
            params: { id: item.summary_fields?.project?.id },
          })}
          disableLinks={options?.disableLinks}
        />
      ),
      value: (item) => item.summary_fields?.project?.name,
      sort: options?.disableSort ? undefined : 'project',
      table: ColumnTableOption.expanded,
      card: 'hidden',
      list: 'hidden',
      modal: ColumnModalOption.hidden,
    }),
    [getPageUrl, options?.disableLinks, options?.disableSort, projectDetailsRoute, t]
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
export function useScopeColumn<T extends { scope?: string }>(options?: {
  header?: string;
  disableSort?: boolean;
  disableLinks?: boolean;
  sort?: string;
}) {
  const { t } = useTranslation();
  const column: ITableColumn<T> = useMemo(
    () => ({
      header: t('Scope'),
      cell: (item: T) => <TextCell text={item.scope} />,
      sort: options?.disableSort ? undefined : options?.sort ?? 'scope',
    }),
    [t, options?.disableSort, options?.sort]
  );
  return column;
}
export function useExpiresColumn<T extends { expires?: string }>(options?: {
  header?: string;
  disableSort?: boolean;
  disableLinks?: boolean;
  sort?: string;
}) {
  const { t } = useTranslation();
  const column: ITableColumn<T> = useMemo(
    () => ({
      header: t('Expires'),
      cell: (item: T) => <DateTimeCell value={item.expires} format="date-time" />,
      sort: options?.disableSort ? undefined : options?.sort ?? 'expires',
    }),
    [t, options?.disableSort, options?.sort]
  );
  return column;
}
