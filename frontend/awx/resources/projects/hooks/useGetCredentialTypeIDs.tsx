import { useMemo } from 'react';
import { useGet } from '../../../../common/crud/useGet';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { CredentialType } from '../../../interfaces/CredentialType';
import { awxAPI } from '../../../api/awx-utils';

/**
 * Returns an object that maps credential types (scm, Insights, cryptography) to their IDs
 */
export function useGetCredentialTypeIDs() {
  const scmCredentialTypeResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?kind=scm`
  );
  const insightsCredentialTypeResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?name=Insights`
  );
  const cryptoCredentialTypeResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?kind=cryptography`
  );
  const credentialTypeIDs: { [key: string]: number } = useMemo(() => {
    const credentialTypeIds: { [key: string]: number } = {};
    if (scmCredentialTypeResponse?.data?.results) {
      credentialTypeIds['scm'] = scmCredentialTypeResponse?.data?.results[0]?.id;
    }
    if (insightsCredentialTypeResponse?.data?.results) {
      credentialTypeIds['insights'] = insightsCredentialTypeResponse?.data?.results[0]?.id;
    }
    if (cryptoCredentialTypeResponse?.data?.results) {
      credentialTypeIds['cryptography'] = cryptoCredentialTypeResponse?.data?.results[0]?.id;
    }
    return credentialTypeIds;
  }, [
    cryptoCredentialTypeResponse?.data?.results,
    insightsCredentialTypeResponse?.data?.results,
    scmCredentialTypeResponse?.data?.results,
  ]);
  return credentialTypeIDs;
}
