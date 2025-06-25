import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useManageItems } from '@ansible/ansible-ui-framework/components/useManagedItems';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { AuthenticatorMap } from '../../../interfaces/AuthenticatorMap';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export function useManageMappings(authenticatorId: number, refresh: () => unknown) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const patchRequest = usePatchRequest();
  const columns = useMemo(
    () => [
      {
        header: t('Name'),
        cell: (map: AuthenticatorMap) => map.name,
      },
    ],
    [t]
  );

  const { data } = useGet<{ results: AuthenticatorMap[] }>(
    gatewayAPI`/authenticators/${authenticatorId.toString()}/authenticator_maps/?order_by=order`
  );
  const { openManageItems: openManageMappingOrder } = useManageItems({
    id: `authenticator-map-reorder-${params.id}`,
    title: 'Manage mappings',
    description: t(
      'The mappings are ordered from top to bottom on the list. Use the draggable icon :: to re-order your mappings.'
    ),
    items: data?.results ?? [],
    keyFn: (map) => map.name.toLowerCase().replace(/\s/g, '-'),
    columns,
    hideSelection: true,
    onSubmit: (items) => {
      let order = 1;
      for (const map of items) {
        map.order = order;
        order++;
      }
      const requests = items.map((map) =>
        patchRequest(gatewayAPI`/authenticator_maps/${map.id.toString()}/`, map)
      );
      void Promise.all(requests).then(refresh);
    },
  });

  return useMemo(() => ({ openManageMappingOrder }), [openManageMappingOrder]);
}
