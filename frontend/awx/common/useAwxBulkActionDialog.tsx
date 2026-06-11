import { useBulkActionDialog } from '@ansible/ansible-ui-framework/PageDialogs/BulkActionDialog';
import { awxErrorAdapter } from './adapters/awxErrorAdapter';

export const useAwxBulkActionDialog = <T extends object>() =>
  useBulkActionDialog<T>(awxErrorAdapter);
