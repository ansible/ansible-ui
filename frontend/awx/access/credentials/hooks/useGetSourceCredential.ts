import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import type { Credential } from '../../../interfaces/Credential';

export function useGetSourceCredential(id: number | undefined) {
  return useGetItem<Credential>(awxAPI`/credentials/`, id).data;
}
