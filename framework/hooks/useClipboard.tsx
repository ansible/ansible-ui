import { AlertProps } from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '../PageAlertToaster';

type TimeoutType = AlertProps['timeout'];

type UseClipboardResult = {
  writeToClipboard: (text: string) => void;
  copySuccess: boolean;
};
/**
 * A custom React hook to interact with the Clipboard API.
 *
 * @returns {UseClipboardResult} An object with the following properties:
 * - writeToClipboard: A function that takes a string and attempts to write it
 * to the clipboard.
 * - copySuccess: A boolean indicating if the last copy attempt was
 * successful.
 */
export function useClipboard(timeout: TimeoutType = true): UseClipboardResult {
  const { t } = useTranslation();
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const alertToaster = usePageAlertToaster();

  const alertSuccess: AlertProps = {
    variant: 'success',
    title: t('Copied to clipboard'),
    timeout: timeout,
  };

  const alertError: AlertProps = {
    variant: 'danger',
    title: t('Failed to copy to clipboard'),
  };

  const alertNavigatorWarning: AlertProps = {
    variant: 'warning',
    title: t('Clipboard is not supported in this browser.'),
  };

  const writeToClipboard = (text: string) => {
    const copyToClipboardAsync = async () => {
      if (!navigator.clipboard) {
        alertToaster.addAlert(alertNavigatorWarning);
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        alertToaster.addAlert(alertSuccess);
        setCopySuccess(true);
      } catch (err) {
        alertToaster.removeAlert(alertSuccess);
        alertToaster.addAlert(alertError);
      }
    };

    copyToClipboardAsync().catch(() => {
      alertToaster.removeAlert(alertSuccess);
      alertToaster.addAlert(alertError);
    });
  };

  return { copySuccess, writeToClipboard };
}
