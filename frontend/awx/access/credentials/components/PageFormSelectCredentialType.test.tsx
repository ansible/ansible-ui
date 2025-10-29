import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PageFormSelectCredentialType } from './PageFormSelectCredentialType';

// Mock the API module
vi.mock('../../../common/api/awx-utils', () => ({
  awxAPI: vi.fn((strings: TemplateStringsArray) => strings.join('')),
}));

// Mock the filters and columns hooks
vi.mock('../../credential-types/hooks/useCredentialTypesFilters', () => ({
  useCredentialTypesFilters: vi.fn(() => []),
}));

vi.mock('../../credential-types/hooks/useCredentialTypesColumns', () => ({
  useCredentialTypesColumns: vi.fn(() => [{ header: 'Name', cell: () => null }]),
}));

// Mock PageFormSingleSelectAwxResource
vi.mock('../../../common/PageFormSingleSelectAwxResource', () => ({
  PageFormSingleSelectAwxResource: vi.fn(
    ({
      label,
      placeholder,
      isRequired,
      isDisabled,
    }: {
      label: string;
      placeholder: string;
      isRequired?: boolean;
      isDisabled?: string;
    }) => (
      <div data-testid="credential-type-select">
        <label>{label}</label>
        <input
          placeholder={placeholder}
          required={isRequired}
          disabled={!!isDisabled}
          data-testid="select-input"
        />
      </div>
    )
  ),
}));

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('PageFormSelectCredentialType Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders with correct label', () => {
    render(
      <TestWrapper>
        <PageFormSelectCredentialType name="credential_type" />
      </TestWrapper>
    );

    expect(screen.getByText('Credential type')).toBeInTheDocument();
  });

  test('renders with placeholder text', () => {
    render(
      <TestWrapper>
        <PageFormSelectCredentialType name="credential_type" />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Select credential type')).toBeInTheDocument();
  });

  test('passes credential types API URL correctly', async () => {
    const { PageFormSingleSelectAwxResource } = await import(
      '../../../common/PageFormSingleSelectAwxResource'
    );

    render(
      <TestWrapper>
        <PageFormSelectCredentialType name="credential_type" />
      </TestWrapper>
    );

    const callArgs = vi.mocked(PageFormSingleSelectAwxResource).mock.calls[0]?.[0];
    expect(callArgs?.url).toContain('/credential_types/');
  });

  test('renders as disabled when isDisabled prop is provided', () => {
    render(
      <TestWrapper>
        <PageFormSelectCredentialType name="credential_type" isDisabled="You cannot edit this" />
      </TestWrapper>
    );

    const input = screen.getByTestId('select-input');
    expect(input).toBeDisabled();
  });

  test('includes credential types filters', async () => {
    const { useCredentialTypesFilters } = await import(
      '../../credential-types/hooks/useCredentialTypesFilters'
    );

    render(
      <TestWrapper>
        <PageFormSelectCredentialType name="credential_type" />
      </TestWrapper>
    );

    expect(vi.mocked(useCredentialTypesFilters)).toHaveBeenCalled();
  });

  test('includes loading placeholder text', async () => {
    const { PageFormSingleSelectAwxResource } = await import(
      '../../../common/PageFormSingleSelectAwxResource'
    );

    render(
      <TestWrapper>
        <PageFormSelectCredentialType name="credential_type" />
      </TestWrapper>
    );

    expect(vi.mocked(PageFormSingleSelectAwxResource)).toHaveBeenCalledWith(
      expect.objectContaining({
        queryPlaceholder: 'Loading credential types...',
      }),
      {}
    );
  });
});
