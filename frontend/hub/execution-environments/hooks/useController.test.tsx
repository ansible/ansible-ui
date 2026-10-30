/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { ExecutionEnvironmentImage } from '../ExecutionEnvironmentPage/ExecutionEnvironmentImage';
import {
  mockExecutionEnvironment,
  mockExecutionEnvironmentImage,
} from '../test/mockExecutionEnvironment';
import { imageURL, useController } from './useController';

function clickControllerAction(
  action: ReturnType<typeof useController>,
  item: ExecutionEnvironment | ExecutionEnvironmentImage
) {
  if ('onClick' in action) {
    (action.onClick as (item: ExecutionEnvironment | ExecutionEnvironmentImage) => unknown)(item);
  }
}

const mockNavigate =
  vi.fn<(pageId: string, options?: { query?: Record<string, string> }) => void>();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

describe('imageURL', () => {
  it('defaults tag to latest when tag and digest are omitted', () => {
    expect(imageURL({ image: 'my-ee' })).toMatch(/my-ee:latest$/);
  });

  it('uses digest when tag is omitted', () => {
    const digest = 'sha256:abc';
    expect(imageURL({ image: 'my-ee', digest })).toBe(`${window.location.host}/my-ee@${digest}`);
  });

  it('uses explicit tag when provided', () => {
    expect(imageURL({ image: 'my-ee', tag: 'v2' })).toBe(`${window.location.host}/my-ee:v2`);
  });
});

describe('useController', () => {
  it('navigates to controller create EE with image query for EE', () => {
    const { result } = renderHook(() => useController(mockExecutionEnvironment, false), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      clickControllerAction(result.current, mockExecutionEnvironment);
    });

    expect(mockNavigate).toHaveBeenCalled();
    const [, options] = mockNavigate.mock.calls[0];
    expect(options?.query?.image).toContain('test-execution-environment');
  });

  it('navigates with digest and tag when isImage is true', () => {
    mockNavigate.mockClear();
    const { result } = renderHook(() => useController(mockExecutionEnvironment, true), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      clickControllerAction(result.current, mockExecutionEnvironmentImage);
    });

    expect(mockNavigate).toHaveBeenCalled();
    const [, options] = mockNavigate.mock.calls[0];
    expect(options?.query?.image).toContain('test-execution-environment:latest');
  });
});
