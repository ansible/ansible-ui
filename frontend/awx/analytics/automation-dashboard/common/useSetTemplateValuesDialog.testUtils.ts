/**
 * Helpers for tests that drive the "Set template values" dialog, shared by the hook tests and
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

export function findSetTemplateValuesDialog() {
  return screen.findByRole('dialog', { name: 'Set template values' });
}

export async function fillSetTemplateValuesDialog(
  user: User,
  dialog: HTMLElement,
  values: { manual: string; create: string },
  confirm = true
) {
  await user.type(
    within(dialog).getByRole('spinbutton', { name: /Time taken to manually execute/ }),
    values.manual
  );
  await user.type(
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
