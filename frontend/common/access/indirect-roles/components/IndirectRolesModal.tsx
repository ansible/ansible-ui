import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import { PageTable, ITableColumn } from '@ansible/ansible-ui-framework';
import { IPlatformView } from '@ansible/platform-ui/hooks/usePlatformView';
import { IInMemoryView } from '@ansible/ansible-ui-framework/useInMemoryView';

interface IndirectRolesModalProps<T extends { id: string | number }> {
  isOpen: boolean;
  onClose: () => void;
  view: IPlatformView<T> | IInMemoryView<T>;
  tableColumns: ITableColumn<T>[];
  username?: string;
  modalTitle?: string | ReactNode;
  modalDescription?: string | ReactNode;
}

export function IndirectRolesModal<T extends { id: string | number }>({
  isOpen,
  modalDescription,
  modalTitle,
  onClose,
  tableColumns,
  username,
  view,
}: IndirectRolesModalProps<T>) {
  const { t } = useTranslation();

  const defaultModalTitle = t('Indirectly assigned roles for {{username}}', {
    username: username ?? 'user',
  });
  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="indirect-roles-modal-title"
    >
      <ModalHeader title={modalTitle || defaultModalTitle} labelId="indirect-roles-modal-title" />
      <ModalBody>
        <Content component={ContentVariants.p}>{modalDescription}</Content>
        <PageTable<T>
          {...view}
          tableColumns={tableColumns ?? []}
          errorStateTitle={t('Error loading indirectly assigned roles')}
          emptyStateTitle={t('No indirectly assigned roles found.')}
          emptyStateDescription={t('This user has no roles inherited through team assignments.')}
          disableCardView
          disableListView
          compact
          disableLastRowBorder
          borderless
          autoHidePagination
        />
      </ModalBody>
      <ModalFooter>
        <Button variant={ButtonVariant.primary} onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
