import { Locator, Page } from '@playwright/test';

/**
 * Fill a Monaco editor with the given text.
 *
 * Monaco 0.56+ uses a `native-edit-context` element that is NOT a standard
 * `<textarea>` or `[contenteditable]`. Playwright's `.fill()` only works on
 * `<input>`, `<textarea>`, or `[contenteditable]` elements.
 *
 * Clipboard paste (Ctrl+V) is used instead of `keyboard.type()` or
 * `keyboard.insertText()`:
 * - `type()` sends per-keystroke events and triggers Monaco auto-closing
 *   brackets/quotes, which corrupts structured JSON/YAML.
 * - `insertText()` dispatches only an `input` event and may not update the
 *   Monaco model / form value when native-edit-context is enabled.
 * Paste inserts the whole string, bypasses auto-closing, and fires Monaco's
 * content-change handlers so React Hook Form stays in sync.
 *
 * Empty string: select-all + Backspace. Pasting or inserting `''` does not
 * reliably clear the current selection.
 *
 * @param page  - The Playwright Page object
 * @param text  - The text to enter into the editor
 * @param editorLocator - Optional locator for the editor element. Defaults to
 *                        `page.getByRole('textbox', { name: 'Editor content' })`.
 */
export async function fillMonacoEditor(page: Page, text: string, editorLocator?: Locator) {
  const editor = editorLocator ?? page.getByRole('textbox', { name: 'Editor content' });
  await editor.click({ force: true });
  await page.keyboard.press('Control+a');
  if (text === '') {
    await page.keyboard.press('Backspace');
    return;
  }
  await page.evaluate(async (value: string) => {
    await navigator.clipboard.writeText(value);
  }, text);
  await page.keyboard.press('Control+v');
}
