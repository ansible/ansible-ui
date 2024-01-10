import { useBulkActionDialog } from '../../../framework/PageDialogs/BulkActionDialog';
import { hubErrorAdapter } from './adapters/hubErrorAdapter';

export const useHubBulkActionDialog = <T extends object>() =>
  useBulkActionDialog<T>(hubErrorAdapter);
