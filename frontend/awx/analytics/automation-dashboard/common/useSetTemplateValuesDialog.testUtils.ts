/**
 * Helpers for tests that drive the "Set template default values" dialog, shared by the hook tests and
 * the `DashboardMainTableCard` integration tests.
 */
import { screen, within } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { SetupServer } from 'msw/node';

type User = ReturnType<typeof userEvent.setup>;

/** Mocks the bulk PATCH of all templates and returns the request bodies it receives. */
export function mockBulkPatch(
  server: SetupServer,
  respond: () => Response | Promise<Response> = () => HttpResponse.json({ updated: 3 })
) {
  const bodies: unknown[] = [];
  server.use(
    http.patch(/template_metadata\/$/, async ({ request }) => {
      bodies.push(await request.json().catch(() => null));
      return respond();
    })
  );
  return bodies;
}

/** Default values served by the defaults endpoint when a test does not set its own. */
export const TEMPLATE_DEFAULTS = {
  time_taken_manually_execute_minutes: 60,
  time_taken_create_automation_minutes: 120,
};

/** Handler for the defaults endpoint the dialog loads when it opens. */
export function templateDefaultsHandler(
  respond: () => Response | Promise<Response> = () => HttpResponse.json(TEMPLATE_DEFAULTS)
) {
  return http.get(/template_metadata\/defaults\/$/, respond);
}

/** Finds the dialog once the default values are loaded and the fields are shown. */
export async function findSetTemplateValuesDialog() {
  const dialog = await screen.findByRole('dialog', { name: 'Set template default values' });
  await within(dialog).findByRole('spinbutton', { name: /Time taken to manually execute/ });
  return dialog;
}

/** Replaces the value of a field, which may be prefilled with a default value. */
export async function replaceFieldValue(user: User, field: HTMLElement, value: string) {
  await user.clear(field);
  if (value) await user.type(field, value);
}

export async function fillSetTemplateValuesDialog(
  user: User,
  dialog: HTMLElement,
  values: { manual: string; create: string },
  confirm = true
) {
  await replaceFieldValue(
    user,
    within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ }),
    values.manual
  );
  await replaceFieldValue(
    user,
    within(dialog).getByRole('spinbutton', { name: /Time taken to create automation/ }),
    values.create
  );
  if (confirm) {
    await user.click(within(dialog).getByRole('checkbox', { name: /Yes, I confirm/ }));
  }
}

export async function clickApply(user: User, dialog: HTMLElement) {
  await user.click(within(dialog).getByRole('button', { name: 'Apply to templates' }));
}
