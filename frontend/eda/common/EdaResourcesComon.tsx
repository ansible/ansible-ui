import { EdaItemsResponse } from './EdaItemsResponse';
import { requestGet } from '../../common/crud/Data';

export function ResourceInUse<T extends { id: number | string; name: string }>(
  item: T,
  query: string
) {
  return requestGet<EdaItemsResponse<T>>(`${query}${item.id}`);
}
export async function InUseResources<T extends { id: number | string; name: string }>(
  resources: T[],
  query: string
) {
  const inUseResources: string[] = [];
  await Promise.all(
    resources.map(async (item) => {
      const inUseRes = await ResourceInUse(item, query);
      if (inUseRes?.count > 0) {
        inUseResources.push(item.name);
      }
    })
  );
  return inUseResources;
}
