import { useEffect, useState } from 'react';

type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function useEdaProductVersionInfo() {
  const [productVersionInfo, setProductVersionInfo] = useState<ProductVersionInfo>();
  useEffect(() => {
    fetch('/api/v2/config/')
      .then((response) => response.json())
      .then((data) => setProductVersionInfo(data));
  }, []);
  return productVersionInfo;
}
