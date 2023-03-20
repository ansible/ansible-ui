import { ButtonVariant } from '@patternfly/react-core';
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
} from '../../../../framework';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../common/columns';
import { ItemDescriptionExpandedRow } from '../../../common/ItemDescriptionExpandedRow';
import { RouteObj } from '../../../Routes';
import {
  useCreatedByToolbarFilter,
  useDescriptionToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
} from '../../common/awx-toolbar-filters';
import { Credential } from '../../interfaces/Credential';
import { useAwxView } from '../../useAwxView';
import { useDeleteCredentials } from './useDeleteCredentials';

export function Credentials() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const navigate = useNavigate();
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns();
  const view = useAwxView<Credential>({
    url: '/api/v2/credentials/',
    toolbarFilters,
    tableColumns,
  });
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh);

  const toolbarActions = useMemo<IPageAction<Credential>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create credential'),
        onClick: () => navigate(RouteObj.CreateCredential),
      },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected credentials'),
        onClick: deleteCredentials,
        isDanger: true,
      },
    ],
    [navigate, deleteCredentials, t]
  );

  const rowActions = useMemo<IPageAction<Credential>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit credential'),
        onClick: (credential) =>
          navigate(RouteObj.EditCredential.replace(':id', credential.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete credential'),
        onClick: (credential) => deleteCredentials([credential]),
        isDanger: true,
      },
    ],
    [navigate, deleteCredentials, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Credentials')}
        titleHelpTitle={t('Credentials')}
        titleHelp={t(
          `Credentials are utilized by ${product} for authentication when launching Jobs against machines, synchronizing with inventory sources, and importing project content from a version control system. You can grant users and teams the ability to use these credentials, without actually exposing the credential to the user. If you have a user move to a different team or leave the organization, you don’t have to re-key all of your systems just because that credential was available in ${product}.`
        )}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/credentials.html"
        description={t(
          `Credentials are utilized by ${product} for authentication when launching Jobs against machines, synchronizing with inventory sources, and importing project content from a version control system.`
        )}
      />
      <PageTable<Credential>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading credentials')}
        emptyStateTitle={t('No credentials yet')}
        emptyStateDescription={t('To get started, create an credential.')}
        emptyStateButtonText={t('Create credential')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateCredential)}
        expandedRow={ItemDescriptionExpandedRow<Credential>}
        {...view}
      />
    </PageLayout>
  );
}

export function useCredentialsFilters() {
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

export function useCredentialsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nameClick = useCallback(
    (credential: Credential) =>
      navigate(RouteObj.CredentialDetails.replace(':id', credential.id.toString())),
    [navigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });

  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Credential>[]>(
    () => [
      nameColumn,
      {
        header: t('Credential type'),
        cell: (credential) => {
          switch (credential.credential_type) {
            case 1:
              return t('Machine');
            case 18:
              return t('Ansible Galaxy/Automation Hub API Token');
          }
          return t('Unknown');
        },
      },
      createdColumn,
      modifiedColumn,
    ],
    [nameColumn, t, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
