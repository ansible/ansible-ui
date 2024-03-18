import { useEffect, useState } from 'react';
import { awxAPI } from '../common/api/awx-utils';

type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function useAwxProductVersionInfo() {
  const [, setError] = useState<Error>();
  const [productVersionInfo, setProductVersionInfo] = useState<ProductVersionInfo>();
  useEffect(() => {
    fetch(awxAPI`/ping/`)
      .then((response) => response.json())
      .then((data) => setProductVersionInfo(data as ProductVersionInfo))
      .catch((err) => {
        setError(err as Error);
      });
  }, []);
  return productVersionInfo;
}
