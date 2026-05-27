import { PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import { ClipboardCopy, Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Token } from '../../../interfaces/Token';

export function UserTokenSecretsModal(props: {
  onClose: (value: SetStateAction<Token | undefined>) => void;
  newToken: Token;
}) {
  const { t } = useTranslation();
  const { token, refresh_token } = props.newToken;
  return (
    <Modal
      aria-label={t`Token information`}
      isOpen
      variant={ModalVariant.medium}
      position="top"
      onClose={() => {
        props.onClose(undefined);
      }}
    >
      <ModalHeader title={t('Token information')} />
      <ModalBody>
        <PageDetails
          alertPrompts={[t`This is the only time the token will be shown.`]}
          numberOfColumns="single"
        >
          <PageDetail label={t`Token`}>
            <ClipboardCopy isReadOnly>{String(token ?? '')}</ClipboardCopy>
          </PageDetail>
          {refresh_token && (
            <PageDetail label={t`Refresh Token`}>
              <ClipboardCopy isReadOnly>{refresh_token}</ClipboardCopy>
            </PageDetail>
          )}
          <PageDetail label={t`Expires`}>{formatDateString(props.newToken.expires)}</PageDetail>
        </PageDetails>
      </ModalBody>
    </Modal>
  );
}
