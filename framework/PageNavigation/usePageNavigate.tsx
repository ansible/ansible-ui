import { useNavigate } from 'react-router-dom';
import { useGetPageUrl } from './useGetPageUrl';

/** Hook to get the function to navigate to a page given the page id. */
export function usePageNavigate() {
  const navigate = useNavigate();
  const getPageUrl = useGetPageUrl();
  return (pageId: string, params?: Record<string, string>) => {
    const url = getPageUrl(pageId, params);
    if (url) {
      navigate(url);
    }
  };
}
