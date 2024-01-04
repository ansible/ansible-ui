import { useBulkActionDialog } from '../../../framework/PageDialogs/BulkActionDialog';
import { edaErrorAdapter } from './edaErrorAdapter';

export const useEdaBulkActionDialog = <T extends object>() =>
  useBulkActionDialog<T>(edaErrorAdapter);
