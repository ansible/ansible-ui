import { requestGet } from '../../common/crud/Data';
import { poll } from '../../common/poll';
import { AwxItemsResponse } from './AwxItemsResponse';

export async function pollAwxItemsResponseItem<T>(
  url: string,
  maxAttempts: number,
  interval: number
) {
  const itemsResponse = await poll(
    () => requestGet<AwxItemsResponse<T>>(url),
    (response) => !!response && response.count === 1,
    interval,
    maxAttempts
  );

  return itemsResponse.results[0];
}
