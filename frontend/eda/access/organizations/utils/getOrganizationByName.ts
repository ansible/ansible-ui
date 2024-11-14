import { requestGet } from '@ansible/common-ui/crud/Data';
import { edaAPI } from '../../../common/eda-utils';
import { EdaItemsResponse } from '../../../common/EdaItemsResponse';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';

export async function getOrganizationByName(organizationName: string) {
  const itemsResponse = await requestGet<EdaItemsResponse<EdaOrganization>>(
    edaAPI`/organizations/?name=${organizationName}`
  );
  if (itemsResponse.results.length >= 1) {
    return itemsResponse.results[0];
  }
  return undefined;
}
