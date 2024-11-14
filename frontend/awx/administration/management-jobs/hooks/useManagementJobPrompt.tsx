import { usePageDialogs } from '@ansible/ansible-ui-framework';
import { useEffect, useState } from 'react';
import {
  ManagementJobsRetainDataModal,
  ManagementJobsRetainDataModalProps,
} from '../components/ManagementJobsRetainDataModal';

export function useManagementJobPrompt() {
  const { pushDialog, popDialog } = usePageDialogs();
  const [props, setProps] = useState<ManagementJobsRetainDataModalProps>();
  useEffect(() => {
    if (props) {
      pushDialog(<ManagementJobsRetainDataModal {...{ ...props, popDialog: popDialog }} />);
    } else {
      popDialog();
    }
  }, [props, pushDialog, popDialog]);
  return setProps;
}
