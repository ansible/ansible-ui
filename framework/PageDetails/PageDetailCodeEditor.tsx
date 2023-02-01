import useResizeObserver from '@react-hook/resize-observer';
import * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import { PageDetail, useSettings } from '../';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function PageDetailCodeEditor(props: { label: string; value: string; helpText?: string }) {
  const { t } = useTranslation();

  const { label, value } = props;
  const { id } = useParams();
  return (
    <PageDetail label={label ?? t('Variables')}>
      <MonacoEditor id={id} value={value} />
    </PageDetail>
  );
}

export function MonacoEditor(props: { id?: string; value?: string }) {
  const divEl = useRef<HTMLDivElement>(null);

  const editorRef = useRef<{
    editor?: monaco.editor.IStandaloneCodeEditor;
  }>({});

  const settings = useSettings();

  useEffect(() => {
    let editor: monaco.editor.IStandaloneCodeEditor;

    monaco.editor.defineTheme('my-dark', {
      base: 'vs-dark',
      inherit: true,
      colors: {
        'editor.background': '#00000000',
        'minimap.background': '#00000000',
        'scrollbarSlider.background': '#FFFFFF22',
      },
      rules: [{ token: '', background: '#222222' }],
    });

    monaco.editor.defineTheme('my-light', {
      base: 'vs',
      inherit: true,
      colors: {
        'editor.background': '#FFFFFF00',
        'minimap.background': '#FFFFFF00',
        'scrollbarSlider.background': '#FFFFFF22',
      },
      rules: [],
    });
    if (divEl.current) {
      editor = monaco.editor.create(divEl.current, {
        lineNumbers: 'on',
        language: 'yaml',
        theme: 'my-dark',
        lineDecorationsWidth: 8,
        readOnly: true,
        padding: { top: 6, bottom: 8 },
        fontSize: 14,
        fontFamily: 'RedHatMono',
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        renderLineHighlightOnlyWhenFocus: true,
        formatOnType: true,
      });
    }

    return () => {
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current?.editor) {
      const currentValue = editorRef.current.editor.getValue();
      if (currentValue !== props.value) editorRef.current.editor.setValue(props.value ?? '');
    }
  }, [props.value]);

  useResizeObserver(divEl, () => {
    if (editorRef.current?.editor) {
      editorRef.current.editor.layout();
    }
  });

  useEffect(() => {
    if (editorRef.current?.editor) {
      editorRef.current.editor.updateOptions({
        theme: settings.activeTheme === 'dark' ? 'my-dark' : 'my-light',
      });
    }
  }, [settings.activeTheme]);

  const height = editorRef.current.editor?.getLayoutInfo().height;

  return (
    <div
      className={`pf-c-form-control`}
      style={{ padding: 0, height: height ? `${height + 25}px` : '400px' }}
    >
      <div id={props.id} ref={divEl} style={{ height: height ? `${height}px` : '100%' }}></div>
    </div>
  );
}
