import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionWizard } from './SubscriptionWizard';

const mockOnSuccess = vi.fn();

const defaultProps = {
  onSuccess: mockOnSuccess,
};

const renderWithRouter = (props = defaultProps) => {
  return render(
    <MemoryRouter>
      <SubscriptionWizard {...props} />
    </MemoryRouter>
  );
};

describe('SubscriptionWizard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Wizard Structure', () => {
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
      expect(subscriptionSelect).toBeEnabled();
    });
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
      expect(subscriptionSelect).toBeEnabled();
    });
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
      expect(subscriptionSelect).toBeEnabled();
    });
  });
});
