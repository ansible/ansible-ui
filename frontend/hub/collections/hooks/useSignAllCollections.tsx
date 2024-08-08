import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../framework';
import { hubAPI } from '../../common/api/formatPath';
import { getRepositoryBasePath, hubAPIPost } from '../../common/api/hub-api-utils';
import { HubNamespace } from '../../namespaces/HubNamespace';
import { useWindowLocation } from '../../../../framework/components/useWindowLocation';
import {
  Modal,
  ModalVariant,
  Button,
  Grid,
  GridItem,
  Split,
  SplitItem,
  FormGroup,
  FormSelect,
  FormSelectOption,
} from '@patternfly/react-core';
import { TFunction } from 'i18next';

export interface SignAllCollectionsModalProps {
  namespace: HubNamespace;
  onComplete?: (namespace: HubNamespace) => void;
  signing_service: string;
}

export function SignAllCollectionsModal(props: Readonly<SignAllCollectionsModalProps>) {
  const { t } = useTranslation();
  const { location } = useWindowLocation();
  const [_, setDialog] = usePageDialog();
  const { namespace, onComplete, signing_service } = props;

  const repoName =
    location?.search.includes('repository') &&
    location?.search
      ?.split('&')
      ?.filter((str) => str?.includes('repository'))[0]
      ?.split('=')[1];
  const onCloseClicked = useCallback(() => {
    setDialog(undefined);
    onComplete?.(namespace);
  }, [namespace, onComplete, setDialog]);

  return (
    <Modal
      title={t('Sign all collections')}
      variant={ModalVariant.small}
      isOpen
      onClose={onCloseClicked}
      actions={[
        <Button
          key="sign-all"
          data-cy="modal-sign-button"
          variant="primary"
          onClick={() => {
            void signCollectionVersion(namespace, signing_service, repoName?.toString() ?? '', t);
            onCloseClicked();
          }}
        >
          {t`Sign all`}
        </Button>,
        <Button key="cancel" variant="link" onClick={onCloseClicked}>
          {t`Cancel`}
        </Button>,
      ]}
    >
      <Grid hasGutter>
        <GridItem span={12}>
          <p>
            <Trans>
              You are about to sign <strong>all versions</strong> under <strong>arista</strong>.
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
              <FormSelectOption value="ansible-default" label={t('ansible-default')} />
            </FormSelect>
          </FormGroup>
        </GridItem>
      </Grid>
    </Modal>
  );
}

export function useSignAllCollections() {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<SignAllCollectionsModalProps>();

  useEffect(() => {
    if (props) {
      setDialog(<SignAllCollectionsModal {...props} />);
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog]);

  return setProps;
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
