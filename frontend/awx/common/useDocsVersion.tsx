import { createContext, useContext } from 'react';

const DocsVersionContext = createContext<{ version?: string | undefined }>({ version: undefined });

export function useDocsVersion() {
  return useContext(DocsVersionContext);
}

export function DocsVersionProvider(props: {
  version: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <DocsVersionContext.Provider value={{ version: props.version }}>
      {props.children}
    </DocsVersionContext.Provider>
  );
}
