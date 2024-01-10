import { useBulkConfirmation } from '../../../framework/PageDialogs/BulkConfirmationDialog';
import { hubErrorAdapter } from './adapters/hubErrorAdapter';

export const useHubBulkConfirmation = <T extends object>() =>
  useBulkConfirmation<T>(hubErrorAdapter);
