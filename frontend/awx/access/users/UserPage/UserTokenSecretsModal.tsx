import { t } from 'i18next';
import { SetStateAction } from 'react';
import { Modal, ClipboardCopy, ClipboardCopyVariant } from '@patternfly/react-core';
import { PageDetails, PageDetail } from '../../../../../framework';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { Token } from '../../../interfaces/Token';

export function UserTokenSecretsModal(props: {
  onClose: (value: SetStateAction<Token | undefined>) => void;
  newToken: Token;
}) {
  const { token, refresh_token } = props.newToken;
  return (
    <Modal
      aria-label={t`Token information`}
      isOpen
      variant="medium"
      position="top"
      title={t('Token information')}
      onClose={() => {
        props.onClose(undefined);
      }}
      hasNoBodyWrapper
    >
      <PageDetails
        alertPrompts={[t`This is the only time the token will be shown.`]}
        numberOfColumns="single"
      >
        <PageDetail label={t`Token`}>
          <ClipboardCopy isReadOnly variant={ClipboardCopyVariant.expansion}>
            {token}
          </ClipboardCopy>
        </PageDetail>
        {refresh_token && (
          <PageDetail label={t`Refresh Token`}>
            <ClipboardCopy isReadOnly variant={ClipboardCopyVariant.expansion}>
              {refresh_token}
            </ClipboardCopy>
          </PageDetail>
        )}
        <PageDetail label={t`Expires`}>{formatDateString(props.newToken.expires)}</PageDetail>
      </PageDetails>
    </Modal>
  );
}
