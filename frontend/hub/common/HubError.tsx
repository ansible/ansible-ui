import { AwxError } from '../../awx/common/AwxError';

import { useTranslation } from 'react-i18next';

// TODO - before we will agree on common error for all projects, this will serve as wrapper for AwxError
export function HubError(props: { error?: Error | undefined; handleRefresh?: () => void }) {
  const { t } = useTranslation();
  return AwxError({
    error: props.error || new Error(t('NotFound')),
    handleRefresh: props.handleRefresh,
  });
}
