export function queryStringFromObject(searchParams: URLSearchParams) {
  const queryParams = Array.from(searchParams.entries());
  return queryParams
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}
