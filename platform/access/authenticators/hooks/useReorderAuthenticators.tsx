import { Button, Divider, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../framework';
import { ReorderItems } from '../../../../framework/components/ReorderItems';
import { requestPatch } from '../../../../frontend/common/crud/Data';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { useGet } from '../../../../frontend/common/crud/useGet';

export interface ReorderItemsProps {
  onComplete?: (items: Authenticator[]) => void;
}

/**
 * This hook is used to reorder items.
 */
export function ReorderAuthenticatorsModal(options: ReorderItemsProps) {
  const { data: authInfo } = useGet<PlatformItemsResponse<Authenticator>>(
    gatewayV1API`/authenticators/?order_by=order&page=1&page_size=1`
  );
  const { data } = useGet<PlatformItemsResponse<Authenticator>>(
    gatewayV1API`/authenticators/?order_by=order&page=1&page_size=${authInfo?.count.toString() || '10'}`
  );

  const onApplyChanges = useCallback(
    (orderedItems: Authenticator[]) => {
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
    },
    [options]
  );

  return (
    <ReorderItemsModal
      items={data?.results || []}
      onComplete={options.onComplete}
      onApplyChanges={onApplyChanges}
    />
  );
}

export function ReorderItemsModal(
  props: ReorderItemsProps & {
    items: Authenticator[];
    onApplyChanges: (items: Authenticator[]) => void;
  }
) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const { onApplyChanges } = props;

  const onClose = () => setDialog(undefined);
  const [managedItems, setManagedItems] = useState<Authenticator[]>(() => props.items);
  const [items, setItems] = useState<Authenticator[]>(() => managedItems);

  useEffect(() => {
    if (props.items !== managedItems) {
      setItems(props.items);
      setManagedItems(props.items);
    }
  }, [managedItems, props.items]);

  const onApply = () => {
    onApplyChanges(items);
    setItems(props.items);
    setDialog(undefined);
  };

  return (
    <Modal
      title={t('Manage authentication order')}
      aria-label={t('Manage authentication order')}
      ouiaId={t('Manage authentication order')}
      description={
        <div style={{ marginBottom: 16 }}>
          {t(
            'The panels are ordered from top to bottom on the list. Use the draggable icon :: to re-order your authentication.'
          )}
        </div>
      }
      variant={ModalVariant.medium}
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
