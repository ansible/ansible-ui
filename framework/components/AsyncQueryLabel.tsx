import { Spinner } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { RequestError } from '../../frontend/common/crud/RequestError';
import { useGetItem } from '../../frontend/common/crud/useGet';

/** Asychronously queries a label from a URL */
export function AsyncQueryLabel(props: {
  url: string;
  id: number | string | undefined;
  field?: string;
}): ReactNode {
  const { data, isLoading, error } = useGetItem<Record<string, unknown>>(props.url, props.id, {
    refreshInterval: 0, // Disable refresh on querying labels
  });

  if (props.id === undefined) return null;

  if (isLoading) return <Spinner size="md" />;

  if (error) {
    if (error.name === 'RequestError') {
      const requestError = error as RequestError;
      if (requestError.statusCode === 404) {
        return props.id.toString();
      }
    }
    return error.message;
  }

  if (!data) {
    return props.id.toString();
  }

  const value = data[props.field ?? 'name'];

  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
      return value.toString();
    default:
      return props.id.toString();
  }
}
