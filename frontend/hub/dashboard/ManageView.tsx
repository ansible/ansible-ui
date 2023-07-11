import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../framework';
import { useCallback, useState } from 'react';
import { ReorderItems } from '../../../framework/components/ReorderItems';
import styled from 'styled-components';

const ContainerDiv = styled.div`
  margin-top: 16px;
`;

export function ManageView() {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  /** TODO: Since this is mock data for demonstration purposes, we will need to update the columns
   * collectionCategories, and defaultSelection when the API for fetching collection-categories becomes available.
   */
  type Category = { id: string; name: string };
  const columns = [
    {
      header: t('Categories of collections'),
      cell: (item: Category) => item.name,
    },
  ];
  const collectionCategories: Category[] = [
    {
      id: 'owner',
      name: t('My collections'),
    },
    {
      id: 'featured',
      name: t('Featured collections'),
    },
    {
      id: 'eda',
      name: t('Event-Driven Ansible content'),
    },
    {
      id: 'storage',
      name: t('Storage collections'),
    },
    {
      id: 'system',
      name: t('System collections'),
    },
  ];
  const defaultSelection = collectionCategories.slice(0, 2);
  const [updatedOrder, setUpdatedOrder] = useState<Category[]>(collectionCategories);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const onClose = useCallback(() => {
    setDialog(undefined);
  }, [setDialog]);

  const getItemKey = (item: Category) => {
    return item.id.toString();
  };

  const onApplyChanges = () => {
    // TODO: Update order in which panels show up in the dashboard UI using updatedOrder
    // TODO: Update order in browser's local storage
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: ManageView.tsx: updatedOrder: ', updatedOrder);
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: ManageView.tsx: selectedCategories: ', selectedCategories);
    onClose();
  };

  return (
    <Modal
      title={t('Manage View')}
      description={t(
        'Hide or show the panels you want to see on the overview page by selecting or unselecting, respectively. The panels are ordered from top to bottom on the list. Use the draggable icon :: to re-order your view.'
      )}
      variant={ModalVariant.medium}
      isOpen
      onClose={() => onClose()}
      actions={[
        <Button
          variant="primary"
          key="save"
          onClick={() => {
            onApplyChanges();
          }}
        >{t`Apply`}</Button>,
        <Button key="cancel" variant="link" onClick={() => onClose()}>{t`Cancel`}</Button>,
      ]}
      hasNoBodyWrapper
    >
      <ContainerDiv>
        <ReorderItems
          columns={columns}
          items={collectionCategories}
          keyFn={getItemKey}
          onChange={(reorderedItems, selectedItems) => {
            setUpdatedOrder(reorderedItems);
            setSelectedCategories(selectedItems);
          }}
          isCompactBorderless
          hideColumnHeaders
          isSelectableWithCheckbox
          defaultSelection={defaultSelection}
        />
      </ContainerDiv>
    </Modal>
  );
}
