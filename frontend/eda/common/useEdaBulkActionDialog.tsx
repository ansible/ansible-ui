import { useBulkActionDialog } from '@ansible/ansible-ui-framework/PageDialogs/BulkActionDialog';
import { edaErrorAdapter } from './edaErrorAdapter';

export const useEdaBulkActionDialog = <T extends object>() =>
  useBulkActionDialog<T>(edaErrorAdapter);
