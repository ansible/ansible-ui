import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { hubAPI } from '../../common/api/formatPath';
import { Token } from './Token';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
  const FakeDataEditor = vi.fn((props: Record<string, string | (() => void)>) => (
    <textarea
      id={props.id as string}
      name={props.id as string}
      value={props.value as string}
      onChange={props.onChange as () => void}
      className={props.className as string}
      onFocus={props.onFocus as () => void}
      onBlur={props.onBlur as () => void}
    />
  ));
  return { DataEditor: FakeDataEditor };
});

const server = setupServer();

describe('Token Component', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render initial state with generate token warning and button', () => {
    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>
    );

    // Page header should be visible
    expect(screen.getByRole('heading', { name: 'API Token' })).toBeInTheDocument();

    // Generate token warning should be visible
    expect(screen.getByTestId('generate_token_warning')).toBeInTheDocument();
    expect(screen.getByTestId('generate_token_warning')).toHaveTextContent(
      'Generating a new token will delete your old token.'
    );

    // Generate token button should be visible and enabled
    const generateButton = screen.getByTestId('generate_token');
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).toHaveTextContent('Generate token');
    expect(generateButton).not.toBeDisabled();

    // Copy token warning and cell should not be visible
    expect(screen.queryByTestId('copy_token_warning')).not.toBeInTheDocument();
    expect(screen.queryByTestId('copy_token_cell')).not.toBeInTheDocument();
  });

  it('should disable button while API request is in progress', async () => {
    server.use(
      http.post(hubAPI`/v3/auth/token/`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ token: 'test-token-123' });
      })
    );

    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>
    );

    const generateButton = screen.getByTestId('generate_token');
    expect(generateButton).not.toBeDisabled();

    fireEvent.click(generateButton);

    // Button should be disabled during request
    await waitFor(() => {
      expect(generateButton).toBeDisabled();
    });

    // Wait for request to complete
    await waitFor(() => {
      expect(generateButton).not.toBeInTheDocument();
    });
  });

  it('should render token state after successful generation', async () => {
    const testToken = 'test-token-abc123xyz';

    server.use(
      http.post(hubAPI`/v3/auth/token/`, () => {
        return HttpResponse.json({ token: testToken });
      })
    );

    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>
    );

    const generateButton = screen.getByTestId('generate_token');
    fireEvent.click(generateButton);

    // Wait for token to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('copy_token_warning')).toBeInTheDocument();
    });

    // Copy token warning should be visible
    expect(screen.getByTestId('copy_token_warning')).toHaveTextContent(
      'Copy this token now. This is the only time you will ever see it.'
    );

    // Token should be displayed
    expect(screen.getByText(testToken)).toBeInTheDocument();

    // Generate token button and warning should not be visible
    expect(screen.queryByTestId('generate_token')).not.toBeInTheDocument();
    expect(screen.queryByTestId('generate_token_warning')).not.toBeInTheDocument();
  });

  it('should display error message when API request fails', async () => {
    server.use(
      http.post(hubAPI`/v3/auth/token/`, () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
      })
    );

    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>
    );

    const generateButton = screen.getByTestId('generate_token');
    fireEvent.click(generateButton);

    // Wait for error to be displayed (HTTP 500 shows status text)
    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });

    // Generate button should still be visible and enabled after error
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).not.toBeDisabled();

    // Copy token warning should not be displayed
    expect(screen.queryByTestId('copy_token_warning')).not.toBeInTheDocument();
  });

  it('should display error for network failures', async () => {
    // Network error or other non-HTTP error
    server.use(
      http.post(hubAPI`/v3/auth/token/`, () => {
        return HttpResponse.error();
      })
    );

    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>
    );

    const generateButton = screen.getByTestId('generate_token');
    fireEvent.click(generateButton);

    // Wait for error to be displayed (network errors show as "Failed to fetch")
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });

    expect(generateButton).toBeInTheDocument();
    expect(generateButton).not.toBeDisabled();
  });

  it('should call correct API endpoint', async () => {
    const testToken = 'test-token';
    let requestMade = false;

    server.use(
      http.post(hubAPI`/v3/auth/token/`, async ({ request }) => {
        requestMade = true;
        const body = await request.json();
        // Verify the request body is empty object
        expect(body).toEqual({});
        return HttpResponse.json({ token: testToken });
      })
    );

    render(
      <MemoryRouter>
        <Token />
      </MemoryRouter>
    );

    const generateButton = screen.getByTestId('generate_token');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(requestMade).toBe(true);
    });

    // Verify token was displayed (confirms request succeeded)
    await waitFor(() => {
      expect(screen.getByText(testToken)).toBeInTheDocument();
    });
  });
});
