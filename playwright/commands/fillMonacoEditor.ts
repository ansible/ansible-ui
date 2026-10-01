import { expect, Locator, Page } from '@playwright/test';

const CLIPBOARD_PERMISSIONS = ['clipboard-read', 'clipboard-write'] as const;

/**
 * Fill a Monaco editor with the given text.
 *
 * Monaco 0.56+ uses a `native-edit-context` element that is NOT a standard
 * `<textarea>` or `[contenteditable]`. Playwright's `.fill()` only works on
 * `<input>`, `<textarea>`, or `[contenteditable]` elements.
 *
 * Strategy varies by browser:
 * - Chromium: Clipboard paste (ControlOrMeta+V) bypasses auto-closing
 *   brackets and reliably triggers Monaco's content-change handlers.
 *   Playwright 1.57 only accepts clipboard permissions on Chromium.
 * - Firefox/WebKit: Pastes via a temporary textarea + `execCommand('copy')`.
 *   Firefox and WebKit reject `clipboard-read` / `clipboard-write` grants.
 *
 * Why not keyboard.type() everywhere?
 * - Sends per-keystroke events and triggers Monaco auto-closing brackets/quotes,
 *   corrupting structured JSON/YAML.
 *
 * Empty string: select-all + Backspace (works reliably across all browsers).
 *
 * @param page  - The Playwright Page object
 * @param text  - The text to enter into the editor
 * @param editorLocator - Optional locator for the editor element. Defaults to
 *                        `page.getByRole('textbox', { name: 'Editor content' })`.
 */
export async function fillMonacoEditor(page: Page, text: string, editorLocator?: Locator) {
  const editor = editorLocator ?? page.getByRole('textbox', { name: 'Editor content' });
  const monacoEditor = editor
    .locator(
      'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " monaco-editor ")]'
    )
    .first();
  const editableSurface = monacoEditor.locator('.view-lines');

  await focusEditor(editableSurface, editor);
  await page.keyboard.press('ControlOrMeta+a');
  if (text === '') {
    await page.keyboard.press('Backspace');
    return;
  }

  const browserName = page.context().browser()?.browserType().name() || 'chromium';

  if (browserName === 'chromium') {
    const clipboardReady = await writeClipboard(page, text);
    if (!clipboardReady) {
      await focusEditor(editableSurface, editor);
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.insertText(text);
      await verifyEditorContent(editor, monacoEditor, text);
      return;
    }
  } else {
    // Firefox/WebKit: navigator.clipboard permissions are rejected by Playwright.
    // Workaround: copy via a temporary textarea + execCommand, then paste into Monaco.
    await page.evaluate((value: string) => {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }, text);
  }

  // Clipboard helpers can steal focus; restore Monaco selection before paste.
  await focusEditor(editableSurface, editor);
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('ControlOrMeta+v');

  await verifyEditorContent(editor, monacoEditor, text);
}

async function focusEditor(editableSurface: Locator, editor: Locator) {
  if ((await editableSurface.count()) > 0) {
    await editableSurface.first().click();
  } else {
    await editor.click({ force: true });
  }
}

async function writeClipboard(page: Page, text: string): Promise<boolean> {
  try {
    await page.context().grantPermissions([...CLIPBOARD_PERMISSIONS]);
  } catch {
    return false;
  }

  return page.evaluate(async (content) => {
    try {
      if (!navigator.clipboard?.writeText || !navigator.clipboard?.readText) {
        return false;
      }
      await navigator.clipboard.writeText(content);
      return (await navigator.clipboard.readText()) === content;
    } catch {
      return false;
    }
  }, text);
}

async function getMonacoModelValue(monacoEditor: Locator): Promise<string | undefined> {
  return monacoEditor.evaluate((el) => {
    const view = el.ownerDocument.defaultView as
      | (Window & {
          monaco?: {
            editor: {
              getEditors?: () => Array<{
                getDomNode: () => HTMLElement | null;
                getValue: () => string;
              }>;
              getModels?: () => Array<{
                uri: { toString: () => string };
                getValue: () => string;
              }>;
            };
          };
        })
      | null;
    if (!view) {
      return undefined;
    }
    const monaco = view.monaco;
    const editors = monaco?.editor?.getEditors?.() ?? [];
    for (const editor of editors) {
      const node = editor.getDomNode();
      if (node && (node === el || el.contains(node) || node.contains(el))) {
        return editor.getValue();
      }
    }

    const uri =
      el.getAttribute('data-uri') || el.querySelector('[data-uri]')?.getAttribute('data-uri');
    if (!uri) {
      return undefined;
    }
    const models = monaco?.editor?.getModels?.() ?? [];
    for (const model of models) {
      if (model.uri.toString() === uri) {
        return model.getValue();
      }
    }
    return undefined;
  });
}

async function getMonacoVisibleText(monacoEditor: Locator): Promise<string> {
  const lines = await monacoEditor.locator('.view-line').allTextContents();
  return lines.join('\n');
}

async function verifyEditorContent(
  editor: Locator,
  monacoEditor: Locator,
  text: string
): Promise<void> {
  const expected = text.trim();

  await expect(async () => {
    const modelValue = await getMonacoModelValue(monacoEditor);
    const ariaText = await editor.inputValue().catch(() => '');
    const textareaText = await monacoEditor
      .locator('textarea')
      .first()
      .inputValue()
      .catch(() => '');
    const candidates = [modelValue, ariaText, textareaText].filter(
      (value): value is string => typeof value === 'string' && value.length > 0
    );
    const expectedNormalized = normalizeForCompare(expected);
    const fullCandidate = candidates.find(
      (value) => normalizeForCompare(value).length >= expectedNormalized.length
    );

    if (fullCandidate !== undefined) {
      expect(editorContentMatches(fullCandidate, expected)).toBe(true);
      return;
    }

    // Viewport fallback: DataEditor enables word wrap and sizes height by
    // newline count, so compact JSON is one logical line in a ~33px editor.
    // Monaco then virtualizes wrapped view-lines; `.view-line` only has the
    // caret's viewport, not the full model. Used only when no complete
    // Monaco model/aria/textarea value is available.
    const visibleText = await getMonacoVisibleText(monacoEditor);
    const longest = [...candidates, visibleText].sort((a, b) => b.length - a.length)[0] ?? '';
    expect(viewportContentMatches(longest, expected)).toBe(true);
  }).toPass({ timeout: 5000 });
}

function editorContentMatches(actual: string, expected: string): boolean {
  const normalizedExpected = normalizeForCompare(expected);
  const normalizedActual = normalizeForCompare(actual);

  if (!normalizedExpected) {
    return normalizedActual.length === 0;
  }

  return normalizedActual === normalizedExpected;
}

function viewportContentMatches(actual: string, expected: string): boolean {
  const normalizedExpected = normalizeForCompare(expected);
  const normalizedActual = normalizeForCompare(actual);

  if (!normalizedExpected) {
    return normalizedActual.length === 0;
  }

  if (
    normalizedActual.includes(normalizedExpected) ||
    normalizedExpected.includes(normalizedActual)
  ) {
    return normalizedActual.length > 0;
  }

  return false;
}

function normalizeForCompare(value: string): string {
  return value.replace(/(?:\s|\u200b|\u200c|\u200d|\ufeff)+/g, '');
}
