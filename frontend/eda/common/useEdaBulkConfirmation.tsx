import { useBulkConfirmation } from '@ansible/ansible-ui-framework/PageDialogs/BulkConfirmationDialog';
import { edaErrorAdapter } from './edaErrorAdapter';

export const useEdaBulkConfirmation = <T extends object>() =>
  useBulkConfirmation<T>(edaErrorAdapter);
