import { useTranslation } from 'react-i18next';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { usePageDialog } from '../../../../../framework';
import {
  Button,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
  Radio,
} from '@patternfly/react-core';
import { useState } from 'react';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useDeleteRequest } from '../../../../common/crud/useDeleteRequest';

function DeleteGroupsDialog(props: {
  groups: InventoryGroup[];
  onClose: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [deleteType, setDeleteType] = useState('');
  const postRequest = usePostRequest();
  const deleteRequest = useDeleteRequest();

  const handleDelete = async () => {
    for (const group of props.groups) {
      if (deleteType === 'delete') {
        await deleteRequest(awxAPI`/groups/${group.id.toString()}/`);
        props.onDelete();
        props.onClose();
      } else {
        await postRequest(awxAPI`/inventories/${group.inventory.toString()}/groups/`, {
          id: group.id,
          disassociate: true,
        });
        props.onDelete();
        props.onClose();
      }
    }
  };

  return (
    <Modal
      titleIconVariant="danger"
      title={t('Delete group')}
      variant={ModalVariant.small}
      description={t(`Are you sure you want to delete the groups below?`)}
      isOpen
      onClose={props.onClose}
      data-cy="delete-groups-dialog"
      actions={[
        <Button
          data-cy="delete-group-modal-delete-button"
          ouiaId="delete-group-modal-delete-button"
          key="delete"
          variant="danger"
          onClick={() => void handleDelete()}
          isDisabled={deleteType === ''}
          aria-label={t`Confirm delete`}
        >
          {t(`Delete`)}
        </Button>,
        <Button
          ouiaId="delete-group-modal-cancel-button"
          key="cancel"
          variant="link"
          onClick={props.onClose}
        >
          {t(`Cancel`)}
        </Button>,
      ]}
    >
      <>
        <HelperText className="pf-v5-u-pb-lg" data-cy="delete-groups-dialog-names">
          {props.groups.map((group) => (
            <HelperTextItem variant="error" key={group.name}>
              {group.name}
            </HelperTextItem>
          ))}
        </HelperText>
        <Radio
          data-cy="delete-groups-dialog-radio-delete"
          isChecked={deleteType === 'delete'}
          name="radio-delete-group"
          onChange={() => {
            setDeleteType('delete');
          }}
          label={t('Delete all groups and hosts')}
          id="radio-delete-group"
        />
        <Radio
          data-cy="delete-groups-dialog-radio-promote"
          isChecked={deleteType === 'promote'}
          name="radio-promote-group"
          onChange={() => {
            setDeleteType('promote');
          }}
          label={t('Promote child groups and hosts')}
          id="radio-promote-group"
        />
      </>
    </Modal>
  );
}

export function useDeleteGroups(onDelete: () => void) {
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const deleteGroups = (groups: InventoryGroup[]) => {
    setDialog(<DeleteGroupsDialog groups={groups} onClose={onClose} onDelete={onDelete} />);
  };
  return deleteGroups;
}
