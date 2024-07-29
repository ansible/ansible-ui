import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, PencilAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  ITableColumn,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../common/columns';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useDynamicToolbarFilters } from '../../common/useDynamicFilters';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { Organization } from '../../interfaces/Organization';
import { AwxRoute } from '../../main/AwxRoutes';
import { useSelectUsersAddOrganizations } from '../users/hooks/useSelectUsersAddOrganizations';
import { useSelectUsersRemoveOrganizations } from '../users/hooks/useSelectUsersRemoveOrganizations';
import { useDeleteOrganizations } from './hooks/useDeleteOrganizations';

export function Organizations() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  usePersistentFilters('organizations');
  const config = useAwxConfig();

  const toolbarFilters = useOrganizationsFilters();

  const tableColumns = useOrganizationsColumns();

  const view = useAwxView<Organization>({
    url: awxAPI`/organizations/`,
    toolbarFilters,
    tableColumns,
  });

  const deleteOrganizations = useDeleteOrganizations(view.unselectItemsAndRefresh);

  const selectUsersAddOrganizations = useSelectUsersAddOrganizations();
  const selectUsersRemoveOrganizations = useSelectUsersRemoveOrganizations();

  const toolbarActions = useMemo<IPageAction<Organization>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        isPinned: true,
        variant: ButtonVariant.primary,
        icon: PlusCircleIcon,
        label: t('Create organization'),
        href: getPageUrl(AwxRoute.CreateOrganization),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: PlusCircleIcon,
        label: t('Add users to organizations'),
        onClick: () => selectUsersAddOrganizations(view.selectedItems),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: MinusCircleIcon,
        label: t('Remove users from organizations'),
        onClick: () => selectUsersRemoveOrganizations(view.selectedItems),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete organizations'),
        onClick: deleteOrganizations,
        isDanger: true,
      },
    ],
    [
      t,
      getPageUrl,
      deleteOrganizations,
      selectUsersAddOrganizations,
      view.selectedItems,
      selectUsersRemoveOrganizations,
    ]
  );

  const rowActions = useMemo<IPageAction<Organization>[]>(() => {
    const actions: IPageAction<Organization>[] = [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit organization'),
        href: (organization) => {
          return getPageUrl(AwxRoute.EditOrganization, { params: { id: organization.id } });
        },
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PlusCircleIcon,
        label: t('Add users to organizations'),
        onClick: (organization) => selectUsersAddOrganizations([organization]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t('Remove users from organizations'),
        onClick: (organization) => selectUsersRemoveOrganizations([organization]),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete organization'),
        onClick: (organization) => deleteOrganizations([organization]),
        isDanger: true,
      },
    ];
    return actions;
  }, [
    t,
    getPageUrl,
    selectUsersAddOrganizations,
    selectUsersRemoveOrganizations,
    deleteOrganizations,
  ]);

  return (
    <PageLayout>
      <PageHeader
        title={t('Organizations')}
        titleHelpTitle={t('Organizations')}
        titleHelp={t(
          `An organization is a logical collection of users, teams, projects, and inventories, and is the highest level in the {{product}} object hierarchy.`,
          { product }
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/organizations.html`}
        description={t(
          `An organization is a logical collection of users, teams, projects, and inventories, and is the highest level in the {{product}} object hierarchy.`,
          { product }
        )}
        headerActions={<ActivityStreamIcon type={'organization'} />}
      />
      <PageTable<Organization>
        id="awx-organizations-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading organizations')}
        emptyStateTitle={t('No organizations yet')}
        emptyStateDescription={t('To get started, create an organization.')}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create organization')}
        emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateOrganization)}
        {...view}
        defaultSubtitle={t('Organization')}
      />
    </PageLayout>
  );
}

export function useOrganizationsFilters() {
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useDynamicToolbarFilters({
    optionsPath: 'organizations',
    preSortedKeys: ['name', 'description', 'created-by', 'modified-by'],
    preFilledValueKeys: {
      name: {
        apiPath: 'organizations',
      },
      id: {
        apiPath: 'organizations',
      },
    },
    additionalFilters: [createdByToolbarFilter, modifiedByToolbarFilter],
  });
  return toolbarFilters;
}

export function useOrganizationsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const idColumn = useIdColumn();
  const nameClick = useCallback(
    (organization: Organization) =>
      pageNavigate(AwxRoute.OrganizationDetails, { params: { id: organization.id } }),
    [pageNavigate]
  );
  const descriptionColumn = useDescriptionColumn();
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Organization>[]>(
    () => [
      idColumn,
      nameColumn,
      descriptionColumn,
      {
        header: t('Members'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.users,
      },
      {
        header: t('Teams'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.teams,
      },
      {
        header: t('Admins'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.admins,
      },
      {
        header: t('Inventories'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.inventories,
      },
      {
        header: t('Projects'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.projects,
      },
      {
        header: t('Job templates'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.job_templates,
      },
      {
        header: t('Hosts'),
        type: 'count',
        value: (organization) => organization.summary_fields?.related_field_counts?.hosts,
      },
      {
        id: 'execution-environment',
        header: t('Default environment'),
        type: 'text',
        value: (organization) => organization.summary_fields?.default_environment?.name,
        to: (organization) =>
          getPageUrl(AwxRoute.ExecutionEnvironmentDetails, {
            params: { id: organization.summary_fields?.default_environment?.id },
          }),
      },
      createdColumn,
      modifiedColumn,
    ],
    [idColumn, nameColumn, descriptionColumn, t, createdColumn, modifiedColumn, getPageUrl]
  );
  return tableColumns;
}
