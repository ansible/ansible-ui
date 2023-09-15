import { useNavigate } from 'react-router-dom';
import { useGetPageUrl } from './useGetPageUrl';

/** Hook to get the function to navigate to a page given the page id. */
export function usePageNavigate() {
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  return (
    pageId: string,
    options?: {
      params?: Record<string, string | number>;
      query?: Record<string, string | number>;
    }
  ) => {
    const url = getPageUrl(pageId, options);
    if (url) {
      navigate(url);
    }
  };
}
