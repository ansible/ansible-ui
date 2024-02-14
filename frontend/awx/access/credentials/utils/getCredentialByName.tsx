import { awxAPI } from '../../../common/api/awx-utils';
import { requestGet } from '../../../../common/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Credential } from '../../../interfaces/Credential';

export async function getCredentialByName(credentialName: string) {
  const itemsResponse = await requestGet<AwxItemsResponse<Credential>>(
    awxAPI`/credentials/?name=${credentialName}`
  );
  if (itemsResponse.results.length >= 1) {
    return itemsResponse.results[0];
  }
  return undefined;
}
