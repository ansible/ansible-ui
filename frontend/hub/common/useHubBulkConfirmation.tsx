import { useBulkConfirmation } from '../../../framework/PageDialogs/BulkConfirmationDialog';
import { hubErrorAdapter } from './adapters/hubErrorAdapter';
import { useHubBulkActionStatusParser } from './useHubBulkActionStatusParser';

export const useHubBulkConfirmation = <T extends object>() => {
  const statusParser = useHubBulkActionStatusParser();
  return useBulkConfirmation<T>(hubErrorAdapter, statusParser);
};
