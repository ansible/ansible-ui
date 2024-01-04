import { hubErrorAdapter } from '../adapters/hubErrorAdapter';
import { useBulkConfirmation } from '../../../framework/PageDialogs/BulkConfirmationDialog';

export const useHubBulkConfirmation = <T extends object>() =>
  useBulkConfirmation<T>(hubErrorAdapter);
