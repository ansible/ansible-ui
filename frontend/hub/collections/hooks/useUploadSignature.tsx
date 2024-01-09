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
import { HubPageForm } from '../../HubPageForm';
import { PageFormFileUpload } from '../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { postHubRequest } from '../../api/request';

export function useUploadSignature() {
  const [_, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);
  const context = useHubContext();

  return (collection: CollectionVersionSearch) => {
    setDialog(
      <UploadSignatureDialog collection={collection} onClose={onClose} context={context} />
    );
  };
}

function UploadSignatureDialog(props: {
  collection: CollectionVersionSearch;
  onClose: () => void;
  context: HubContext;
}) {
    const { t } = useTranslation();
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
      ]}
      hasNoBodyWrapper
    >
      {<HubPageForm<UploadData>
          submitText={t('Upload')}
          cancelText={t('Cancel')}
          onCancel={ () => props.onClose()}
          onSubmit={(data) => {
            debugger;
                // TODO
                (async () => {
                    await postHubRequest(pulpAPI`/content/ansible/collection_signatures/`, {
                        file : data.file, 
                    });
                })();
          }}
          singleColumn={true}
        >
          {<PageFormFileUpload label={t('Collection file')} name="file" isRequired />}
        </HubPageForm>}
    </Modal>
  );
}

interface UploadData {
    file: unknown;
  }
