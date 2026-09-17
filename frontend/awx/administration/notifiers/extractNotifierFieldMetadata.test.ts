import { describe, expect, it } from 'vitest';
import { extractNotifierFieldMetadata, NotificationTemplateOptions } from './NotifierForm';

describe('extractNotifierFieldMetadata', () => {
  const mockOptions: NotificationTemplateOptions = {
    actions: {
      GET: {
        notification_configuration: {
          email: {
            host: {
              label: 'Host',
              type: 'string',
              default: '',
              pattern: '^[a-zA-Z0-9.-]+$',
              pattern_description: 'Host must be a valid hostname',
            },
            port: {
              label: 'Port',
              type: 'int',
              default: 25,
              pattern: '^\\d+$',
              pattern_description: 'Port must be numeric',
            },
            username: { label: 'Username', type: 'string', default: '' },
          },
          slack: {
            token: { label: 'Token', type: 'password', default: '' },
            hex_color: {
              label: 'Notification color',
              type: 'string',
              default: '',
              pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
              pattern_description: 'Must be a hex color code',
            },
          },
        },
      },
    },
  };

  it('returns an empty map when optionsData is undefined', () => {
    expect(extractNotifierFieldMetadata(undefined, 'email')).toEqual({});
  });

  it('returns an empty map when notification type has no fields', () => {
    expect(extractNotifierFieldMetadata(mockOptions, 'nonexistent')).toEqual({});
  });

  it('extracts patterns for a specific notification type', () => {
    const result = extractNotifierFieldMetadata(mockOptions, 'email');
    expect(result).toEqual({
      host: { pattern: '^[a-zA-Z0-9.-]+$', pattern_description: 'Host must be a valid hostname' },
      port: { pattern: '^\\d+$', pattern_description: 'Port must be numeric' },
    });
  });

  it('skips fields without a pattern', () => {
    const result = extractNotifierFieldMetadata(mockOptions, 'email');
    expect(result).not.toHaveProperty('username');
  });

  it('extracts patterns for a different notification type', () => {
    const result = extractNotifierFieldMetadata(mockOptions, 'slack');
    expect(result).toEqual({
      hex_color: {
        pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
        pattern_description: 'Must be a hex color code',
      },
    });
  });

  it('returns empty map when no patterns in response (toggle off)', () => {
    const noPatternOptions: NotificationTemplateOptions = {
      actions: {
        GET: {
          notification_configuration: {
            email: {
              host: { label: 'Host', type: 'string', default: '' },
              port: { label: 'Port', type: 'int', default: 25 },
            },
          },
        },
      },
    };
    expect(extractNotifierFieldMetadata(noPatternOptions, 'email')).toEqual({});
  });

  it('skips fields with invalid regex patterns', () => {
    const badPatternOptions: NotificationTemplateOptions = {
      actions: {
        GET: {
          notification_configuration: {
            email: {
              host: {
                label: 'Host',
                type: 'string',
                default: '',
                pattern: '[invalid(',
                pattern_description: 'Bad regex',
              },
            },
          },
        },
      },
    };
    expect(extractNotifierFieldMetadata(badPatternOptions, 'email')).toEqual({});
  });

  it('handles pattern_description being undefined', () => {
    const noDescOptions: NotificationTemplateOptions = {
      actions: {
        GET: {
          notification_configuration: {
            email: {
              host: {
                label: 'Host',
                type: 'string',
                default: '',
                pattern: '^[a-z]+$',
              },
            },
          },
        },
      },
    };
    const result = extractNotifierFieldMetadata(noDescOptions, 'email');
    expect(result.host?.pattern_description).toBeUndefined();
  });
});
