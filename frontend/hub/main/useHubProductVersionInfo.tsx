import { useEffect, useState } from 'react';
import { hubAPI } from '../common/api/formatPath';

type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function useHubProductVersionInfo() {
  const [, setError] = useState<Error>();
  const [productVersionInfo, setProductVersionInfo] = useState<ProductVersionInfo>();
  useEffect(() => {
    fetch(hubAPI`/`)
      .then((response) => response.json())
      .then((data) => setProductVersionInfo(data as ProductVersionInfo))
      .catch((err) => {
        setError(err as Error);
      });
  }, []);
  return productVersionInfo;
}
