import { PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { ClipboardCopy, Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export function OAuthApplicationSecretModal(props: {
  onClose: () => void;
  applicationModalSource: Application;
}) {
  const { applicationModalSource } = props;
  const { t } = useTranslation();
  return (
    <Modal
      variant={ModalVariant.medium}
      position="top"
      onClose={() => props.onClose()}
      aria-label={t`Application information`}
    >
      <ModalHeader title={t`Application information`} />
      <ModalBody>
        <PageDetails
          alertPrompts={[t`This is the only time the client secret will be shown.`]}
          numberOfColumns="single"
        >
          <PageDetail label={t`Name`}>{applicationModalSource.name}</PageDetail>
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
