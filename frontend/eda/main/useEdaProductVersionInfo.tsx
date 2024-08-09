import { useEffect, useState } from 'react';
import { edaAPI } from '../common/eda-utils';

type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function useEdaProductVersionInfo() {
  const [, setError] = useState<Error>();
  const [productVersionInfo, setProductVersionInfo] = useState<ProductVersionInfo>();
  useEffect(() => {
    fetch(edaAPI`/config/`)
      .then((response) => response.json())
      .then((data) => setProductVersionInfo(data as ProductVersionInfo))
      .catch((err) => {
        setError(err as Error);
      });
  }, []);
  return productVersionInfo;
}
