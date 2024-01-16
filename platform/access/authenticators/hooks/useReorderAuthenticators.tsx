import { Button, Divider, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../framework';
import { ReorderItems } from '../../../../framework/components/ReorderItems';
import { requestPatch } from '../../../../frontend/common/crud/Data';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { Authenticator } from '../../../interfaces/Authenticator';

export interface ReorderItemsProps {
  title: string;
  description?: string;
  /** The items to manage */
  items: Authenticator[];
  /** Variant controls the size of the modal */
  variant?: ModalVariant;
  onComplete?: (items: Authenticator[]) => void;
}

/**
 * This hook is used to reorder items.
 */
export function useReorderAuthenticators(options: ReorderItemsProps) {
  const [_, setDialog] = usePageDialog();
  const onApplyChanges = useCallback((orderedItems: Authenticator[]) => {
    void Promise.all(
      orderedItems.map(async (item, index) => {
        await requestPatch(gatewayV1API`/authenticators/`.concat(`${item.id}/`), {
          order: index + 1,
        });
      })
    )
      .then(() => {
        options?.onComplete ? options.onComplete(orderedItems) : '';
      })
      .catch();
  }, []);

  const openReorderModal = () =>
    setDialog(
      <ReorderItemsModal
        {...options}
        items={options.items}
        onComplete={options.onComplete}
        onApplyChanges={onApplyChanges}
      />
    );

  return { openReorderModal };
}

export function ReorderItemsModal(
  props: ReorderItemsProps & {
    onApplyChanges: (items: Authenticator[]) => void;
  }
) {
  const { t } = useTranslation();
  const { title, description, onApplyChanges } = props;
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const [items, setItems] = useState<Authenticator[]>(() => props.items);

  const onApply = () => {
    onApplyChanges(items);
    setDialog(undefined);
  };

  return (
    <Modal
      title={title}
      aria-label={title}
      ouiaId={title}
      description={<div style={{ marginBottom: 16 }}>{description}</div>}
      variant={props.variant ?? ModalVariant.medium}
      isOpen
      onClose={onClose}
      actions={[
        <Button key="apply" variant="primary" onClick={onApply}>{t`Apply`}</Button>,
        <Button key="cancel" variant="link" onClick={onClose}>{t`Cancel`}</Button>,
      ]}
      hasNoBodyWrapper
    >
      <Divider />
      <ModalBoxBody style={{ padding: 0 }}>
        <ReorderItems
          keyFn={(item: Authenticator) => item.name}
          items={items}
          setItems={setItems}
          columns={[{ header: t('Name'), cell: (item) => item.name }]}
          isSelected={() => false}
          selectItem={() => null}
          unselectItem={() => null}
          allSelected={false}
          selectAll={() => null}
          unselectAll={() => null}
        />
      </ModalBoxBody>
      <Divider />
    </Modal>
  );
}
