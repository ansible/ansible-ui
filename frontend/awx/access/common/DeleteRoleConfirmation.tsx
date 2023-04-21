import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../framework';
import { AccessRole, User } from '../../interfaces/User';

export interface DeleteRoleConfirmationProps {
  /** Title for the modal */
  title?: string;
  /** Role to be deleted */
  role: AccessRole;
  /** User initiating the deletion request */
  user: User;
  /** Callback called when the user confirms. */
  onConfirm: (role: AccessRole, user: User) => Promise<void>;

  /** Callback called when the dialog closes. */
  onClose?: () => void;
}

export function DeleteRoleConfirmation(props: DeleteRoleConfirmationProps) {
  const { title, role, user, onConfirm, onClose } = props;
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const sourceOfRole = () => (typeof role.team_id !== 'undefined' ? t(`team`) : t(`user`));
  const onCloseClicked = useCallback(() => {
    setDialog(undefined);
    onClose?.();
  }, [onClose, setDialog]);

  return (
    <Modal
      titleIconVariant="danger"
      // TODO `${sourceOfRole()}` breaks translations
      title={title ? title : t(`Remove ${sourceOfRole()} access`)}
      variant={ModalVariant.small}
      isOpen
      onClose={onCloseClicked}
      actions={[
        <Button
          ouiaId="delete-role-modal-delete-button"
          key="delete"
          variant="danger"
          onClick={() => {
            onCloseClicked();
            void onConfirm(role, user);
          }}
          aria-label={t`Confirm delete`}
        >
          {t(`Delete`)}
        </Button>,
        <Button
          ouiaId="delete-role-modal-cancel-button"
          key="cancel"
          variant="link"
          onClick={onClose}
        >
          {t(`Cancel`)}
        </Button>,
      ]}
    >
      {sourceOfRole() === 'Team' ? (
        <>
          {t(
            `Are you sure you want to remove ${role.name.toLowerCase()} access from ${
              role.team_name
            }?  Doing so affects all members of the team.`
          )}
          <br />
          <br />
          {t(
            `If you only want to remove access for this particular user, please remove them from the team.`
          )}
        </>
      ) : (
        <>
          {t(
            `Are you sure you want to remove ${role.name.toLowerCase()} access from ${
              user.username
            }?`
          )}
        </>
      )}
    </Modal>
  );
}

/**
 * useDeleteRoleConfirmationDialog - react hook to open a DeleteRoleConfirmation dialog
 *
 * @example
 * const openDeleteRoleConfirmationDialog = useDeleteRoleConfirmationDialog()
 * openDeleteRoleConfirmationDialog(...) // Pass DeleteRoleConfirmationProps
 */
export function useDeleteRoleConfirmationDialog() {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<DeleteRoleConfirmationProps>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      setDialog(<DeleteRoleConfirmation {...props} onClose={onCloseHandler} />);
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog]);
  return setProps;
}
