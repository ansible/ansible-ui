import { awxErrorAdapter } from '../adapters/awxErrorAdapter';
import { useBulkConfirmation } from '../../../framework/PageDialogs/BulkConfirmationDialog';

export const useAwxBulkConfirmation = <T extends object>() =>
  useBulkConfirmation<T>(awxErrorAdapter);
