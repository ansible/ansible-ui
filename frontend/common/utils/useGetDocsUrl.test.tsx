import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocsVersionProvider } from './useDocsVersion';
import { useGetDocsUrl } from './useGetDocsUrl';

describe('useGetDocsUrl', () => {
  it('should build Red Hat docs url when config is missing', () => {
    const { result } = renderHook(() => useGetDocsUrl(undefined, 'projects'), {
      wrapper: ({ children }) => (
        <DocsVersionProvider version="2.6">{children}</DocsVersionProvider>
      ),
    });

    expect(result.current).toContain(
      'https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.6/'
    );
  });

  it('should use community docs for open license', () => {
    const { result } = renderHook(
      () =>
        useGetDocsUrl(
          {
            license_info: { license_type: 'open' },
          } as Parameters<typeof useGetDocsUrl>[0],
          'projects'
        ),
      {
        wrapper: ({ children }) => (
          <DocsVersionProvider version="2.6">{children}</DocsVersionProvider>
        ),
      }
    );

    expect(result.current).toBe('https://docs.ansible.com/');
  });

  it('should use Red Hat docs for non-open license', () => {
    const { result } = renderHook(
      () =>
        useGetDocsUrl(
          {
            license_info: { license_type: 'enterprise' },
          } as Parameters<typeof useGetDocsUrl>[0],
          'projects'
        ),
      {
        wrapper: ({ children }) => (
          <DocsVersionProvider version="2.4">{children}</DocsVersionProvider>
        ),
      }
    );

    expect(result.current).toContain('/2.4/');
    expect(result.current).toContain('docs.redhat.com');
  });
});
