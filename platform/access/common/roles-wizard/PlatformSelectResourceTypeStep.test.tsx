import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformSelectResourceTypeStep } from './PlatformSelectResourceTypeStep';
import { useResourceTypeOptions } from './useResourceTypeOptions';
import { useResourceTypeWizard } from './useResourceTypeWizard';

vi.mock('./useResourceTypeOptions');
vi.mock('./useResourceTypeWizard');

const mockUseResourceTypeOptions = vi.mocked(useResourceTypeOptions);
const mockUseResourceTypeWizard = vi.mocked(useResourceTypeWizard);

describe('PlatformSelectResourceTypeStep', () => {
  const mockHandleResourceTypeSelection = vi.fn();
  const mockHandleClearSelection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseResourceTypeWizard.mockReturnValue({
      resourceType: undefined,
      handleResourceTypeSelection: mockHandleResourceTypeSelection,
      handleClearSelection: mockHandleClearSelection,
    });
  });

  describe('Loading State', () => {
    it('should show loading page when isLoading is true', () => {
      mockUseResourceTypeOptions.mockReturnValue({
        options: [],
        isLoading: true,
        error: undefined,
      });

      render(<PlatformSelectResourceTypeStep />);

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error component when error exists', () => {
      const mockError = new Error('Failed to load resource types');

      mockUseResourceTypeOptions.mockReturnValue({
        options: [],
        isLoading: false,
        error: mockError,
      });

      render(<PlatformSelectResourceTypeStep />);

      expect(screen.getByText('Failed to load resource types')).toBeInTheDocument();
    });
  });

  describe('Successful Rendering', () => {
    const mockOptions = [
      {
        value: 'awx.jobtemplate',
        label: 'Job Template',
        group: 'Automation Execution',
      },
      {
        value: 'awx.inventory',
        label: 'Inventory',
        group: 'Automation Execution',
      },
      {
        value: 'galaxy.namespace',
        label: 'Namespace',
        group: 'Automation Content',
      },
    ];

    beforeEach(() => {
      mockUseResourceTypeOptions.mockReturnValue({
        options: mockOptions,
        isLoading: false,
        error: undefined,
      });
    });

    it('should render the component with title and form when data is loaded', () => {
      render(<PlatformSelectResourceTypeStep />);

      expect(screen.getByText('Select a resource type')).toBeInTheDocument();

      expect(screen.getByText('Resource type')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render the resource type input', () => {
      render(<PlatformSelectResourceTypeStep />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('Select a resource type')).toBeInTheDocument();
    });

    it('should display the selected value when resourceType is set', () => {
      mockUseResourceTypeWizard.mockReturnValue({
        resourceType: 'awx.jobtemplate',
        handleResourceTypeSelection: mockHandleResourceTypeSelection,
        handleClearSelection: mockHandleClearSelection,
      });

      render(<PlatformSelectResourceTypeStep />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Job Template');
    });
  });

  describe('User Interactions', () => {
    const mockOptions = [
      {
        value: 'awx.jobtemplate',
        label: 'Job Template',
        group: 'Automation Execution',
      },
      {
        value: 'awx.inventory',
        label: 'Inventory',
        group: 'Automation Execution',
      },
    ];

    beforeEach(() => {
      mockUseResourceTypeOptions.mockReturnValue({
        options: mockOptions,
        isLoading: false,
        error: undefined,
      });
    });

    it('should call handleResourceTypeSelection when a resource type is selected', () => {
      render(<PlatformSelectResourceTypeStep />);

      const typeahead = screen.getByRole('textbox');
      fireEvent.click(typeahead);
      fireEvent.click(screen.getByText('Job Template'));

      expect(mockHandleResourceTypeSelection).toHaveBeenCalledWith('awx.jobtemplate');
    });

    it('should call handleClearSelection when clear button is clicked', async () => {
      mockUseResourceTypeWizard.mockReturnValue({
        resourceType: 'awx.jobtemplate',
        handleResourceTypeSelection: mockHandleResourceTypeSelection,
        handleClearSelection: mockHandleClearSelection,
      });

      render(<PlatformSelectResourceTypeStep />);

      const clearButton = screen.getByRole('button', { name: /clear input value/i });

      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockHandleClearSelection).toHaveBeenCalledTimes(1);
      });
    });

    it('should call handleResourceTypeSelection with correct value', async () => {
      render(<PlatformSelectResourceTypeStep />);

      const input = screen.getByRole('textbox');

      // Open dropdown and select an option
      fireEvent.click(input);

      await waitFor(() => {
        expect(screen.getByText('Job Template')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Job Template'));

      expect(mockHandleResourceTypeSelection).toHaveBeenCalledWith('awx.jobtemplate');
      expect(mockHandleResourceTypeSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('System Resource Type', () => {
    it('should display System option in the dropdown', () => {
      const mockOptions = [
        {
          value: 'galaxy.namespace',
          label: 'Namespace',
          group: 'Automation Content',
        },
        {
          value: 'system',
          label: 'System',
          group: 'Automation Content',
        },
      ];

      mockUseResourceTypeOptions.mockReturnValue({
        options: mockOptions,
        isLoading: false,
        error: undefined,
      });

      render(<PlatformSelectResourceTypeStep />);

      const typeahead = screen.getByRole('textbox');
      fireEvent.click(typeahead);

      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should call handleResourceTypeSelection with system when System is selected', () => {
      const mockOptions = [
        {
          value: 'system',
          label: 'System',
          group: 'Automation Content',
        },
      ];

      mockUseResourceTypeOptions.mockReturnValue({
        options: mockOptions,
        isLoading: false,
        error: undefined,
      });

      render(<PlatformSelectResourceTypeStep />);

      const typeahead = screen.getByRole('textbox');
      fireEvent.click(typeahead);
      fireEvent.click(screen.getByText('System'));

      expect(mockHandleResourceTypeSelection).toHaveBeenCalledWith('system');
    });

    it('should display System as selected value when resourceType is system', () => {
      mockUseResourceTypeOptions.mockReturnValue({
        options: [
          {
            value: 'system',
            label: 'System',
            group: 'Automation Content',
          },
        ],
        isLoading: false,
        error: undefined,
      });

      mockUseResourceTypeWizard.mockReturnValue({
        resourceType: 'system',
        handleResourceTypeSelection: mockHandleResourceTypeSelection,
        handleClearSelection: mockHandleClearSelection,
      });

      render(<PlatformSelectResourceTypeStep />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('System');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      mockUseResourceTypeOptions.mockReturnValue({
        options: [],
        isLoading: false,
        error: undefined,
      });

      render(<PlatformSelectResourceTypeStep />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('Resource type')).toBeInTheDocument();
    });

    it('should handle null resourceType gracefully', () => {
      mockUseResourceTypeWizard.mockReturnValue({
        resourceType: null as unknown as string,
        handleResourceTypeSelection: mockHandleResourceTypeSelection,
        handleClearSelection: mockHandleClearSelection,
      });

      mockUseResourceTypeOptions.mockReturnValue({
        options: [
          {
            value: 'awx.jobtemplate',
            label: 'Job Template',
            group: 'Automation Execution',
          },
        ],
        isLoading: false,
        error: undefined,
      });

      render(<PlatformSelectResourceTypeStep />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to FormGroupSingleSelectTypeAhead', () => {
      const mockOptions = [
        {
          value: 'awx.jobtemplate',
          label: 'Job Template',
          group: 'Automation Execution',
        },
      ];

      mockUseResourceTypeOptions.mockReturnValue({
        options: mockOptions,
        isLoading: false,
        error: undefined,
      });

      mockUseResourceTypeWizard.mockReturnValue({
        resourceType: 'awx.jobtemplate',
        handleResourceTypeSelection: mockHandleResourceTypeSelection,
        handleClearSelection: mockHandleClearSelection,
      });

      render(<PlatformSelectResourceTypeStep />);

      const input = screen.getByRole('textbox');

      expect(input).toHaveValue('Job Template');

      // Check that the form shows required indicator (asterisk)
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });
});
