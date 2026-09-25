import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialType } from '../../../interfaces/CredentialType';

/**
 * Returns an object that maps credential types (scm, Insights, cryptography) to their IDs
 */
export function useGetCredentialTypeIDs() {
  const scmCredentialTypeResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?kind=scm&count_disabled=1`
  );
  const insightsCredentialTypeResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?name=Insights&count_disabled=1`
  );
  const cryptoCredentialTypeResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?kind=cryptography&count_disabled=1`
  );
  const registryCredentialTypeResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?kind=registry&count_disabled=1`
  );
  const galaxyCredentialTypeResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/?kind=galaxy&count_disabled=1`
  );
  const credentialTypeIDs: { [key: string]: number } = useMemo(() => {
    const credentialTypeIds: { [key: string]: number } = {};
    const scmId = scmCredentialTypeResponse?.data?.results?.[0]?.id;
    if (scmId !== undefined) {
      credentialTypeIds['scm'] = scmId;
    }
    const insightsId = insightsCredentialTypeResponse?.data?.results?.[0]?.id;
    if (insightsId !== undefined) {
      credentialTypeIds['insights'] = insightsId;
    }
    const cryptographyId = cryptoCredentialTypeResponse?.data?.results?.[0]?.id;
    if (cryptographyId !== undefined) {
      credentialTypeIds['cryptography'] = cryptographyId;
    }
    const registryId = registryCredentialTypeResponse?.data?.results?.[0]?.id;
    if (registryId !== undefined) {
      credentialTypeIds['registry'] = registryId;
    }
    const galaxyId = galaxyCredentialTypeResponse?.data?.results?.[0]?.id;
    if (galaxyId !== undefined) {
      credentialTypeIds['galaxy'] = galaxyId;
    }
    return credentialTypeIds;
  }, [
    cryptoCredentialTypeResponse?.data?.results,
    insightsCredentialTypeResponse?.data?.results,
    scmCredentialTypeResponse?.data?.results,
    registryCredentialTypeResponse?.data?.results,
    galaxyCredentialTypeResponse?.data?.results,
  ]);
  return credentialTypeIDs;
}
