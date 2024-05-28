import { useState, useEffect } from 'react';
import { usePageAlertToaster, usePageDialogs } from '../../../../../framework';
import {
  CredentialsExternalTestModalProps,
  CredentialsExternalTestModal,
} from '../utils/CredentialsExternalTestModal';

export function useCredentialsTestModal() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<CredentialsExternalTestModalProps>();
  const toaster = usePageAlertToaster();

  useEffect(() => {
    if (props) {
      pushDialog(
        <CredentialsExternalTestModal
          {...{ ...props, popDialog: popDialog, alertToaster: toaster }}
        />
      );
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog, toaster]);

  return setProps;
}
