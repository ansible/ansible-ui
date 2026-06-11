import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PageNavigationItem } from './PageNavigationItem';

const PageNavigationContext = createContext<
  [{ [key: string]: string }, (navigation: PageNavigationItem[]) => void]
>([{}, () => {}]);

/** Hook to get the PageNavigationContext which provides route information for navigation. */
export function usePageNavigationRoutes() {
  return useContext(PageNavigationContext)[0];
}

export function usePageNavigationRoutesContext() {
  return useContext(PageNavigationContext);
}

/** Provider for the PageNavigationContext which provides route information for navigation. */
export function PageNavigationRoutesProvider(props: { children: ReactNode }) {
  // const routes = useMemo(() => createNavigateToRoutes('', props.navigation), [props.navigation]);
  const [routes, setRoutes] = useState<{ [key: string]: string }>({});
  const setNavigation = useCallback((navigation: PageNavigationItem[]) => {
    setRoutes(createNavigateToRoutes('', navigation));
  }, []);
  const value = useMemo<[{ [key: string]: string }, (navigation: PageNavigationItem[]) => void]>(
    () => [routes, setNavigation],
    [routes, setNavigation]
  );
  return (
    <PageNavigationContext.Provider value={value}>{props.children}</PageNavigationContext.Provider>
  );
}

function createNavigateToRoutes(base: string, navigation: PageNavigationItem[]) {
  const routes: { [key: string]: string } = {};
  navigation.forEach((item) => {
    const itemPath = (base + '/' + item.path).replace('//', '/');
    if ('id' in item && typeof item.id === 'string') {
      routes[item.id] = itemPath;
    }
    if ('children' in item) {
      Object.assign(routes, createNavigateToRoutes(itemPath, item.children));
    }
  });
  return routes;
}
