import { useTranslation } from 'react-i18next';
import { StatusWithMessageAndUrl, useGetPageUrl } from '../../../framework';
import { useCallback } from 'react';
import { BackgroundTaskInterface } from './api/hub-api-utils';

/**
 * Hook to parse a successful response object (Hub API) into a status that can be used on the BulkActionDialog
 * @returns
 * function that accepts a response object and returns:
 * 1. null, if there are no background tasks
 * 2. an object with translated message and URL for tracking progress of the associated background task
 */
export function useHubBulkActionStatusParser() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return useCallback(
    (response: unknown) => {
      const backgroundTaskObject = response as BackgroundTaskInterface;
      if (backgroundTaskObject?.backgroundTask) {
        const backgroundTaskUrl = backgroundTaskObject?.backgroundTask
          ? getPageUrl(backgroundTaskObject?.route ?? '', {
              params: { id: backgroundTaskObject?.id },
            })
          : undefined;
        return {
          message: t('The progress of this task can be tracked on the Task Management page.'),
          url: backgroundTaskUrl,
        } as StatusWithMessageAndUrl;
      }
      return null;
    },
    [getPageUrl, t]
  );
}
