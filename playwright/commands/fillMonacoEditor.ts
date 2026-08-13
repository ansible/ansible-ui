import { Locator, Page } from '@playwright/test';

/**
 * Fill a Monaco editor with the given text.
 *
 * Monaco 0.56+ uses a `native-edit-context` element that is NOT a standard
 * `<textarea>` or `[contenteditable]`. Playwright's `.fill()` only works on
 * `<input>`, `<textarea>`, or `[contenteditable]` elements.
 *
 * We use clipboard paste (Ctrl+V) which reliably inserts content into Monaco
 * without triggering auto-pairing of brackets/quotes (which corrupts JSON)
 * and properly fires Monaco's content change events (unlike insertText which
 * may not trigger the form value update).
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
  await page.evaluate(async (value: string) => {
    await navigator.clipboard.writeText(value);
  }, text);
  await page.keyboard.press('Control+v');
}
