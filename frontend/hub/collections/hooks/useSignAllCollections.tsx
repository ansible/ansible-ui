import { usePageDialog } from '@ansible/ansible-ui-framework';
import { useURLSearchParams } from '@ansible/ansible-ui-framework/components/useURLSearchParams';
import {
  Button,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import { TFunction } from 'i18next';
import { useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { hubAPI } from '../../common/api/formatPath';
import { getRepositoryBasePath, hubAPIPost } from '../../common/api/hub-api-utils';
import { HubError } from '../../common/HubError';
import { HubNamespace } from '../../namespaces/HubNamespace';

export interface SignAllCollectionsModalProps {
  namespace: HubNamespace;
  onComplete?: (namespace: HubNamespace) => void;
  signing_service: string;
}

export function SignAllCollectionsModal(props: Readonly<SignAllCollectionsModalProps>) {
  const { t } = useTranslation();
  const [params] = useURLSearchParams();
  const [_, setDialog] = usePageDialog();
  const { namespace, onComplete, signing_service } = props;
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const repoName = params.get('repository');

  const onCloseClicked = useCallback(() => {
    setDialog(undefined);
    onComplete?.(namespace);
    setError('');
    setIsLoading(false);
  }, [namespace, onComplete, setDialog]);

  const signing_service_name = 'ansible-default';

  return (
    <Modal variant={ModalVariant.small} isOpen onClose={onCloseClicked}>
      <ModalHeader title={t('Sign all collections')} />
      <ModalBody>
        <Grid hasGutter>
          <GridItem span={12}>
            <p>
              <Trans>
                You are about to sign <strong>all versions</strong> under{' '}
                <strong>{namespace.name}</strong>.
              </Trans>
            </p>
          </GridItem>
          <GridItem span={12}>
            <Split hasGutter>
              <SplitItem>
                <Trans>Signed version(s)</Trans>
              </SplitItem>
              <SplitItem />
              <SplitItem>
                <Trans>Unsigned version(s)</Trans>
              </SplitItem>
            </Split>
          </GridItem>
          <GridItem span={12}>
            <FormGroup fieldId="service-selector" label={t`Signing service selector:`}>
              <FormSelect value="ansible-default" id="service-selector">
                <FormSelectOption value="ansible-default" label={signing_service_name} />
              </FormSelect>
            </FormGroup>
          </GridItem>
          {error && <HubError error={{ name: '', message: error }} />}
        </Grid>
      </ModalBody>
      <ModalFooter>
        <Button
          key="sign-all"
          data-cy="modal-sign-button"
          variant="primary"
          isLoading={isLoading}
          onClick={() => {
            void (async () => {
              try {
                setIsLoading(true);
                setError('');
                await signCollectionVersion(
                  namespace,
                  signing_service,
                  repoName?.toString() ?? '',
                  t
                );
                onCloseClicked();
              } catch (error: unknown) {
                setError(t`Error occurred in signing collection versions.`);
                setIsLoading(false);
              }
            })();
          }}
        >
          {t`Sign all`}
        </Button>
        <Button key="cancel" variant="link" onClick={onCloseClicked}>
          {t`Cancel`}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function useSignAllCollections() {
  const [_, setDialog] = usePageDialog();

  const openDialog = useCallback(
    (props: SignAllCollectionsModalProps) => {
      setDialog(<SignAllCollectionsModal {...props} />);
    },
    [setDialog]
  );

  return openDialog;
}

async function signCollectionVersion(
  namespace: HubNamespace,
  signing_service: string,
  repoName: string,
  t: TFunction<'translation', undefined>
) {
  const distro_base_path = await getRepositoryBasePath(repoName || '', '', t);
  const postData: Record<string, unknown> = {
    distro_base_path,
    namespace: namespace.name,
    signing_service,
  };
  return hubAPIPost(hubAPI`/_ui/v1/collection_signing/`, postData);
}
