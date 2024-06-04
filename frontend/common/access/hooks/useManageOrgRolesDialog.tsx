import { Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { OrgRolesList, OrgRolesListProps } from '../components/OrgRolesList';
import { Trans, useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { usePageDialog } from '../../../../framework';
import { CogIcon } from '@patternfly/react-icons';

type ViewOrgRolesProps = {
  orgListsOptions: OrgRolesListProps[];
  onManageRolesClick?: () => void;
  userOrTeamName: string;
};

export function ManageOrgRoles(props: ViewOrgRolesProps) {
  const { t } = useTranslation();
  const { orgListsOptions, onManageRolesClick, userOrTeamName } = props;
  const [_, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);
  const [orgListIsEmpty, setOrgListIsEmpty] = useState<boolean[]>(
    orgListsOptions.map((_) => false)
  );

  return (
    <Modal
      title={t('Roles for {{userOrTeamName}}', { userOrTeamName: userOrTeamName })}
      variant={ModalVariant.medium}
      isOpen
      onClose={onClose}
      actions={[
        ...(onManageRolesClick
          ? [
              <Button
                ouiaId="manage-roles-modal-manage-roles-button"
                key="manage-roles"
                variant={ButtonVariant.primary}
                icon={<CogIcon />}
                onClick={() => {
                  onManageRolesClick();
                  onClose();
                }}
                aria-label={t`Close`}
              >
                {t(`Manage roles`)}
              </Button>,
            ]
          : []),
        <Button
          ouiaId="manage-roles-modal-close-button"
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
      {orgListsOptions.map((orgListProps, index) => (
        <OrgRolesList
          key={index}
          {...orgListProps}
          isLastSection={index === orgListsOptions.length - 1}
          setOrgListIsEmpty={setOrgListIsEmpty}
          listId={index}
        />
      ))}
      {orgListIsEmpty.every((isEmpty) => isEmpty === true) &&
        (onManageRolesClick ? (
          <Trans>
            <b>{userOrTeamName}</b> has no organization roles. To add roles to{' '}
            <b>{userOrTeamName}</b> click on the button below.
          </Trans>
        ) : (
          <Trans>
            <b>{userOrTeamName}</b> has no organization roles.
          </Trans>
        ))}
    </Modal>
  );
}

export function useManageOrgRoles() {
  const [_, setDialog] = usePageDialog();
  const openManageOrgRoles = useCallback(
    (manageOrgRolesOptions: {
      orgListsOptions: OrgRolesListProps[];
      userOrTeamName: string;
      onManageRolesClick?: () => void;
    }) => {
      setDialog(
        <ManageOrgRoles
          orgListsOptions={manageOrgRolesOptions.orgListsOptions}
          onManageRolesClick={manageOrgRolesOptions.onManageRolesClick}
          userOrTeamName={manageOrgRolesOptions.userOrTeamName}
        />
      );
    },
    [setDialog]
  );
  return openManageOrgRoles;
}
