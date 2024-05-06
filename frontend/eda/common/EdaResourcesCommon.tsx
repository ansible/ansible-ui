import { EdaItemsResponse } from './EdaItemsResponse';
import { requestGet } from '../../common/crud/Data';
import { EdaCredential } from '../interfaces/EdaCredential';

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

export function ResourceRefInUse<T extends { id: number | string; name: string }>(
  item: T,
  query: string
) {
  return requestGet<EdaCredential>(`${query}/${item.id}/?refs=true`);
}
export async function InUseResourceRefs<T extends { id: number | string; name: string }>(
  resources: T[],
  query: string
) {
  const inUseResources: string[] = [];
  await Promise.all(
    resources.map(async (item) => {
      const inUseRes = await ResourceRefInUse(item, query);
      if (inUseRes?.references && inUseRes?.references.length > 0) {
        inUseResources.push(item.name);
      }
    })
  );
  return inUseResources;
}
