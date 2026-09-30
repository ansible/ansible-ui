import '@testing-library/jest-dom/vitest';
import { SwrTestWrapper } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  arrayBufferToBase64,
  readSubscriptionManifestAsBase64,
  subscriptionListToSelectOptions,
  SubscriptionWizard,
  subscriptionIdQueryLabel,
} from './SubscriptionWizard';

const mockRefreshAwxConfig = vi.hoisted(() => vi.fn());

vi.mock('@ansible/awx-ui/common/useAwxConfig', () => ({
  useAwxConfig: () => ({ eula: 'End User License Agreement text for testing.' }),
  useAwxConfigState: () => ({ refreshAwxConfig: mockRefreshAwxConfig }),
}));

const subscriptionsOptionsHandler = vi.fn(() =>
  HttpResponse.json({
    actions: {
      POST: {},
    },
  })
);

const server = setupServer(
  http.options(awxAPI`/config/subscriptions/`, subscriptionsOptionsHandler)
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockOnSuccess = vi.fn();

const defaultProps = {
  onSuccess: mockOnSuccess,
};

const renderWithRouter = (props = defaultProps) => {
  return render(
    <SwrTestWrapper>
      <MemoryRouter>
        <SubscriptionWizard {...props} />
      </MemoryRouter>
    </SwrTestWrapper>
  );
};

describe('readSubscriptionManifestAsBase64', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should reject when FileReader returns a non-ArrayBuffer result', async () => {
    class MockFileReader {
      result: string | ArrayBuffer = 'not-a-buffer';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsArrayBuffer() {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader);

    await expect(readSubscriptionManifestAsBase64(new File(['x'], 'manifest.zip'))).rejects.toThrow(
      'Subscription manifest could not be read.'
    );
  });
});

describe('subscriptionListToSelectOptions', () => {
  it('should return an empty list when subscriptions are missing', () => {
    expect(subscriptionListToSelectOptions(null, (key) => key)).toEqual([]);
  });
});

describe('arrayBufferToBase64', () => {
  it('should encode array buffers as base64', () => {
    const buffer = new Uint8Array([97, 98, 99]).buffer;
    expect(arrayBufferToBase64(buffer)).toBe(window.btoa('abc'));
  });
});

describe('subscriptionIdQueryLabel', () => {
  it('should stringify subscription ids for the async select', () => {
    expect(subscriptionIdQueryLabel('sub-123')).toBe('sub-123');
  });

  it('should return undefined when no subscription id is set', () => {
    expect(subscriptionIdQueryLabel(undefined)).toBeUndefined();
  });
});

describe('SubscriptionWizard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefreshAwxConfig.mockResolvedValue(undefined);
    subscriptionsOptionsHandler.mockImplementation(() =>
      HttpResponse.json({
        actions: {
          POST: {},
        },
      })
    );
  });

  describe('Wizard Structure', () => {
    it('should render review step after completing earlier wizard steps', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Subscription manifest' }));
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(
        fileInput,
        new File(['mock manifest content'], 'manifest.zip', { type: 'application/zip' })
      );

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(
        screen.getByRole('checkbox', { name: /I agree to the terms of the license agreement/i })
      );
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
      });
    }, 15000);

    it('should render wizard with proper navigation steps', () => {
      renderWithRouter();

      // Check that wizard navigation is present
      expect(screen.getByRole('navigation', { name: 'Steps' })).toBeInTheDocument();

      // Check that all three steps are present in navigation
      const navigation = screen.getByRole('navigation', { name: 'Steps' });
      expect(navigation).toHaveTextContent('Ansible Automation Platform Subscription');
      expect(navigation).toHaveTextContent('End User License Agreement');
      expect(navigation).toHaveTextContent('Review');

      // The first step should be marked as current
      const currentStep = screen.getByRole('button', {
        name: 'Ansible Automation Platform Subscription',
      });
      expect(currentStep).toHaveClass('pf-m-current');

      // Other steps should be disabled
      const licenseStep = screen.getByRole('button', { name: 'End User License Agreement' });
      const reviewStep = screen.getByRole('button', { name: 'Review' });

      expect(licenseStep).toBeDisabled();
      expect(reviewStep).toBeDisabled();

      // Check that the next, back, and cancel buttons are present
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  describe('Initial Content', () => {
    it('should display welcome content and instructions', () => {
      renderWithRouter();

      expect(
        screen.getByText('Welcome to Red Hat Ansible Automation Platform!')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Please complete the steps below to activate your subscription.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Select one of the following methods to add your subscription.')
      ).toBeInTheDocument();
    });

    it('should display trial subscription link', () => {
      renderWithRouter();

      const trialLink = screen.getByRole('link', { name: 'trial subscription' });
      expect(trialLink).toBeInTheDocument();
      expect(trialLink).toHaveAttribute('href', 'https://www.ansible.com/license');
    });
  });

  describe('Subscription Selection Options', () => {
    it('should render all 4 subscription toggle options', () => {
      renderWithRouter();

      // Verify all 4 toggle options exist
      expect(screen.getByRole('button', { name: 'Subscription manifest' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Service Account' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Username and Password' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Red Hat Satellite' })).toBeInTheDocument();
    });
  });

  describe('Subscription Manifest Form', () => {
    it('should display subscription allocations link when manifest is selected', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Subscription manifest' }));

      const allocationsLink = screen.getByRole('link', { name: 'subscription allocations' });
      expect(allocationsLink).toBeInTheDocument();
      expect(allocationsLink).toHaveAttribute(
        'href',
        'https://access.redhat.com/management/subscription_allocations'
      );
    });

    it('should validate subscription manifest form field', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Subscription manifest' }));

      // Find the file upload field by querying for file input type
      const fileUploadField = document.querySelector('input[type="file"]') as HTMLInputElement;

      expect(fileUploadField).toBeInTheDocument();
      // Note: File upload field may not show as required in the hidden input, but the component validates it

      // Create a mock file for testing
      const mockFile = new File(['test content'], 'test-manifest.zip', { type: 'application/zip' });

      // Upload the file
      await user.upload(fileUploadField, mockFile);

      // Verify the file was uploaded
      expect(fileUploadField.files?.[0]).toBe(mockFile);
    });

    it('should reject non-zip manifest files', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Subscription manifest' }));

      const fileUploadField = document.querySelector('input[type="file"]') as HTMLInputElement;
      const invalidFile = new File(['test content'], 'manifest.txt', { type: 'text/plain' });
      await user.upload(fileUploadField, invalidFile);

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() => {
        expect(screen.getByText('File must be a .zip file')).toBeInTheDocument();
      });
    });
  });

  describe('Service Account Form', () => {
    it('should display service account form with proper validation', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Service Account' }));

      expect(
        screen.getByText(/Provide your service account credentials below/)
      ).toBeInTheDocument();

      const consoleLink = screen.getByRole('link', { name: 'here on console.redhat.com' });
      expect(consoleLink).toBeInTheDocument();
      expect(consoleLink).toHaveAttribute(
        'href',
        'https://console.redhat.com/iam/service-accounts'
      );

      // Verify required form fields are present
      const clientIdField = await screen.findByRole('textbox', { name: 'Client ID' });
      const clientSecretField = document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;
      const subscriptionSelect = screen.getByRole('button', { name: 'Subscription' });

      expect(clientIdField).toBeInTheDocument();
      expect(clientSecretField).toBeInTheDocument();
      expect(subscriptionSelect).toBeInTheDocument();

      // Verify subscription select is disabled when credentials are empty
      expect(subscriptionSelect).toBeDisabled();

      // Fill in client ID and verify subscription select is still disabled
      await user.type(clientIdField, 'test-client-id');
      expect(subscriptionSelect).toBeDisabled();

      // Fill in client secret and verify subscription select becomes enabled
      await user.type(clientSecretField, 'test-client-secret');

      await waitFor(() => {
        expect(subscriptionSelect).toBeEnabled();
      });
    }, 10000);
  });

  describe('Username and Password Form', () => {
    it('should display username and password form with proper validation', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Username and Password' }));

      // Verify required form fields are present
      const usernameField = screen.getByRole('textbox', { name: 'Username' });
      const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;
      const subscriptionSelect = screen.getByRole('button', { name: 'Subscription' });

      expect(usernameField).toBeInTheDocument();
      expect(passwordField).toBeInTheDocument();
      expect(subscriptionSelect).toBeInTheDocument();

      // Verify subscription select is disabled when credentials are empty
      expect(subscriptionSelect).toBeDisabled();

      // Fill in username and verify subscription select is still disabled
      await user.type(usernameField, 'test-username');
      expect(subscriptionSelect).toBeDisabled();

      // Fill in password and verify subscription select becomes enabled
      await user.type(passwordField, 'test-password');

      await waitFor(() => {
        expect(subscriptionSelect).toBeEnabled();
      });
    }, 10000);
  });

  describe('Red Hat Satellite Form', () => {
    it('should display red hat satellite form with proper validation', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Red Hat Satellite' }));

      // Verify required form fields are present
      const satelliteUsernameField = screen.getByRole('textbox', {
        name: 'Red Hat Satellite username',
      });
      const satellitePasswordField = document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;
      const subscriptionSelect = screen.getByRole('button', { name: 'Subscription' });

      expect(satelliteUsernameField).toBeInTheDocument();
      expect(satellitePasswordField).toBeInTheDocument();
      expect(subscriptionSelect).toBeInTheDocument();

      // Verify subscription select is disabled when credentials are empty
      expect(subscriptionSelect).toBeDisabled();

      // Fill in satellite username and verify subscription select is still disabled
      await user.type(satelliteUsernameField, 'test-satellite-username');
      expect(subscriptionSelect).toBeDisabled();

      // Fill in satellite password and verify subscription select becomes enabled
      await user.type(satellitePasswordField, 'test-password');

      await waitFor(() => {
        expect(subscriptionSelect).toBeEnabled();
      });
    }, 10000);
  });

  describe('OPTIONS-driven credential validation', () => {
    const patternDescription = 'Client ID must be alphanumeric';
    const usernamePatternDescription = 'Username must be alphanumeric';

    beforeEach(() => {
      subscriptionsOptionsHandler.mockImplementation(() =>
        HttpResponse.json({
          actions: {
            POST: {
              subscriptions_client_id: {
                pattern: '^[a-zA-Z0-9_-]+$',
                pattern_description: patternDescription,
              },
              subscriptions_username: {
                pattern: '^[a-zA-Z0-9_-]+$',
                pattern_description: usernamePatternDescription,
              },
            },
          },
        })
      );
    });

    it('should show pattern description for invalid Client ID on blur', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(subscriptionsOptionsHandler).toHaveBeenCalled();
      });

      await user.click(screen.getByRole('button', { name: 'Service Account' }));

      const clientIdField = await screen.findByRole('textbox', { name: 'Client ID' });
      fireEvent.change(clientIdField, { target: { value: 'invalid@client' } });
      fireEvent.blur(clientIdField);

      await waitFor(() => {
        expect(screen.getByText(patternDescription)).toBeInTheDocument();
      });
    });

    it('should not show pattern error for valid Client ID on blur', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Service Account' }));

      const clientIdField = await screen.findByRole('textbox', { name: 'Client ID' });
      fireEvent.change(clientIdField, { target: { value: 'valid-client_01' } });
      fireEvent.blur(clientIdField);

      await waitFor(() => {
        expect(screen.queryByText(patternDescription)).not.toBeInTheDocument();
      });
    });

    it('should not show pattern error for valid Red Hat username on blur', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Username and Password' }));

      const usernameField = screen.getByRole('textbox', { name: 'Username' });
      fireEvent.change(usernameField, { target: { value: 'valid_user01' } });
      fireEvent.blur(usernameField);

      await waitFor(() => {
        expect(screen.queryByText(usernamePatternDescription)).not.toBeInTheDocument();
      });
    });

    it('should show pattern description for invalid Red Hat username on blur', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Username and Password' }));

      const usernameField = screen.getByRole('textbox', { name: 'Username' });
      fireEvent.change(usernameField, { target: { value: 'bad@user' } });
      fireEvent.blur(usernameField);

      await waitFor(() => {
        expect(screen.getByText(usernamePatternDescription)).toBeInTheDocument();
      });
    });

    it('should show pattern description for invalid Satellite username on blur', async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Red Hat Satellite' }));

      const satelliteUsernameField = screen.getByRole('textbox', {
        name: 'Red Hat Satellite username',
      });
      fireEvent.change(satelliteUsernameField, { target: { value: 'bad@satellite' } });
      fireEvent.blur(satelliteUsernameField);

      await waitFor(() => {
        expect(screen.getByText(usernamePatternDescription)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-enabling Insights Tracking', () => {
    it('should enable INSIGHTS_TRACKING_STATE when submitting satellite subscription', async () => {
      let patchedSettings: Record<string, unknown> | undefined;

      server.use(
        http.post('*/config/subscriptions/', () =>
          HttpResponse.json([
            {
              subscription_name: 'Satellite Subscription',
              subscription_id: 'sub-sat',
              instance_count: 5,
              license_date: Math.floor(Date.now() / 1000) + 86400,
            },
          ])
        ),
        http.post('*/config/attach/', () => HttpResponse.json({})),
        http.patch('*/settings/all/', async ({ request }) => {
          patchedSettings = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({});
        })
      );

      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Red Hat Satellite' }));

      await user.type(
        screen.getByRole('textbox', { name: 'Red Hat Satellite username' }),
        'sat-user'
      );
      await user.type(
        document.querySelector('input[type="password"]') as HTMLInputElement,
        'sat-pass'
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Subscription' })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: 'Subscription' }));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Satellite Subscription/ })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: /Satellite Subscription/ }));

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(
        screen.getByRole('checkbox', { name: /I agree to the terms of the license agreement/i })
      );
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(patchedSettings).toEqual({ INSIGHTS_TRACKING_STATE: true });
      });
    }, 30000);

    it('should enable INSIGHTS_TRACKING_STATE when submitting username subscription', async () => {
      let patchedSettings: Record<string, unknown> | undefined;

      server.use(
        http.post('*/config/subscriptions/', () =>
          HttpResponse.json([
            {
              subscription_name: 'Username Subscription',
              subscription_id: 'sub-user',
              instance_count: 10,
              license_date: Math.floor(Date.now() / 1000) + 86400,
            },
          ])
        ),
        http.post('*/config/attach/', () => HttpResponse.json({})),
        http.patch('*/settings/all/', async ({ request }) => {
          patchedSettings = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({});
        })
      );

      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Username and Password' }));

      await user.type(screen.getByRole('textbox', { name: 'Username' }), 'rh-user');
      await user.type(
        document.querySelector('input[type="password"]') as HTMLInputElement,
        'rh-pass'
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Subscription' })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: 'Subscription' }));
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Username Subscription/ })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('option', { name: /Username Subscription/ }));

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(
        screen.getByRole('checkbox', { name: /I agree to the terms of the license agreement/i })
      );
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(patchedSettings).toEqual({ INSIGHTS_TRACKING_STATE: true });
      });
    }, 30000);

    it('should enable INSIGHTS_TRACKING_STATE when submitting service account subscription', async () => {
      let patchedSettings: Record<string, unknown> | undefined;
      const events: string[] = [];

      mockRefreshAwxConfig.mockImplementation(async () => {
        events.push('refresh-start');
        await new Promise((resolve) => setTimeout(resolve, 0));
        events.push('refresh-complete');
      });
      mockOnSuccess.mockImplementation(() => events.push('success'));

      server.use(
        http.post('*/config/subscriptions/', () =>
          HttpResponse.json([
            {
              subscription_name: 'Test Subscription',
              subscription_id: 'sub-123',
              instance_count: 100,
              license_date: Math.floor(Date.now() / 1000) + 86400,
            },
          ])
        ),
        http.post('*/config/attach/', () => HttpResponse.json({})),
        http.patch('*/settings/all/', async ({ request }) => {
          patchedSettings = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({});
        })
      );

      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Service Account' }));

      const clientIdField = await screen.findByRole('textbox', { name: 'Client ID' });
      const clientSecretField = document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;
      await user.type(clientIdField, 'test-client-id');
      await user.type(clientSecretField, 'test-client-secret');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Subscription' })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: 'Subscription' }));

      await waitFor(() => {
        expect(screen.getByRole('option', { name: /Test Subscription/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: /Test Subscription/ }));

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() => {
        expect(
          screen.getByRole('checkbox', { name: /I agree to the terms of the license agreement/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('checkbox', { name: /I agree to the terms of the license agreement/i })
      );
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(events).toEqual(['refresh-start', 'refresh-complete', 'success']);
      });

      expect(patchedSettings).toEqual({ INSIGHTS_TRACKING_STATE: true });
    }, 30000);

    it('should not enable INSIGHTS_TRACKING_STATE when submitting manifest subscription', async () => {
      let patchCalled = false;
      const events: string[] = [];

      mockRefreshAwxConfig.mockImplementation(async () => {
        events.push('refresh-start');
        await new Promise((resolve) => setTimeout(resolve, 0));
        events.push('refresh-complete');
      });
      mockOnSuccess.mockImplementation(() => events.push('success'));

      server.use(
        http.post('*/config/', () => HttpResponse.json({})),
        http.patch('*/settings/all/', () => {
          patchCalled = true;
          return HttpResponse.json({});
        })
      );

      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Subscription manifest' }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['mock manifest content'], 'manifest.zip', {
        type: 'application/zip',
      });
      await user.upload(fileInput, file);

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() => {
        expect(
          screen.getByRole('checkbox', { name: /I agree to the terms of the license agreement/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('checkbox', { name: /I agree to the terms of the license agreement/i })
      );
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(events).toEqual(['refresh-start', 'refresh-complete', 'success']);
      });

      expect(patchCalled).toBe(false);
    }, 30000);

    it('should explain when the manifest upload succeeds but refresh fails', async () => {
      mockRefreshAwxConfig.mockRejectedValue(new Error('Refresh failed'));

      server.use(http.post('*/config/', () => HttpResponse.json({})));

      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole('button', { name: 'Subscription manifest' }));

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['mock manifest content'], 'manifest.zip', {
        type: 'application/zip',
      });
      await user.upload(fileInput, file);

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(
        screen.getByRole('checkbox', { name: /I agree to the terms of the license agreement/i })
      );
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(
          screen.getByText(
            'Subscription uploaded, but the subscription status could not be refreshed. Please try again.'
          )
        ).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    }, 30000);
  });
});
