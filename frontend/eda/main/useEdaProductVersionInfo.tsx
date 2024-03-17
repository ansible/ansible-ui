import { useEffect, useState } from 'react';
import { edaAPI } from '../common/eda-utils';

type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function useEdaProductVersionInfo() {
  const [productVersionInfo, setProductVersionInfo] = useState<ProductVersionInfo>();
  useEffect(() => {
    fetch(edaAPI`/ping/`)
      .then((response) => response.json())
      .then((data) => setProductVersionInfo(data));
  }, []);
  return productVersionInfo;
}
