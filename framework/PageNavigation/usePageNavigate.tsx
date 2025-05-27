import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetPageUrl } from './useGetPageUrl';

/** Hook to get the function to navigate to a page given the page id. */
export function usePageNavigate() {
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  return useCallback(
    (
      pageId: string,
      options?: {
        params?: Record<string, string | number | undefined>;
        query?: Record<string, string | string[] | number | number[] | undefined>;
      }
    ) => {
      const url = getPageUrl(pageId, options);
      if (url) {
        navigate(url);
      }
    },
    [navigate, getPageUrl]
  );
}
