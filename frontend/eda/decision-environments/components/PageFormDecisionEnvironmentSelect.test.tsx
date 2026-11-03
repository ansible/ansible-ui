/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PageDialogProvider } from '@ansible/ansible-ui-framework/PageDialogs/PageDialog';
import { PageFormDecisionEnvironmentSelect } from './PageFormDecisionEnvironmentSelect';

const server = setupServer(
  http.get(/decision-environments/, () =>
    HttpResponse.json({
      count: 1,
      results: [{ id: 4, name: 'Default DE', description: 'Primary' }],
    })
  )
);

function Wrapper() {
  const methods = useForm({
    defaultValues: { decision_environment_id: undefined as number | undefined },
  });
  return (
    <MemoryRouter>
      <PageDialogProvider>
        <FormProvider {...methods}>
          <PageFormDecisionEnvironmentSelect name="decision_environment_id" isRequired />
        </FormProvider>
      </PageDialogProvider>
    </MemoryRouter>
  );
}

describe('PageFormDecisionEnvironmentSelect', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should load decision environment options', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    expect(screen.getByText('Decision environment')).toBeInTheDocument();
    await user.click(screen.getByText('Select decision environment'));
    await waitFor(() => {
      expect(screen.getAllByText('Default DE').length).toBeGreaterThan(0);
    });
  });
});
