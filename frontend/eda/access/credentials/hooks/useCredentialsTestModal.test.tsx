/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCredentialsTestModal } from './useCredentialsTestModal';
import { PageDialogProvider } from '../../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../../framework/useFrameworkTranslations';
import { BrowserRouter } from 'react-router-dom';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      'aria-label': ariaLabel,
    }: {
      children: React.ReactNode;
      'aria-label': string;
    }) => (
      <div data-testid="modal" aria-label={ariaLabel}>
        {children}
      </div>
    ),
    ModalHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
    ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('useCredentialsTestModal', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  it('should return a function', () => {
    const { result } = renderHook(() => useCredentialsTestModal(), { wrapper });
    expect(typeof result.current).toBe('function');
  });

  it('should open the test modal when called with props', () => {
    const { result } = renderHook(() => useCredentialsTestModal(), { wrapper });

    const credentialType = {
      id: 1,
      name: 'External Type',
      inputs: { fields: [], metadata: [] },
    } as unknown as EdaCredentialType;

    act(() => {
      result.current({ credentialType, watchedSubFormFields: [] });
    });

    expect(screen.getByText('Test external credential')).toBeInTheDocument();
  });

  it('should not throw when called with undefined', () => {
    const { result } = renderHook(() => useCredentialsTestModal(), { wrapper });
    expect(() => result.current(undefined)).not.toThrow();
  });
});
