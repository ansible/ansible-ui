import { useBulkConfirmation } from '@ansible/ansible-ui-framework/PageDialogs/BulkConfirmationDialog';
import { awxErrorAdapter } from './adapters/awxErrorAdapter';

export const useAwxBulkConfirmation = <T extends object>() =>
  useBulkConfirmation<T>(awxErrorAdapter);
