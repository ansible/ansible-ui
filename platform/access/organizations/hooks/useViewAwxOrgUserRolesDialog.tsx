import { ITableColumn, PageTable, TextCell, usePageDialog } from '@ansible/ansible-ui-framework';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformView } from '../../../hooks/usePlatformView';

export function ViewAwxOrgUserRoles(props: { item: UserAssignment }) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);
  const {
    object_id,
    summary_fields: { user },
  } = props.item;

  const tableColumns: ITableColumn<UserAssignment>[] = useMemo(
    () => [
      {
        header: t('Name'),
        cell: (item) => <TextCell text={item.summary_fields.role_definition.name} />,
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      {
        header: t('Description'),
        cell: (item) => <TextCell text={item.summary_fields.role_definition.description} />,
        card: 'description',
        list: 'description',
      },
    ],
    [t]
  );

  const view = usePlatformView<UserAssignment>({
    url: awxAPI`/role_user_assignments/`,
    queryParams: {
      user_id: user.id.toString(),
      object_id,
      content_type__model: 'organization',
    },
    tableColumns,
  });

  return (
    <Modal
      title={t(`Automation Execution roles for ${user.username}`)}
      variant={ModalVariant.medium}
      isOpen
      onClose={onClose}
      actions={[
        <Button
          ouiaId="awx-org-user-roles-modal-close-button"
          key="close"
          variant={ButtonVariant.secondary}
          onClick={() => {
            onClose();
          }}
          aria-label={t`Close`}
        >
          {t(`Close`)}
        </Button>,
      ]}
    >
      <PageTable<UserAssignment>
        {...view}
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading roles.')}
        emptyStateTitle={t('There are currently no roles assigned.')}
        disablePagination
        disableLastRowBorder
        compact
        borderless
      />
    </Modal>
  );
}

export function useViewAwxOrgUserRoles() {
  const [_, setDialog] = usePageDialog();
  const viewAwxOrgMembers = useCallback(
    (user: UserAssignment) => {
      setDialog(<ViewAwxOrgUserRoles item={user} />);
    },
    [setDialog]
  );
  return viewAwxOrgMembers;
}
