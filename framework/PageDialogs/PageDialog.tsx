import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const PageDialogContext = createContext<
  [dialogs: ReactNode[], setDialogs: Dispatch<SetStateAction<ReactNode[]>>]
>([
  [],
  () => {
    throw new Error('PageDialogContext not initialized');
  },
]);

export function PageDialogProvider(props: { children: ReactNode }) {
  const state = useState<ReactNode[]>([]);
  const [dialogs] = state;
  return (
    <PageDialogContext.Provider value={state}>
      {dialogs.length > 0 && dialogs[dialogs.length - 1]}
      {props.children}
    </PageDialogContext.Provider>
  );
}

export function usePageDialogs(): [
  dialog: ReactNode[],
  setDialog: Dispatch<SetStateAction<ReactNode[]>>,
] {
  return useContext(PageDialogContext);
}

/*
 * @deprecated Use usePageDialogs instead
 */
export function usePageDialog(): [
  dialog: ReactNode | undefined,
  setDialog: (dialog: ReactNode | undefined) => void,
] {
  const [dialogs, setDialogs] = usePageDialogs();
  const dialog = useMemo(
    () => (dialogs.length > 0 ? dialogs[dialogs.length - 1] : undefined),
    [dialogs]
  );
  const setDialog = useCallback(
    (dialog: ReactNode | undefined) => {
      if (dialog === undefined) {
        setDialogs([]);
      } else {
        setDialogs([dialog]);
      }
    },
    [setDialogs]
  );
  return useMemo(() => [dialog, setDialog] as const, [dialog, setDialog]);
}
