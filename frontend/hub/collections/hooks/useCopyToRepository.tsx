import { CollectionVersionSearch } from '../Collection';
import { ITableColumn, IToolbarFilter, usePageDialog, ISelected } from './../../../../framework';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function useCopyToRepository() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const [collections, setCollections] = useState<CollectionVersionSearch[]>([]);

  return (collection: CollectionVersionSearch) => {
    setDialog(
      <Modal
        title={t(`Select repositories`)}
        aria-label={t(`Select repositories`)}
        isOpen
        onClose={() => {}}
        variant={ModalVariant.large}
        tabIndex={0}
        actions={[
          <Button key="select" variant="primary" id="select" onClick={() => {}}>
            {t('Select')}
          </Button>,
          <Button key="cancel" variant="link" onClick={() => {}}></Button>,
        ]}
        hasNoBodyWrapper
      >
        <CopyToRepositoryTable
          collection={collection}
          selectedItems={(items) => {
            setCollections(items);
          }}
        />
      </Modal>
    );
  };
}

function CopyToRepositoryTable(props: {
  collection: CollectionVersionSearch;
  selectedItems: (collections: CollectionVersionSearch[]) => void;
}) {
  return <></>;
}
