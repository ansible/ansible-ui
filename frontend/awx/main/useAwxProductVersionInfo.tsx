import { useEffect, useState } from 'react';
import { awxAPI } from '../common/api/awx-utils';

type ProductVersionInfo = Record<string, string | Record<string, string>>;

export function useAwxProductVersionInfo() {
  const [productVersionInfo, setProductVersionInfo] = useState<ProductVersionInfo>();
  useEffect(() => {
    fetch(awxAPI`/ping/`)
      .then((response) => response.json())
      .then((data) => setProductVersionInfo(data));
  }, []);
  return productVersionInfo;
}
