import { useState, useEffect } from 'react';
import { IPageAlertToaster, usePageDialogs } from '../../../../../framework';
import {
  CredentialsExternalTestModalProps,
  CredentialsExternalTestModal,
} from '../utils/CredentialsExternalTestModal';

export function useCredentialsTestModal(alertToaster: IPageAlertToaster) {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<CredentialsExternalTestModalProps>();

  useEffect(() => {
    if (props) {
      pushDialog(
        <CredentialsExternalTestModal {...{ ...props, popDialog: popDialog, alertToaster }} />
      );
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog, alertToaster]);

  return setProps;
}
