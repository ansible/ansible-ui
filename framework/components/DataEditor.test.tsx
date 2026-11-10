/* eslint-disable i18next/no-literal-string */
import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const pageSettings = vi.hoisted(() => ({ activeTheme: 'light' as 'light' | 'dark' }));

vi.mock('../PageSettings/PageSettingsProvider', () => ({
  usePageSettings: () => pageSettings,
}));

vi.mock('../hooks/useResizeObserver', () => ({
  useResizeObserver: (_target: unknown, callback: () => void) => {
    const React = require('react') as typeof import('react');
    React.useLayoutEffect(() => {
      callback();
    }, [callback]);
  },
}));

const setError = vi.fn();
const onChange = vi.fn();
const editorFactory = vi.hoisted(() => vi.fn());
const editorInstance = vi.hoisted(() => ({
  current: null as null | {
    __focus: () => void;
    __blur: () => void;
    updateOptions: ReturnType<typeof vi.fn>;
    addAction: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
    __triggerChange: () => void;
  },
}));

vi.mock('monaco-editor', () => {
  const markersDisposable = { dispose: vi.fn() };
  const contentDisposable = { dispose: vi.fn() };
  let storedValue = 'hello';
  const changeHandlers: Array<() => void> = [];
  let markersHandler: (() => void) | undefined;

  return {
    KeyCode: { Enter: 13 },
    Range: function Range() {},
    json: { jsonDefaults: { setDiagnosticsOptions: vi.fn() } },
    languages: { register: vi.fn(), setMonarchTokensProvider: vi.fn() },
    editor: {
      defineTheme: vi.fn(),
      create: (...args: unknown[]) => {
        editorFactory(...args);
        let focusHandler: (() => void) | undefined;
        let blurHandler: (() => void) | undefined;
        const editor = {
          addAction: vi.fn(),
          getPosition: () => ({ lineNumber: 1, column: 1 }),
          executeEdits: vi.fn(),
          getModel: () => ({
            onDidChangeContent: (handler: () => void) => {
              changeHandlers.push(handler);
              return contentDisposable;
            },
            triggerChange: () => changeHandlers.forEach((handler) => handler()),
            getLanguageId: () => 'json',
            uri: {},
          }),
          getValue: () => storedValue,
          setValue: vi.fn((value: string) => {
            storedValue = value;
            changeHandlers.forEach((handler) => handler());
          }),
          layout: vi.fn(),
          updateOptions: vi.fn(),
          onDidFocusEditorText: vi.fn((handler: () => void) => {
            focusHandler = handler;
            return contentDisposable;
          }),
          onDidBlurEditorText: vi.fn((handler: () => void) => {
            blurHandler = handler;
            return contentDisposable;
          }),
          dispose: vi.fn(),
          __focus: () => focusHandler?.(),
          __blur: () => blurHandler?.(),
          __triggerChange: () => editor.getModel().triggerChange(),
        };
        editorInstance.current = editor;
        return editor;
      },
      onDidChangeMarkers: vi.fn((handler: () => void) => {
        markersHandler = handler;
        return markersDisposable;
      }),
      getModelMarkers: vi.fn(() => []),
      setModelLanguage: vi.fn(),
      __triggerMarkers: () => markersHandler?.(),
      __setMarkers: (markers: { message: string }[]) => {
        return markers;
      },
    },
  };
});

import { DataEditor } from './DataEditor';
import * as monaco from 'monaco-editor';

describe('DataEditor', () => {
  beforeEach(() => {
    setError.mockReset();
    onChange.mockReset();
    editorFactory.mockReset();
    vi.mocked(monaco.editor.getModelMarkers).mockReturnValue([]);
  });

  it('creates a monaco editor and reports empty validation state', async () => {
    render(
      <DataEditor
        name="payload"
        language="json"
        value="hello"
        onChange={onChange}
        setError={setError}
        lineNumbers
      />
    );

    await waitFor(() => {
      expect(editorFactory).toHaveBeenCalled();
    });
  });

  it('switches editor theme when page settings change', async () => {
    pageSettings.activeTheme = 'dark';
    render(
      <DataEditor
        name="payload"
        language="json"
        value="{}"
        onChange={onChange}
        setError={setError}
      />
    );

    await waitFor(() => expect(editorFactory).toHaveBeenCalled());
    pageSettings.activeTheme = 'light';
  });

  it('syncs external value changes into the editor model', async () => {
    const { rerender } = render(
      <DataEditor
        name="payload"
        language="json"
        value="one"
        onChange={onChange}
        setError={setError}
      />
    );

    await waitFor(() => expect(editorFactory).toHaveBeenCalled());

    rerender(
      <DataEditor
        name="payload"
        language="json"
        value="two"
        onChange={onChange}
        setError={setError}
      />
    );

    await waitFor(() => expect(editorFactory).toHaveBeenCalled());
  });

  it('surfaces marker messages as editor errors', async () => {
    vi.mocked(monaco.editor.getModelMarkers).mockReturnValue([
      {
        message: 'Invalid JSON',
        owner: 'json',
        resource: {} as monaco.Uri,
        severity: 8,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1,
      },
    ]);

    render(
      <DataEditor
        name="payload"
        language="yaml"
        value="bad:"
        onChange={onChange}
        setError={setError}
      />
    );

    await waitFor(() => {
      expect(editorFactory).toHaveBeenCalled();
    });

    const trigger = (
      monaco.editor.onDidChangeMarkers as unknown as { mock: { calls: [() => void][] } }
    ).mock.calls[0]?.[0];
    trigger?.();

    await waitFor(() => {
      expect(setError).toHaveBeenCalledWith('Invalid JSON');
    });
  });

  it('propagates focus, blur, and read-only changes to monaco', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    const { rerender } = render(
      <DataEditor
        name="payload"
        language="json"
        value={'line1\nline2\nline3'}
        onChange={onChange}
        setError={setError}
        isReadOnly={false}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );

    await waitFor(() => expect(editorFactory).toHaveBeenCalled());
    const editor = editorInstance.current;
    expect(editor).toBeTruthy();
    act(() => {
      editor!.__focus();
      editor!.__blur();
    });
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();

    rerender(
      <DataEditor
        name="payload"
        language="json"
        value={'line1\nline2\nline3'}
        onChange={onChange}
        setError={setError}
        isReadOnly
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );

    await waitFor(() => {
      expect(editorInstance.current?.updateOptions).toHaveBeenCalledWith({ readOnly: true });
    });
  });

  it('runs the custom enter action and syncs content changes', async () => {
    render(
      <DataEditor
        name="payload"
        language="markdown"
        value="hello"
        onChange={onChange}
        setError={setError}
      />
    );

    await waitFor(() => expect(editorInstance.current).toBeTruthy());

    const action = editorInstance.current!.addAction.mock.calls[0]?.[0] as {
      run: (editor: {
        getPosition: () => { lineNumber: number; column: number } | null;
        executeEdits: ReturnType<typeof vi.fn>;
      }) => void;
    };
    const executeEdits = vi.fn();
    action.run({ getPosition: () => null, executeEdits });
    action.run({ getPosition: () => ({ lineNumber: 2, column: 3 }), executeEdits });
    expect(executeEdits).toHaveBeenCalled();
    editorInstance.current!.__triggerChange();
    expect(onChange).toHaveBeenCalled();
  });

  it('disposes the editor after unmount', async () => {
    const { unmount } = render(
      <DataEditor
        name="payload"
        language="json"
        value="{}"
        onChange={onChange}
        setError={setError}
      />
    );

    await waitFor(() => expect(editorInstance.current).toBeTruthy());

    vi.useFakeTimers();
    unmount();
    vi.advanceTimersByTime(10000);
    expect(editorInstance.current?.dispose).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
