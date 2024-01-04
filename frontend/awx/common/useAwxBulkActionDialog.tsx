import { awxErrorAdapter } from '../adapters/awxErrorAdapter';
import { useBulkActionDialog } from '../../../framework/PageDialogs/BulkActionDialog';

export const useAwxBulkActionDialog = <T extends object>() =>
  useBulkActionDialog<T>(awxErrorAdapter);
