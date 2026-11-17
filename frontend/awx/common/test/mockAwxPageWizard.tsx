import type { PageWizardStep } from '@ansible/ansible-ui-framework';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

type AwxBulkDialogOptions<T = unknown> = {
  items: T[];
  actionFn: (item: T) => void | Promise<void>;
  onComplete: () => void;
  onClose?: () => void;
};

export type GatewayRoleAssignmentPath = 'role_user_assignments' | 'role_team_assignments';

export function createGatewayRoleAssignmentPostHandler(
  posts: unknown[],
  pathFragment: GatewayRoleAssignmentPath
) {
  return http.post(
    ({ request }) => request.url.includes(pathFragment),
    async ({ request }) => {
      posts.push(await request.json());
      return HttpResponse.json({});
    }
  );
}

export function createAwxRoleAssignmentPostHandler(
  posts: unknown[],
  pathFragment: GatewayRoleAssignmentPath
) {
  return http.post(
    ({ request }) => request.url.includes(pathFragment) && request.url.includes('/api/v2/'),
    async ({ request }) => {
      posts.push(await request.json());
      return HttpResponse.json({});
    }
  );
}

export function installAwxBulkActionDialogMock() {
  awxPageWizardProgressDialog.mockImplementation((options: AwxBulkDialogOptions) => {
    void options.items
      .reduce<Promise<void>>(
        (chain, item) => chain.then(() => Promise.resolve(options.actionFn(item))),
        Promise.resolve()
      )
      .then(() => {
        options.onComplete();
      });
  });
}

export const awxPageWizardCapture: {
  onSubmit: ((data: unknown) => Promise<void>) | undefined;
  steps: PageWizardStep[];
} = {
  onSubmit: undefined,
  steps: [],
};

export const awxPageWizardProgressDialog = vi.fn();

export function createAwxPageWizardFrameworkMock(
  actual: typeof import('@ansible/ansible-ui-framework')
): typeof import('@ansible/ansible-ui-framework') {
  return {
    ...actual,
    PageWizard: <T,>(props: { onSubmit: (data: T) => Promise<void>; steps: PageWizardStep[] }) => {
      awxPageWizardCapture.onSubmit = props.onSubmit as typeof awxPageWizardCapture.onSubmit;
      awxPageWizardCapture.steps = props.steps;
      return <div data-testid="wizard-capture" />;
    },
  };
}
