import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../components/useBreakPoint';

interface PageNavSideBarState {
  isOpen: boolean;
  setState: (state: Partial<PageNavSideBarState>) => void;
}

export const PageNavSideBarContext = createContext<PageNavSideBarState>({
  isOpen: false,
  setState: () => ({}),
});

export function usePageNavSideBar() {
  return useContext(PageNavSideBarContext);
}

export function PageNavSideBarProvider(props: { children: ReactNode }) {
  const isXl = useBreakpoint('xl');
  const [isOpen, setOpen] = useState(() => isXl);
  const setState = useCallback((state: Partial<PageNavSideBarState>) => {
    if (state.isOpen !== undefined) {
      setOpen(state.isOpen);
    }
  }, []);
  useEffect(() => setState({ isOpen: isXl }), [isXl, setState]);
  return (
    <PageNavSideBarContext.Provider value={{ isOpen, setState }}>
      {props.children}
    </PageNavSideBarContext.Provider>
  );
}

export function usePageNavBarClick() {
  const navigate = useNavigate();
  const isXl = useBreakpoint('xl');
  const navBar = usePageNavSideBar();
  const onClick = useCallback(
    (path: string) => {
      navigate(path);
      if (!isXl) navBar.setState({ isOpen: !navBar.isOpen });
    },
    [navigate, isXl, navBar]
  );
  return onClick;
}
