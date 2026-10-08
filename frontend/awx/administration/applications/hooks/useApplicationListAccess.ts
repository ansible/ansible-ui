import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { isApplicationListForbidden } from '../applicationListAccess';

/**
 * Probes whether the current user can list OAuth/applications at the given URL.
 * Gateway may respond with 403 or an empty list when the user lacks view permission.
 */
export function useApplicationListAccess(applicationsUrl: string) {
  const { data, error, isLoading } = useGet<AwxItemsResponse<unknown>>(applicationsUrl, {
    page_size: 1,
  });

  const canList = useMemo(() => {
    if (isLoading) {
      return undefined;
    }
    if (isApplicationListForbidden(error)) {
      return false;
    }
    if (error) {
      return undefined;
    }
    if (data?.results !== undefined) {
      return true;
    }
    return undefined;
  }, [data, error, isLoading]);

  return { canList, isLoading };
}
