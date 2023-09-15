import { ReactNode, createContext, useContext, useMemo } from 'react';
import { PageNavigationItem } from './PageNavigationItem';

const PageNavigationContext = createContext<{ [key: string]: string }>({});

/** Hook to get the PageNavigationContext which provides route information for navigation. */
export function usePageNavigationRoutes() {
  return useContext(PageNavigationContext);
}

/** Provider for the PageNavigationContext which provides route information for navigation. */
export function PageNavigationRoutesProvider(props: {
  children: ReactNode;
  navigation: PageNavigationItem[];
}) {
  const routes = useMemo(() => createNavigateToRoutes('', props.navigation), [props.navigation]);
  return (
    <PageNavigationContext.Provider value={routes}>{props.children}</PageNavigationContext.Provider>
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
