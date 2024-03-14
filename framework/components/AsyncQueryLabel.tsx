import { Spinner } from '@patternfly/react-core';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetItem } from '../../frontend/common/crud/useGet';

export function ToolbarAsyncQueryChip<T>(props: {
  value: T;
  query?: (value: T) => Promise<string | undefined>;
}) {
  const { value, query: query } = props;
  const [label, setLabel] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (query) {
      void query(value).then((label) => setLabel(label));
    }
  }, [value, query]);
  return <>{label || value}</>;
}

/** Asychronously queries a label from a URL */
export function AsyncQueryLabel(props: {
  url: string;
  id: number | string;
  field?: string;
}): ReactNode {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetItem<Record<string, unknown>>(props.url, props.id);

  if (isLoading) return <Spinner size="md" />;

  if (error) {
    return t('Not found');
  }

  if (!data) {
    return t('Not found');
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
