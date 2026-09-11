import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../common/api/awx-utils';
import { AwxPageForm } from './AwxPageForm';

const server = setupServer(
  http.options(awxAPI`/inventories/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          name: {
            pattern: '^[a-zA-Z0-9_-]+$',
            pattern_description: 'Letters, numbers, underscores, and hyphens only',
          },
        },
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxPageForm', () => {
  it('should render with minimal props', () => {
    render(
      <AwxPageForm submitText="Save" onSubmit={async () => {}} onCancel={() => {}}>
        <div data-testid="child-content" />
      </AwxPageForm>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render submit button with provided text', () => {
    render(<AwxPageForm submitText="Submit Form" onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole('button', { name: 'Submit Form' })).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(<AwxPageForm submitText="Save" onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should call onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => {});

    render(<AwxPageForm submitText="Save" onSubmit={onSubmit} onCancel={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<AwxPageForm submitText="Save" onSubmit={async () => {}} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should fetch OPTIONS from optionsUrl and apply pattern validation', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AwxPageForm
        submitText="Save"
        onSubmit={onSubmit}
        onCancel={() => {}}
        defaultValue={{ name: '' }}
        optionsUrl={awxAPI`/inventories/`}
      >
        <PageFormTextInput name="name" label="Name" />
      </AwxPageForm>
    );

    const input = screen.getByLabelText('Name');
    await user.type(input, 'invalid@name');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Letters, numbers, underscores, and hyphens only')
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should prefer explicit optionsData over optionsUrl', async () => {
    const onSubmit = vi.fn();

    render(
      <AwxPageForm
        submitText="Save"
        onSubmit={onSubmit}
        onCancel={() => {}}
        defaultValue={{ name: 'valid-name' }}
        optionsUrl={awxAPI`/inventories/`}
        optionsData={{
          actions: {
            POST: {
              name: {
                pattern: '^[a-z]+$',
                pattern_description: 'Lowercase letters only',
              },
            },
          },
        }}
      >
        <PageFormTextInput name="name" label="Name" />
      </AwxPageForm>
    );

    expect(screen.getByLabelText('Name')).toHaveValue('valid-name');
  });
});
