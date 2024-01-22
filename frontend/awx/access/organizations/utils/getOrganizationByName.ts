import { requestGet } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { Organization } from '../../../interfaces/Organization';

export async function getOrganizationByName(organizationName: string) {
  const itemsResponse = await requestGet<AwxItemsResponse<Organization>>(
    awxAPI`/organizations/?name=${organizationName}`
  );
  if (itemsResponse.results.length >= 1) {
    return itemsResponse.results[0];
  }
  return undefined;
}
