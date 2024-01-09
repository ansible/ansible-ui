import { CollectionVersionSearch } from '../Collection';
import { usePageDialog } from './../../../../framework';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import {
  useRepositoryColumns,
  useRepositoryFilters,
} from './../../repositories/hooks/useRepositorySelector';
import { PageTable } from './../../../../framework/PageTable/PageTable';
import { useHubView } from '../../useHubView';
import { AnsibleAnsibleRepositoryResponse } from './../../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { hubAPIPost } from '../../api/utils';
import { useGetRequest } from './../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { PulpItemsResponse } from '../../useHubView';
import { parsePulpIDFromURL } from '../../api/utils';
import { useHubContext, HubContext } from './../../useHubContext';
import { SigningServiceResponse } from '../../api-schemas/generated/SigningServiceResponse';
import { HubError } from '../../common/HubError';
import { hubAPI, pulpAPI } from '../../api/formatPath';

export function useUploadSignature() {
  const [_, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);
  const context = useHubContext();
  const { t } = useTranslation();

  return (collection: CollectionVersionSearch, operation: 'approve' | 'copy') => {
    setDialog(
      <UploadSignatureDialog
        collection={collection}
        onClose={onClose}
        context={context}
      />
    );
  };
}

function UploadSignatureDialog(props: {
  collection: CollectionVersionSearch;
  onClose: () => void;
  context: HubContext;
}) {
  return (
    <Modal
      title={t(`Select repositories`)}
      aria-label={t(`Select repositories`)}
      isOpen
      onClose={() => {
        props.onClose();
      }}
      variant={ModalVariant.large}
      tabIndex={0}
      actions={[
        <Button
          key="select"
          variant="primary"
          id="select"
          onClick={() => {
            // todo
          }}
        >
          {t('Upload')}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            props.onClose();
          }}
        >
          {t('Cancel')}
        </Button>,
      ]}
      hasNoBodyWrapper>
        Content
    </Modal>
  );
}
