import { hubErrorAdapter } from '../adapters/hubErrorAdapter';
import { useBulkActionDialog } from '../../../framework/PageDialogs/BulkActionDialog';

export const useHubBulkActionDialog = <T extends object>() =>
  useBulkActionDialog<T>(hubErrorAdapter);
