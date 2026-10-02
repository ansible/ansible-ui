import { lazy, Suspense, type ComponentProps } from 'react';

const RealDataEditor = lazy(() =>
  import(
    /* webpackChunkName: "data-editor" */
    '../../../framework/components/DataEditor'
  ).then((m) => ({
    default: m.DataEditor,
  }))
);

export type DataEditorLanguages = 'json' | 'yaml' | 'markdown';

type DataEditorProps = ComponentProps<typeof RealDataEditor>;

export function DataEditor(props: DataEditorProps) {
  return (
    <Suspense fallback={null}>
      <RealDataEditor {...props} />
    </Suspense>
  );
}
