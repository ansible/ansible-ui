import { useEffect, useState } from 'react';
import { hubAPI } from '../../../cypress/support/formatApiPathForHub';

type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function useHubProductVersionInfo() {
  const [productVersionInfo, setProductVersionInfo] = useState<ProductVersionInfo>();
  useEffect(() => {
    fetch(hubAPI`/`)
      .then((response) => response.json())
      .then((data) => setProductVersionInfo(data));
  }, []);
  return productVersionInfo;
}
