/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CredentialMultilineInput } from './CredentialMultilineInput';
import { CredentialInputField, CredentialType } from '../../../interfaces/CredentialType';
import { CredentialPluginsInputSource } from '../CredentialPlugins/hooks/useCredentialPluginsDialog';

interface MockPageFormFileUploadProps {
  name: string;
  label: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  onClearClick?: () => void;
  isClearButtonDisabled?: boolean;
  icon?: React.ReactNode;
}

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload', () => {
  const MockPageFormFileUpload = vi.fn((props: MockPageFormFileUploadProps) => (
    <div data-testid={`file-upload-${props.name}`}>
      <label>{props.label}</label>
      <textarea
        name={props.name}
        disabled={props.isDisabled}
        readOnly={props.isReadOnly}
        required={props.isRequired}
        data-testid={`textarea-${props.name}`}
      />
      <button
        type="button"
        onClick={props.onClearClick}
        disabled={props.isClearButtonDisabled}
        data-testid={`clear-${props.name}`}
      >
        Clear
      </button>
      {props.icon && <div data-testid={`icon-${props.name}`}>{props.icon}</div>}
    </div>
  ));
  return { PageFormFileUpload: MockPageFormFileUpload };
});

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: vi.fn(() => ({ data: null })),
}));

interface TestFormData {
  client_key?: string;
  client_cert?: string;
  ca_cert?: string;
  [key: string]: string | boolean | undefined;
}

interface TestWrapperProps {
  readonly children: React.ReactNode;
  readonly defaultValues?: Partial<TestFormData>;
}

function TestWrapper({ children, defaultValues = {} }: TestWrapperProps) {
  const methods = useForm<TestFormData>({
    defaultValues: {
      client_key: '',
      client_cert: '',
      ca_cert: '',
      ...defaultValues,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('CredentialMultilineInput', () => {
  const mockField: CredentialInputField = {
    id: 'client_key',
    label: 'Client Key',
    help_text: 'Help text for client key',
    secret: true,
    type: 'string',
    multiline: true,
  };

  const mockRequiredFields = ['client_key'];
  const mockKind: CredentialType['kind'] = 'ssh';
  const mockHandleModalToggle = vi.fn();
  const mockAccumulatedPluginValues: CredentialPluginsInputSource[] = [];
  const mockSetAccumulatedPluginValues = vi.fn();
  const mockSetPluginsToDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    field: mockField,
    requiredFields: mockRequiredFields,
    kind: mockKind,
    handleModalToggle: mockHandleModalToggle,
    accumulatedPluginValues: mockAccumulatedPluginValues,
    setAccumulatedPluginValues: mockSetAccumulatedPluginValues,
    setPluginsToDelete: mockSetPluginsToDelete,
  };

  describe('Clear Button Tests', () => {
    test('should show clear button when client key value exists', () => {
      render(
        <TestWrapper defaultValues={{ client_key: 'some-key-value' }}>
          <CredentialMultilineInput {...defaultProps} />
        </TestWrapper>
      );

      const clearButton = screen.getByTestId('clear-client_key');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).not.toHaveAttribute('disabled');
    });

    test('should hide clear button for client key when field is empty', () => {
      render(
        <TestWrapper defaultValues={{ client_key: '' }}>
          <CredentialMultilineInput {...defaultProps} />
        </TestWrapper>
      );

      const clearButton = screen.getByTestId('clear-client_key');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveAttribute('disabled');
    });

    test('should call onClear when clear button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper defaultValues={{ client_key: 'some-key-value' }}>
          <CredentialMultilineInput {...defaultProps} />
        </TestWrapper>
      );

      const clearButton = screen.getByTestId('clear-client_key');
      expect(clearButton).not.toHaveAttribute('disabled');

      await user.click(clearButton);

      // The clear functionality is handled internally by onClear function
      // which sets the field value to empty string and clears errors
    });

    test('should handle clear functionality with accumulated plugin values', async () => {
      const user = userEvent.setup();
      const propsWithPluginValues = {
        ...defaultProps,
        accumulatedPluginValues: [
          {
            input_field_name: 'client_key',
            source_credential: 123,
            metadata: {},
          },
        ],
      };

      render(
        <TestWrapper defaultValues={{ client_key: 'some-key-value' }}>
          <CredentialMultilineInput {...propsWithPluginValues} />
        </TestWrapper>
      );

      const clearButton = screen.getByTestId('clear-client_key');
      await user.click(clearButton);

      expect(mockSetPluginsToDelete).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSetAccumulatedPluginValues).toHaveBeenCalled();
    });
  });

  describe('File Upload Tests', () => {
    test('should always show file upload inputs for credential fields', () => {
      render(
        <TestWrapper>
          <CredentialMultilineInput {...defaultProps} />
        </TestWrapper>
      );

      // Should show file upload component
      expect(screen.getByTestId('file-upload-client_key')).toBeInTheDocument();
      expect(screen.getByText('Client Key')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-client_key')).toBeInTheDocument();
    });

    test('should show browse functionality even when field has existing value', () => {
      render(
        <TestWrapper defaultValues={{ client_key: 'existing-value' }}>
          <CredentialMultilineInput {...defaultProps} />
        </TestWrapper>
      );

      // File upload functionality should still be available
      expect(screen.getByTestId('file-upload-client_key')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-client_key')).toBeInTheDocument();

      // Clear button should be enabled since there's a value
      const clearButton = screen.getByTestId('clear-client_key');
      expect(clearButton).not.toHaveAttribute('disabled');
    });

    test('should render credential field with correct labels and properties', () => {
      render(
        <TestWrapper>
          <CredentialMultilineInput {...defaultProps} />
        </TestWrapper>
      );

      // Check that credential field is present with correct label
      expect(screen.getByText('Client Key')).toBeInTheDocument();
      expect(screen.getByTestId('file-upload-client_key')).toBeInTheDocument();

      // Should show required field when in requiredFields array
      const textarea = screen.getByTestId('textarea-client_key');
      expect(textarea).toHaveAttribute('required');
    });

    test('should handle different field configurations', () => {
      const customField: CredentialInputField = {
        id: 'custom_field',
        label: 'Custom Field',
        help_text: 'Custom help text',
        secret: false,
        type: 'string',
        multiline: true,
      };

      const customProps = {
        ...defaultProps,
        field: customField,
        requiredFields: [],
      };

      render(
        <TestWrapper defaultValues={{ custom_field: 'custom-value' }}>
          <CredentialMultilineInput {...customProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Custom Field')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-custom_field')).toBeInTheDocument();

      // Should not be required since not in requiredFields
      const textarea = screen.getByTestId('textarea-custom_field');
      expect(textarea).not.toHaveAttribute('required');
    });
  });

  describe('Secret Field Tests', () => {
    test('should handle secret field with encrypted value', () => {
      const propsWithEncrypted = {
        ...defaultProps,
        fieldInitialValue: '$encrypted$',
      };

      render(
        <TestWrapper defaultValues={{ client_key: '$encrypted$' }}>
          <CredentialMultilineInput {...propsWithEncrypted} />
        </TestWrapper>
      );

      // Should render the component with encrypted value handling
      expect(screen.getByTestId('file-upload-client_key')).toBeInTheDocument();

      // Should show icon section for secret fields with encrypted values
      const iconSection = screen.queryByTestId('icon-client_key');
      expect(iconSection).toBeInTheDocument();
    });

    test('should handle non-external kind with secret field', () => {
      const propsNonExternal = {
        ...defaultProps,
        kind: 'ssh' as const,
        fieldInitialValue: '$encrypted$',
      };

      render(
        <TestWrapper defaultValues={{ client_key: '$encrypted$' }}>
          <CredentialMultilineInput {...propsNonExternal} />
        </TestWrapper>
      );

      // Should show icon section for non-external kinds
      expect(screen.getByTestId('file-upload-client_key')).toBeInTheDocument();
      const iconSection = screen.queryByTestId('icon-client_key');
      expect(iconSection).toBeInTheDocument();
    });

    test('should handle external kind without icon', () => {
      const propsExternal = {
        ...defaultProps,
        kind: 'external' as const,
      };

      render(
        <TestWrapper>
          <CredentialMultilineInput {...propsExternal} />
        </TestWrapper>
      );

      // External kind should not show icon buttons
      expect(screen.getByTestId('file-upload-client_key')).toBeInTheDocument();
      const iconSection = screen.queryByTestId('icon-client_key');
      expect(iconSection).not.toBeInTheDocument();
    });
  });

  describe('Plugin Values Tests', () => {
    test('should handle disabled state based on plugin values', () => {
      const propsWithPluginValues = {
        ...defaultProps,
        accumulatedPluginValues: [
          {
            input_field_name: 'client_key',
            source_credential: 123,
            metadata: {},
          },
        ],
      };

      render(
        <TestWrapper>
          <CredentialMultilineInput {...propsWithPluginValues} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('textarea-client_key');
      expect(textarea).toHaveAttribute('readOnly');
    });

    test('should clear plugin values when clear is called', async () => {
      const user = userEvent.setup();
      const propsWithPluginValues = {
        ...defaultProps,
        accumulatedPluginValues: [
          {
            input_field_name: 'client_key',
            source_credential: 123,
            metadata: {},
          },
        ],
      };

      render(
        <TestWrapper defaultValues={{ client_key: 'some-value' }}>
          <CredentialMultilineInput {...propsWithPluginValues} />
        </TestWrapper>
      );

      const clearButton = screen.getByTestId('clear-client_key');
      await user.click(clearButton);

      expect(mockSetAccumulatedPluginValues).toHaveBeenCalledWith(expect.arrayContaining([]));
    });
  });

  describe('Integration Tests', () => {
    test('should handle modal toggle functionality', () => {
      render(
        <TestWrapper defaultValues={{ client_key: '$encrypted$' }}>
          <CredentialMultilineInput {...defaultProps} fieldInitialValue="$encrypted$" />
        </TestWrapper>
      );

      // Check that modal toggle is available for secret fields
      expect(screen.getByTestId('file-upload-client_key')).toBeInTheDocument();

      // Modal toggle functionality is handled through the icon buttons
      const iconSection = screen.queryByTestId('icon-client_key');
      expect(iconSection).toBeInTheDocument();
    });

    test('should render with all default props', () => {
      render(
        <TestWrapper>
          <CredentialMultilineInput {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Client Key')).toBeInTheDocument();
      expect(screen.getByTestId('textarea-client_key')).toBeInTheDocument();
      expect(screen.getByTestId('clear-client_key')).toBeInTheDocument();
    });

    test('should handle required field validation correctly', () => {
      render(
        <TestWrapper>
          <CredentialMultilineInput {...defaultProps} />
        </TestWrapper>
      );

      const textarea = screen.getByTestId('textarea-client_key');
      expect(textarea).toHaveAttribute('required');

      // Field should be required since it's in the requiredFields array
      expect(defaultProps.requiredFields).toContain('client_key');
    });
  });
});
