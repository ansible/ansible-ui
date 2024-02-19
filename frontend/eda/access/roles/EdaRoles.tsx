import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ITableColumn,
  IToolbarFilter,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
  ToolbarFilterType,
  useGetPageUrl,
} from '../../../../framework';
import { edaAPI } from '../../common/eda-utils';
import { EdaRole } from '../../interfaces/EdaRole';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaRoleExpandedRow } from './components/EdaRoleExpandedRow';
import { useEdaView } from '../../common/useEventDrivenView';
import { PageSelectOption } from '../../../../framework/PageInputs/PageSelectOption';

export function EdaRoles() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        description={t(
          'A role represents a set of actions that a team or user may perform on a resource or set of resources.'
        )}
      />
      <EdaRolesTable />
    </PageLayout>
  );
}

export function EdaRolesTable() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const columns = useMemo<ITableColumn<EdaRole>[]>(
    () => [
      {
        header: t('Name'),
        cell: (role) => (
          <TextCell
            text={role.name}
            to={getPageUrl(EdaRoute.RolePage, { params: { id: role.id } })}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        id: 'description',
        type: 'description',
        header: t('Description'),
        value: (role) => role.description,
      },
    ],
    [t, getPageUrl]
  );

  const view = useEdaView<EdaRole>({
    url: edaAPI`/roles/`,
    tableColumns: columns,
  });

  const toolbarFilters = useMemo(() => {
    const roles = view.pageItems || [];
    const filters: IToolbarFilter[] = [
      {
        type: ToolbarFilterType.MultiSelect,
        label: t('Role'),
        key: 'name',
        query: 'name',
        options: roles.reduce<PageSelectOption<string>[]>((options, role) => {
          if (!options.find((option) => option.label === role.name)) {
            options.push({ label: role.name, value: role.name });
          }
          return options;
        }, []),
        placeholder: t('Filter by role'),
        isPinned: true,
      },
    ];
    return filters;
  }, [view, t]);

  return (
    <PageTable
      id="eda-roles-table"
      tableColumns={columns}
      toolbarFilters={toolbarFilters}
      expandedRow={(role) => <EdaRoleExpandedRow role={role} />}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={t('There are currently no roles added for your organization.')}
      {...view}
      defaultSubtitle={t('Role')}
      disablePagination
    />
  );
}
