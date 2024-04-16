import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

const PageDialogContext = createContext({
  dialogs: [] as ReactNode[],
  clearDialogs: () => {},
  pushDialog: (_dialog: ReactNode) => {},
  popDialog: () => {},
});

export function PageDialogProvider(props: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<ReactNode[]>([]);
  const clearDialogs = useCallback(
    () => setDialogs((current) => (current.length ? [] : current)),
    [setDialogs]
  );
  const pushDialog = useCallback(
    (dialog: ReactNode) => setDialogs((dialogs) => [...dialogs, dialog]),
    [setDialogs]
  );
  const popDialog = useCallback(() => setDialogs((dialogs) => dialogs.slice(0, -1)), [setDialogs]);
  const value = useMemo(
    () => ({ dialogs, clearDialogs, pushDialog, popDialog }),
    [clearDialogs, dialogs, popDialog, pushDialog]
  );
  return (
    <PageDialogContext.Provider value={value}>
      {dialogs.length > 0 && dialogs[dialogs.length - 1]}
      {props.children}
    </PageDialogContext.Provider>
  );
}

export function usePageDialogs() {
  return useContext(PageDialogContext);
}

/*
 * @deprecated Use usePageDialogs instead
 */
export function usePageDialog(): [
  dialog: ReactNode | undefined,
  setDialog: (dialog: ReactNode | undefined) => void,
] {
  const { dialogs, clearDialogs, pushDialog } = usePageDialogs();
  const dialog = useMemo(
    () => (dialogs.length > 0 ? dialogs[dialogs.length - 1] : undefined),
    [dialogs]
  );
  const setDialog = useCallback(
    (dialog: ReactNode | undefined) => {
      clearDialogs();
      if (dialog !== undefined) {
        pushDialog(dialog);
      }
    },
    [clearDialogs, pushDialog]
  );
  return useMemo(() => [dialog, setDialog] as const, [dialog, setDialog]);
}
