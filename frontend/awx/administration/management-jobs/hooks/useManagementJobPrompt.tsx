import { useState, useEffect } from 'react';
import { usePageDialogs } from '../../../../../framework';
import {
  ManagementJobsRetainDataModalProps,
  ManagementJobsRetainDataModal,
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
