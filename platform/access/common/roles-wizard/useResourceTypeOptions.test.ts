import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMapContentTypeToDisplayName } from '@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName';
import { useResourceTypeOptions } from './useResourceTypeOptions';

// Mock dependencies
vi.mock('@ansible/common-ui/crud/useGet');
vi.mock('@ansible/common-ui/access/hooks/useMapContentTypeToDisplayName');
vi.mock('@ansible/platform-ui/utils/gateway-api-utils', () => ({
  gatewayAPI: (strings: TemplateStringsArray) => strings[0],
}));

const mockUseGet = vi.mocked(useGet);
const mockUseMapContentTypeToDisplayName = vi.mocked(useMapContentTypeToDisplayName);

describe('useResourceTypeOptions', () => {
  const mockMapContentTypeToDisplayName = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMapContentTypeToDisplayName.mockReturnValue(mockMapContentTypeToDisplayName);
  });

  describe('Loading State', () => {
    it('should return loading state when data is being fetched', () => {
      mockUseGet.mockReturnValue({
        data: null,
        isLoading: true,
        error: undefined,
        refresh: vi.fn(),
      });

      const { result } = renderHook(() => useResourceTypeOptions());

      expect(result.current).toEqual({
        options: [],
        isLoading: true,
        error: undefined,
      });
    });
  });

  describe('Error State', () => {
    it('should return error when API call fails', () => {
      const mockError = new Error('API Error');

      mockUseGet.mockReturnValue({
        data: null,
        isLoading: false,
        error: mockError,
        refresh: vi.fn(),
      });

      const { result } = renderHook(() => useResourceTypeOptions());

      expect(result.current).toEqual({
        options: [],
        isLoading: false,
        error: mockError,
      });
    });
  });

  describe('Successful Data Processing', () => {
    const mockRoleTypesData = {
      results: [
        {
          api_slug: 'awx.jobtemplate',
          service: 'awx',
          model: 'jobtemplate',
          app_label: 'awx',
          parent_content_type: null,
          pk_field_type: 'integer',
        },
        {
          api_slug: 'awx.inventory',
          service: 'awx',
          model: 'inventory',
          app_label: 'awx',
          parent_content_type: null,
          pk_field_type: 'integer',
        },
        {
          api_slug: 'eda.project',
          service: 'eda',
          model: 'project',
          app_label: 'eda',
          parent_content_type: null,
          pk_field_type: 'integer',
        },
        {
          api_slug: 'galaxy.namespace',
          service: 'galaxy',
          model: 'namespace',
          app_label: 'galaxy',
          parent_content_type: null,
          pk_field_type: 'integer',
        },
        {
          api_slug: 'shared.organization',
          service: 'shared',
          model: 'organization',
          app_label: 'shared',
          parent_content_type: null,
          pk_field_type: 'integer',
        },
      ],
    };

    beforeEach(() => {
      mockUseGet.mockReturnValue({
        data: mockRoleTypesData,
        isLoading: false,
        error: undefined,
        refresh: vi.fn(),
      });

      // Mock the display name mapping
      mockMapContentTypeToDisplayName.mockImplementation((model: string) => {
        const mappings: Record<string, string> = {
          jobtemplate: 'Job Template',
          inventory: 'Inventory',
          project: 'Project',
          namespace: 'Namespace',
          organization: 'Organization',
          system: 'System',
        };
        return mappings[model] || model;
      });
    });

    it('should process and return correctly formatted options', () => {
      const { result } = renderHook(() => useResourceTypeOptions());

      expect(result.current.options).toHaveLength(5); // Excluding shared service, plus hardcoded System
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(undefined);

      // Check first option has correct structure
      expect(result.current.options[0]).toEqual({
        value: 'awx.inventory',
        label: 'Inventory',
        group: 'Automation Execution',
      });
    });

    it('should filter out shared service role types', () => {
      const { result } = renderHook(() => useResourceTypeOptions());

      const hasSharedService = result.current.options.some((option) =>
        option.value.includes('shared.')
      );
      expect(hasSharedService).toBe(false);
    });

    it('should only include allowed galaxy types', () => {
      const { result } = renderHook(() => useResourceTypeOptions());

      const galaxyOptions = result.current.options.filter((option) =>
        option.value.startsWith('galaxy.')
      );

      // Only galaxy.namespace should be included (it's in ALLOWED_GALAXY_TYPES)
      expect(galaxyOptions).toHaveLength(1);
      expect(galaxyOptions[0].value).toBe('galaxy.namespace');
    });

    it('should sort options alphabetically by label', () => {
      const { result } = renderHook(() => useResourceTypeOptions());

      // Check if options are sorted
      const labels = result.current.options.map((option) => option.label);
      const sortedLabels = [...labels].sort((a, b) => a.localeCompare(b));

      expect(labels).toEqual(sortedLabels);
    });

    it('should include hardcoded System option under Automation Content group', () => {
      const { result } = renderHook(() => useResourceTypeOptions());

      const systemOption = result.current.options.find((option) => option.value === 'system');
      expect(systemOption).toBeDefined();
      expect(systemOption?.label).toBe('System');
      expect(systemOption?.group).toBe('Automation Content');
    });

    it('should map services to correct display names', () => {
      const { result } = renderHook(() => useResourceTypeOptions());

      const awxOption = result.current.options.find((option) => option.value.startsWith('awx.'));
      const edaOption = result.current.options.find((option) => option.value.startsWith('eda.'));
      const galaxyOption = result.current.options.find((option) =>
        option.value.startsWith('galaxy.')
      );

      expect(awxOption?.group).toBe('Automation Execution');
      expect(edaOption?.group).toBe('Automation Decisions');
      expect(galaxyOption?.group).toBe('Automation Content');
    });
  });

  describe('Edge Cases', () => {
    it('should include hardcoded System option even with empty results array', () => {
      mockUseGet.mockReturnValue({
        data: { results: [] },
        isLoading: false,
        error: undefined,
        refresh: vi.fn(),
      });

      mockMapContentTypeToDisplayName.mockReturnValue('System');

      const { result } = renderHook(() => useResourceTypeOptions());

      expect(result.current.options).toHaveLength(1);
      expect(result.current.options[0]).toEqual({
        value: 'system',
        label: 'System',
        group: 'Automation Content',
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(undefined);
    });

    it('should handle null data', () => {
      mockUseGet.mockReturnValue({
        data: null,
        isLoading: false,
        error: undefined,
        refresh: vi.fn(),
      });

      const { result } = renderHook(() => useResourceTypeOptions());

      expect(result.current.options).toEqual([]);
    });

    it('should handle unknown service types', () => {
      mockUseGet.mockReturnValue({
        data: {
          results: [
            {
              api_slug: 'unknown.resource',
              service: 'unknown',
              model: 'resource',
              app_label: 'unknown',
              parent_content_type: null,
              pk_field_type: 'integer',
            },
          ],
        },
        isLoading: false,
        error: undefined,
        refresh: vi.fn(),
      });

      mockMapContentTypeToDisplayName.mockReturnValue('Resource');

      const { result } = renderHook(() => useResourceTypeOptions());

      expect(result.current.options).toHaveLength(2); // unknown + hardcoded System
      const unknownOption = result.current.options.find((o) => o.value === 'unknown.resource');
      expect(unknownOption?.group).toBe('unknown'); // Falls back to service name
    });
  });
});
