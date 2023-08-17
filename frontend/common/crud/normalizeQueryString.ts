export function normalizeQueryString(query: Record<string, string | number | boolean> | undefined) {
  if (query && Object.keys(query).length > 0) {
    const normalizedQuery = Object.keys(query).reduce<Record<string, string>>(
      (normalizedQuery, key) => {
        normalizedQuery[key] = query[key].toString();
        return normalizedQuery;
      },
      {}
    );
    return '?' + new URLSearchParams(normalizedQuery).toString();
  }
  return '';
}
