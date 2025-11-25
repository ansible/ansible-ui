import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PageFormInventorySelect } from './PageFormInventorySelect';

// Mock the API module
vi.mock('../../../common/api/awx-utils', () => ({
  awxAPI: vi.fn((strings: TemplateStringsArray) => strings.join('')),
}));

// Mock the filters and columns hooks
vi.mock('../hooks/useInventoriesFilters', () => ({
  useInventoriesFilters: vi.fn(() => []),
}));

vi.mock('../hooks/useInventoriesColumns', () => ({
  useInventoriesColumns: vi.fn(() => [{ header: 'Name', cell: () => null }]),
}));

// Mock PageFormSingleSelectAwxResource
vi.mock('../../../common/PageFormSingleSelectAwxResource', () => ({
  PageFormSingleSelectAwxResource: vi.fn(
    ({
      label,
      placeholder,
      isRequired,
      isDisabled,
      url,
    }: {
      label: string;
      placeholder: string;
      isRequired?: boolean;
      isDisabled?: string;
      url: string;
    }) => (
      <div data-testid="inventory-select-component">
        <label>{label}</label>
        <input
          placeholder={placeholder}
          required={isRequired}
          disabled={!!isDisabled}
          data-testid="select-input"
          data-url={url}
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

describe('PageFormInventorySelect Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render with correct label', () => {
    render(
      <TestWrapper>
        <PageFormInventorySelect name="inventory" />
      </TestWrapper>
    );

    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  test('should render with placeholder text', () => {
    render(
      <TestWrapper>
        <PageFormInventorySelect name="inventory" />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Select inventory')).toBeInTheDocument();
  });

  test('should use default URL without isNotConstructedInventory prop', async () => {
    const { PageFormSingleSelectAwxResource } = await import(
      '../../../common/PageFormSingleSelectAwxResource'
    );

    render(
      <TestWrapper>
        <PageFormInventorySelect name="inventory" />
      </TestWrapper>
    );

    const callArgs = vi.mocked(PageFormSingleSelectAwxResource).mock.calls[0]?.[0];
    expect(callArgs?.url).toBe('/inventories/');
  });

  test('should use filtered URL when isNotConstructedInventory is true', async () => {
    const { PageFormSingleSelectAwxResource } = await import(
      '../../../common/PageFormSingleSelectAwxResource'
    );

    render(
      <TestWrapper>
        <PageFormInventorySelect name="inventory" isNotConstructedInventory={true} />
      </TestWrapper>
    );

    const callArgs = vi.mocked(PageFormSingleSelectAwxResource).mock.calls[0]?.[0];
    expect(callArgs?.url).toBe('/inventories/?not__kind=constructed');
  });

  test('should use default URL when isNotConstructedInventory is false', async () => {
    const { PageFormSingleSelectAwxResource } = await import(
      '../../../common/PageFormSingleSelectAwxResource'
    );

    render(
      <TestWrapper>
        <PageFormInventorySelect name="inventory" isNotConstructedInventory={false} />
      </TestWrapper>
    );

    const callArgs = vi.mocked(PageFormSingleSelectAwxResource).mock.calls[0]?.[0];
    expect(callArgs?.url).toBe('/inventories/');
  });

  test('should render as disabled when isDisabled prop is provided', () => {
    render(
      <TestWrapper>
        <PageFormInventorySelect name="inventory" isDisabled="You cannot edit this" />
      </TestWrapper>
    );

    const input = screen.getByTestId('select-input');
    expect(input).toBeDisabled();
  });

  test('should include inventories filters', async () => {
    const { useInventoriesFilters } = await import('../hooks/useInventoriesFilters');

    render(
      <TestWrapper>
        <PageFormInventorySelect name="inventory" />
      </TestWrapper>
    );

    expect(vi.mocked(useInventoriesFilters)).toHaveBeenCalled();
  });

  test('should include loading placeholder text', async () => {
    const { PageFormSingleSelectAwxResource } = await import(
      '../../../common/PageFormSingleSelectAwxResource'
    );

    render(
      <TestWrapper>
        <PageFormInventorySelect name="inventory" />
      </TestWrapper>
    );

    expect(vi.mocked(PageFormSingleSelectAwxResource)).toHaveBeenCalledWith(
      expect.objectContaining({
        queryPlaceholder: 'Loading inventories...',
      }),
      {}
    );
  });
});
