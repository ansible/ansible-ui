import { createContext, ReactNode, useCallback, useContext } from 'react';

const PageNavigateCallbackContext = createContext<((url: string) => void) | undefined>(undefined);

function usePageNavigateCallback() {
  return useContext(PageNavigateCallbackContext);
}

export function PageNavigateCallbackContextProvider(props: {
  callback?: (url: string) => void;
  children: ReactNode;
}) {
  return (
    <PageNavigateCallbackContext.Provider value={props.callback}>
      {props.children}
    </PageNavigateCallbackContext.Provider>
  );
}

export function usePageNavigate() {
  const pageNavigateCallback = usePageNavigateCallback();
  const navigate = useCallback(
    (to?: string) => {
      if (to?.startsWith('http')) {
        open(to, '_blank');
      } else {
        pageNavigateCallback ? pageNavigateCallback(to ?? '') : open(to, '_self');
      }
    },
    [pageNavigateCallback]
  );
  return navigate;
}
