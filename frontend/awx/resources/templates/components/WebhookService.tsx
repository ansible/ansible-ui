import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useWebhookServiceOptions() {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { label: t`GitHub`, value: 'github' },
      { label: t`GitLab`, value: 'gitlab' },
      { label: t`Bitbucket Data Center`, value: 'bitbucket_dc' },
    ],
    [t]
  );
}

export function WebhookService(props: { service: string }) {
  const { service } = props;
  const options = useWebhookServiceOptions();

  const selectedService = options.find((option) => option.value === service)?.label;

  if (!selectedService) return;

  return selectedService;
}
