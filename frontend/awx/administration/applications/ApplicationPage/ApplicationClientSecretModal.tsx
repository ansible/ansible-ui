import { Modal, ClipboardCopy, ClipboardCopyVariant } from '@patternfly/react-core';
import { t } from 'i18next';
import { SetStateAction } from 'react';
import { PageDetails, PageDetail } from '../../../../../framework';
import { Application } from '../../../interfaces/Application';

export function ApplicationClientSecretModal(props: {
  onClose: (value: SetStateAction<Application | undefined>) => void;
  applicationModalSource: Application;
}) {
  const { applicationModalSource } = props;
  return (
    <Modal
      aria-label={t`Application information`}
      isOpen
      variant="medium"
      position="top"
      title={t`Application information`}
      onClose={() => props.onClose(undefined)}
      hasNoBodyWrapper
    >
      <PageDetails
        alertPrompts={[t`This is the only time the client secret will be shown.`]}
        numberOfColumns="single"
      >
        <PageDetail label={t`Name`}>{applicationModalSource.name}</PageDetail>
        <PageDetail label={t`Client ID`}>
          <ClipboardCopy isReadOnly variant={ClipboardCopyVariant.expansion}>
            {applicationModalSource.client_id}
          </ClipboardCopy>
        </PageDetail>
        <PageDetail
          label={t`Client Secret`}
          isEmpty={applicationModalSource.client_type === 'public'}
        >
          <ClipboardCopy isReadOnly variant={ClipboardCopyVariant.expansion}>
            {applicationModalSource.client_secret}
          </ClipboardCopy>
        </PageDetail>
      </PageDetails>
    </Modal>
  );
}
