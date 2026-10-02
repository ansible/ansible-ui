import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGatewaySettingsCategories } from './GatewaySettingsCategories';
import { GatewaySettingsOption } from './GatewaySettingOptions';

describe('useGatewaySettingsCategories', () => {
  // Arrange - sample options for testing
  const sampleOptions: Record<string, GatewaySettingsOption> = {
    gateway_proxy_url: {
      type: 'string',
      label: 'Gateway Proxy URL',
      help_text: 'Proxy URL for gateway',
      required: false,
      read_only: false,
      default: '',
    },
    SESSION_COOKIE_AGE: {
      type: 'integer',
      label: 'Session Cookie Age',
      help_text: 'Age of session cookie in seconds',
      required: false,
      read_only: false,
      default: 0,
    },
    password_min_length: {
      type: 'integer',
      label: 'Minimum Password Length',
      help_text: 'Minimum length for passwords',
      required: false,
      read_only: false,
      default: 0,
    },
    custom_login_info: {
      type: 'string',
      label: 'Custom Login Info',
      help_text: 'Custom login information text',
      required: false,
      read_only: false,
      default: '',
    },
    unknown_option: {
      type: 'string',
      label: 'Unknown Option',
      help_text: 'An option not in any category',
      required: false,
      read_only: false,
      default: '',
    },
  };

  it('should return platform category with title and description', () => {
    // Act
    const { result } = renderHook(() => useGatewaySettingsCategories({}));

    // Assert
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('platform');
    expect(result.current[0].title).toBe('Platform gateway settings');
    expect(result.current[0].description).toBeDefined();
    expect(result.current[0].description).toContain('Configure and manage platform gateway');
  });

  it('should have defined sections for platform category with options', () => {
    // Act
    const { result } = renderHook(() => useGatewaySettingsCategories(sampleOptions));

    // Assert
    const platformCategory = result.current[0];
    expect(platformCategory.sections).toBeDefined();
    expect(platformCategory.sections.length).toBeGreaterThan(0);
  });

  it('should organize options into correct sections', () => {
    // Act
    const { result } = renderHook(() => useGatewaySettingsCategories(sampleOptions));

    // Assert
    const platformCategory = result.current[0];
    const platformGatewaySection = platformCategory.sections.find(
      (s) => s.title === 'Platform gateway'
    );
    const sessionSection = platformCategory.sections.find((s) => s.title === 'Session');
    const passwordSection = platformCategory.sections.find((s) => s.title === 'Password Security');
    const customLoginSection = platformCategory.sections.find((s) => s.title === 'Custom Login');

    expect(platformGatewaySection?.options.gateway_proxy_url).toBeDefined();
    expect(sessionSection?.options.SESSION_COOKIE_AGE).toBeDefined();
    expect(passwordSection?.options.password_min_length).toBeDefined();
    expect(customLoginSection?.options.custom_login_info).toBeDefined();
  });

  it('should add uncategorized options to "Other settings" section', () => {
    // Act
    const { result } = renderHook(() => useGatewaySettingsCategories(sampleOptions));

    // Assert
    const platformCategory = result.current[0];
    const otherSection = platformCategory.sections.find((s) => s.title === 'Other settings');

    expect(otherSection).toBeDefined();
    expect(otherSection?.options.unknown_option).toBeDefined();
  });

  it('should exclude options listed in exclude array', () => {
    // Arrange
    const optionsWithExcluded: Record<string, GatewaySettingsOption> = {
      ...sampleOptions,
      DEFAULT_PAGE_SIZE: {
        type: 'integer',
        label: 'Default Page Size',
        help_text: 'Default page size',
        required: false,
        read_only: false,
        default: 0,
      },
    };

    // Act
    const { result } = renderHook(() => useGatewaySettingsCategories(optionsWithExcluded));

    // Assert
    const platformCategory = result.current[0];
    const otherSection = platformCategory.sections.find((s) => s.title === 'Other settings');

    expect(otherSection?.options.DEFAULT_PAGE_SIZE).toBeUndefined();
  });

  it('should remove empty sections', () => {
    // Arrange - options that leave some sections empty
    const limitedOptions: Record<string, GatewaySettingsOption> = {
      gateway_proxy_url: {
        type: 'string',
        label: 'Gateway Proxy URL',
        help_text: 'Proxy URL',
        required: false,
        read_only: false,
        default: '',
      },
    };

    // Act
    const { result } = renderHook(() => useGatewaySettingsCategories(limitedOptions));

    // Assert
    const platformCategory = result.current[0];
    const sections = platformCategory.sections;

    sections.forEach((section) => {
      expect(Object.keys(section.options).length).toBeGreaterThan(0);
    });
  });

  it('should preserve options order based on include array', () => {
    // Arrange - multiple options in the same section
    const securityOptions: Record<string, GatewaySettingsOption> = {
      jwt_public_key: {
        type: 'string',
        label: 'JWT Public Key',
        help_text: 'Public key for JWT',
        required: false,
        read_only: false,
        default: '',
      },
      gateway_basic_auth_enabled: {
        type: 'boolean',
        label: 'Basic Auth Enabled',
        help_text: 'Enable basic auth',
        required: false,
        read_only: false,
        default: false,
      },
      allow_admins_to_set_insecure: {
        type: 'boolean',
        label: 'Allow Insecure',
        help_text: 'Allow insecure settings',
        required: false,
        read_only: false,
        default: false,
      },
    };

    // Act
    const { result } = renderHook(() => useGatewaySettingsCategories(securityOptions));

    // Assert
    const platformCategory = result.current[0];
    const securitySection = platformCategory.sections.find((s) => s.title === 'Security');

    const optionKeys = Object.keys(securitySection?.options || {});
    expect(optionKeys[0]).toBe('allow_admins_to_set_insecure');
    expect(optionKeys[1]).toBe('gateway_basic_auth_enabled');
    expect(optionKeys[2]).toBe('jwt_public_key');
  });
});
