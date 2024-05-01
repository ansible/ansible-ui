import { useState, useEffect } from 'react';
import { usePageDialogs } from '../../../../../framework';
import {
  CredentialsExternalTestModalProps,
  CredentialsExternalTestModal,
} from '../utils/CredentialsExternalTestModal';

export function useCredentialsTestModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<CredentialsExternalTestModalProps>();

  useEffect(() => {
    if (props) {
      pushDialog(<CredentialsExternalTestModal {...{ ...props, popDialog: popDialog }} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog]);

  return setProps;
}
