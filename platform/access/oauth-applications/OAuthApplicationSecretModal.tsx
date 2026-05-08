import { PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { ClipboardCopy, Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export function OAuthApplicationSecretModal(
  props: Readonly<{
    onClose: () => void;
    applicationModalSource: Application;
  }>
) {
  const { applicationModalSource } = props;
  const { t } = useTranslation();
  return (
    <Modal
      isOpen
      variant={ModalVariant.medium}
      onClose={() => props.onClose()}
      aria-label={t`OAuth Application Secrets`}
    >
      <ModalHeader title={t`OAuth Application Secrets`} />
      <ModalBody>
        <PageDetails
          alertPrompts={[t`This is the only time the client secret will be shown.`]}
          numberOfColumns="single"
        >
          <PageDetail label={t`OAuth Application Name`}>{applicationModalSource.name}</PageDetail>
          <PageDetail label={t`Client ID`}>
            <ClipboardCopy isReadOnly>
              {String(applicationModalSource.client_id ?? '')}
            </ClipboardCopy>
          </PageDetail>
          <PageDetail
            label={t`Client Secret`}
            isEmpty={applicationModalSource.client_type === 'public'}
          >
            <ClipboardCopy isReadOnly>
              {String(applicationModalSource.client_secret ?? '')}
            </ClipboardCopy>
          </PageDetail>
        </PageDetails>
      </ModalBody>
    </Modal>
  );
}
