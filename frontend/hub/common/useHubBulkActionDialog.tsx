import { useBulkActionDialog } from '../../../framework/PageDialogs/BulkActionDialog';
import { hubErrorAdapter } from './adapters/hubErrorAdapter';
import { useHubBulkActionStatusParser } from './useHubBulkActionStatusParser';

export const useHubBulkActionDialog = <T extends object>() => {
  const statusParser = useHubBulkActionStatusParser();
  return useBulkActionDialog<T>(hubErrorAdapter, statusParser);
};
