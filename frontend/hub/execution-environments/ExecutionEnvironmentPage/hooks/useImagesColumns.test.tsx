/* eslint-disable i18next/no-literal-string */
import { render, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockExecutionEnvironmentImage } from '../../test/mockExecutionEnvironment';
import { ExecutionEnvironmentImage } from '../ExecutionEnvironmentImage';
import { useImagesColumns } from './useImagesColumns';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => (_route: string, opts?: { params?: Record<string, string> }) =>
      `/ee/${opts?.params?.id ?? ''}/images/${opts?.params?.tag ?? ''}`,
  };
});

const manifestListImage: ExecutionEnvironmentImage = {
  ...mockExecutionEnvironmentImage,
  media_type: 'application/vnd.docker.distribution.manifest.list.v2+json',
  tags: ['multi'],
  image_manifests: [
    {
      digest: 'sha256:child1',
      os: 'linux',
      architecture: 'amd64',
      os_version: '',
      os_features: '',
      features: '',
      variant: '',
    },
  ],
};

describe('useImagesColumns', () => {
  it('returns expected column headers', () => {
    const { result } = renderHook(() => useImagesColumns({ id: 'test-ee' }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const headers = result.current.map((col) => col.header);
    expect(headers).toEqual(['Tag', 'Published', 'Layers', 'Size', 'Digest']);
  });

  it('renders tag links for standard images', () => {
    const { result } = renderHook(() => useImagesColumns({ id: 'test-ee' }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const tagColumn = result.current[0];
    render(
      <MemoryRouter>
        {'cell' in tagColumn ? tagColumn.cell(mockExecutionEnvironmentImage) : null}
      </MemoryRouter>
    );
    expect(document.querySelector('a')).toHaveAttribute('href', '/ee/test-ee/images/latest');
  });

  it('renders plain labels for manifest lists', () => {
    const { result } = renderHook(() => useImagesColumns({ id: 'test-ee' }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const layersColumn = result.current[2];
    expect(layersColumn.value?.(manifestListImage)).toBe('---');
    const sizeColumn = result.current[3];
    render(<>{'cell' in sizeColumn ? sizeColumn.cell(manifestListImage) : null}</>);
    expect(document.body).toHaveTextContent('---');
  });
});
