/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ExecutionEnvironmentImage } from '../ExecutionEnvironmentImage';
import {
  mockExecutionEnvironment,
  mockExecutionEnvironmentImage,
} from '../../test/mockExecutionEnvironment';
import { useImagesToolbarActions } from './useImagesToolbarActions';

const mockManageTags = vi.fn();
const mockDeleteImages = vi.fn();
const mockRefresh = vi.fn().mockResolvedValue(undefined);
let manageTagsOnComplete: (() => void) | undefined;

vi.mock('./useDeleteImages', () => ({
  useDeleteImages: () => mockDeleteImages,
}));

vi.mock('./useExecutionEnvironmentManageTags', () => ({
  useExecutionEnvironmentManageTags: (onComplete?: () => void) => {
    manageTagsOnComplete = onComplete;
    return mockManageTags;
  },
}));

vi.mock('../../hooks/useController', () => ({
  useController: () => ({
    type: 'button',
    label: 'Use in Controller',
    onClick: vi.fn(),
  }),
}));

describe('useImagesToolbarActions', () => {
  it('includes manage tags, controller, and delete actions for local EE', () => {
    const { result } = renderHook(
      () =>
        useImagesToolbarActions({
          id: mockExecutionEnvironment.name,
          executionEnvironment: mockExecutionEnvironment,
          refresh: mockRefresh,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const labels = result.current.map((action) => ('label' in action ? action.label : ''));
    expect(labels).toContain('Manage tags');
    expect(labels).toContain('Use in Controller');
    expect(labels).toContain('Delete');
  });

  it('hides manage tags when EE has a remote', () => {
    const remoteEE = {
      ...mockExecutionEnvironment,
      pulp: {
        ...mockExecutionEnvironment.pulp!,
        repository: {
          ...mockExecutionEnvironment.pulp!.repository!,
          remote: mockExecutionEnvironment.pulp!.repository!.remote,
        },
      },
    };

    const { result } = renderHook(
      () =>
        useImagesToolbarActions({
          id: remoteEE.name,
          executionEnvironment: remoteEE,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const manageTags = result.current.find(
      (action) => 'label' in action && action.label === 'Manage tags'
    );
    const isHidden = manageTags && 'isHidden' in manageTags ? manageTags.isHidden : undefined;
    expect(isHidden?.(mockExecutionEnvironmentImage)).toBe(true);
  });

  it('calls manage tags and delete handlers when actions are clicked', () => {
    mockManageTags.mockClear();
    mockDeleteImages.mockClear();

    const { result } = renderHook(
      () =>
        useImagesToolbarActions({
          id: mockExecutionEnvironment.name,
          executionEnvironment: mockExecutionEnvironment,
          refresh: mockRefresh,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    const manageAction = result.current.find(
      (action) => 'label' in action && action.label === 'Manage tags'
    );
    const deleteAction = result.current.find(
      (action) => 'label' in action && action.label === 'Delete'
    );

    if (manageAction && 'onClick' in manageAction) {
      (manageAction.onClick as (image: ExecutionEnvironmentImage) => unknown)(
        mockExecutionEnvironmentImage
      );
    }
    if (deleteAction && 'onClick' in deleteAction) {
      (deleteAction.onClick as (image: ExecutionEnvironmentImage) => unknown)(
        mockExecutionEnvironmentImage
      );
    }

    expect(mockManageTags).toHaveBeenCalledWith(
      mockExecutionEnvironment,
      mockExecutionEnvironmentImage
    );
    expect(mockDeleteImages).toHaveBeenCalledWith([mockExecutionEnvironmentImage]);
  });

  it('passes refresh callback to manage tags hook', () => {
    renderHook(
      () =>
        useImagesToolbarActions({
          id: mockExecutionEnvironment.name,
          executionEnvironment: mockExecutionEnvironment,
          refresh: mockRefresh,
        }),
      { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> }
    );

    manageTagsOnComplete?.();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
