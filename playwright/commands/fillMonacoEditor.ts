import { Locator, Page } from '@playwright/test';

/**
 * Fill a Monaco editor with the given text.
 *
 * Monaco 0.56+ uses a `native-edit-context` element that is NOT a standard
 * `<textarea>` or `[contenteditable]`. Playwright's `.fill()` only works on
 * `<input>`, `<textarea>`, or `[contenteditable]` elements.
 *
 * Strategy varies by browser:
 * - Chromium/Firefox: Clipboard paste (ControlOrMeta+V) bypasses auto-closing
 *   brackets and reliably triggers Monaco's content-change handlers.
 * - WebKit: Pastes via a temporary textarea (clipboard API is unavailable due
 *   to permission restrictions on non-Chromium browsers). The textarea is
 *   created, filled, copied to clipboard via JS, then pasted into Monaco.
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
  await editor.click({ force: true });
  await page.keyboard.press('ControlOrMeta+a');
  if (text === '') {
    await page.keyboard.press('Backspace');
    return;
  }

  const browserName = page.context().browser()?.browserType().name() || 'chromium';

  if (browserName === 'webkit') {
    // WebKit: navigator.clipboard is unavailable (permissions ignored on non-Chromium).
    // Workaround: copy via a temporary textarea + execCommand, then paste into Monaco.
    await page.evaluate((value: string) => {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }, text);
    // textarea.select() steals focus; restore Monaco focus and selection before paste.
    await editor.click({ force: true });
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.press('ControlOrMeta+v');
  } else {
    // Chromium/Firefox: Use navigator.clipboard to paste without per-keystroke events.
    await page.evaluate(async (value: string) => {
      await navigator.clipboard.writeText(value);
    }, text);
    await page.keyboard.press('ControlOrMeta+v');
  }
}
