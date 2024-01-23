import { CollectionVersionSearch } from '../Collection';
import { LoadingPage, usePageDialog } from './../../../../framework';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { useHubContext, HubContext } from '../../common/useHubContext';
import { HubError } from '../../common/HubError';
import { pulpAPI } from '../../common/api/formatPath';
import { HubPageForm } from '../..//common/HubPageForm';
import { PageFormFileUpload } from '../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { getCookie } from '../../../common/crud/cookie';
import { TaskResponse } from '../../administration/tasks/Task';
import { parseTaskResponse } from '../../common/api/hub-api-utils';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

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
      actions={[]}
      hasNoBodyWrapper
    >
      {
        <HubPageForm<UploadData>
          submitText={t('Upload')}
          cancelText={t('Cancel')}
          onCancel={() => props.onClose()}
          onSubmit={(data) => {
            return (async () => {
              setIsLoading(true);
              try {
                const body = new FormData();
                body.append('file', data.file as Blob);
                body.append('repository', props.collection.repository?.pulp_href || '');
                body.append(
                  'signed_collection',
                  props.collection.collection_version?.pulp_href || ''
                );

                const response = await fetch(pulpAPI`/content/ansible/collection_signatures/`, {
                  method: 'POST',
                  body,
                  credentials: 'include',
                  headers: {
                    'X-CSRFToken': getCookie('csrftoken') ?? '',
                  },
                });

                if (response.status === 202) {
                  await parseTaskResponse((await response.json()) as TaskResponse);
                }

                props.onClose();
                setIsLoading(false);
              } catch (err) {
                setIsLoading(false);
                setError(err as string);
              }
            })();
          }}
          singleColumn={true}
        >
          {<PageFormFileUpload label={t('Collection file')} name="file" isRequired />}
          {isLoading && <LoadingPage />}
          {error ? (
            <HubError
              error={{
                name: '',
                message: t('Signature can not be uploaded.') + ' ' + error,
              }}
            />
          ) : (
            <></>
          )}
        </HubPageForm>
      }
    </Modal>
  );
}

interface UploadData {
  file: unknown;
}
