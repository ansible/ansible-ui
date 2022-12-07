import { ButtonVariant } from '@patternfly/react-core';
import {
  EditIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionType,
  TablePage,
} from '../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../common/columns';
import { RouteE } from '../../../Routes';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/controller-toolbar-filters';
import { Organization } from '../../interfaces/Organization';
import { useControllerView } from '../../useControllerView';
import { AccessNav } from '../common/AccessNav';
import { useSelectUsersAddOrganizations } from '../users/hooks/useSelectUsersAddOrganizations';
import { useSelectUsersRemoveOrganizations } from '../users/hooks/useSelectUsersRemoveOrganizations';
import { useDeleteOrganizations } from './hooks/useDeleteOrganizations';

export function Organizations() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const toolbarFilters = useOrganizationsFilters();

  const tableColumns = useOrganizationsColumns();

  const view = useControllerView<Organization>({
    url: '/api/v2/organizations/',
    toolbarFilters,
    tableColumns,
  });

  const deleteOrganizations = useDeleteOrganizations(view.unselectItemsAndRefresh);

  const selectUsersAddOrganizations = useSelectUsersAddOrganizations();
  const selectUsersRemoveOrganizations = useSelectUsersRemoveOrganizations();

  const toolbarActions = useMemo<IPageAction<Organization>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create organization'),
        onClick: () => navigate(RouteE.CreateOrganization),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.bulk,
        icon: PlusCircleIcon,
        label: t('Add users to selected organizations'),
        onClick: () => selectUsersAddOrganizations(view.selectedItems),
      },
      {
        type: PageActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove users from selected organizations'),
        onClick: () => selectUsersRemoveOrganizations(view.selectedItems),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected organizations'),
        onClick: deleteOrganizations,
      },
    ],
    [
      t,
      deleteOrganizations,
      navigate,
      selectUsersAddOrganizations,
      view.selectedItems,
      selectUsersRemoveOrganizations,
    ]
  );

  const rowActions = useMemo<IPageAction<Organization>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit organization'),
        onClick: (organization) =>
          navigate(RouteE.EditOrganization.replace(':id', organization.id.toString())),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: PlusCircleIcon,
        label: t('Add users to organization'),
        onClick: (organization) => selectUsersAddOrganizations([organization]),
      },
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove users from organization'),
        onClick: (organization) => selectUsersRemoveOrganizations([organization]),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete organization'),
        onClick: (organization) => deleteOrganizations([organization]),
      },
    ],
    [t, navigate, selectUsersAddOrganizations, selectUsersRemoveOrganizations, deleteOrganizations]
  );

  return (
    <TablePage<Organization>
      title={t('Organizations')}
      titleHelpTitle={t('Organizations')}
      titleHelp={t('organizations.title.help')}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/organizations.html"
      description={t('organizations.title.description')}
      navigation={<AccessNav active="organizations" />}
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading organizations')}
      emptyStateTitle={t('No organizations yet')}
      emptyStateDescription={t('To get started, create an organization.')}
      emptyStateButtonText={t('Create organization')}
      emptyStateButtonClick={() => navigate(RouteE.CreateOrganization)}
      {...view}
      defaultSubtitle={t('Organization')}
    />
  );
}

export function useOrganizationsFilters() {
  const nameToolbarFilter = useNameToolbarFilter();
  const descriptionToolbarFilter = useDescriptionToolbarFilter();
  const createdByToolbarFilter = useCreatedByToolbarFilter();
  const modifiedByToolbarFilter = useModifiedByToolbarFilter();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      descriptionToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  );
  return toolbarFilters;
}

export function useOrganizationsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nameClick = useCallback(
    (organization: Organization) =>
      navigate(RouteE.OrganizationDetails.replace(':id', organization.id.toString())),
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Organization>[]>(
    () => [
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
      createdColumn,
      modifiedColumn,
    ],
    [nameColumn, descriptionColumn, t, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
