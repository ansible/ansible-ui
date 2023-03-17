import { ItemsResponse, requestGet } from '../../../../Data';
import { Organization } from '../../../interfaces/Organization';

export async function getOrganizationByName(organizationName: string) {
  const itemsResponse = await requestGet<ItemsResponse<Organization>>(
    `/api/v2/organizations/?name=${organizationName}`
  );
  if (itemsResponse.results.length >= 1) {
    return itemsResponse.results[0];
  }
  return undefined;
}
