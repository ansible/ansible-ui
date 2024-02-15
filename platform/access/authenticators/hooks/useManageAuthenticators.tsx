import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Authenticator } from '../../../interfaces/Authenticator';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useReorderAuthenticators } from './useReorderAuthenticators';

export function useManageAuthenticators(onComplete: (items: Authenticator[]) => void) {
  const { t } = useTranslation();
  const view = usePlatformView<Authenticator>({
    url: gatewayV1API`/authenticators/`.concat('?order_by=order&page=1&page_size=300'),
  });

  const { openReorderModal: openReorderModal } = useReorderAuthenticators({
    title: t('Manage authentication order'),
    description: t(
      'The panels are ordered from top to bottom on the list. Use the draggable icon :: to re-order your authentication.'
    ),
    items: view.pageItems || [],
    onComplete: onComplete,
  });

  return useMemo(
    () => ({
      openReorderModal,
    }),
    [openReorderModal]
  );
}
