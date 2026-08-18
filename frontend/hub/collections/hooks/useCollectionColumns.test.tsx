/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ITableColumn, LabelValue } from '@ansible/ansible-ui-framework';
import { useCollectionColumns } from './useCollectionColumns';
import { CollectionVersionSearch } from '../Collection';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => () => '/mock-url',
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({}),
  };
});

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({ featureFlags: { display_signatures: true } }),
}));

function makeCollection(repoName: string, isSigned: boolean): CollectionVersionSearch {
  return {
    repository: {
      name: repoName,
      description: '',
      pulp_id: '1',
      pulp_last_updated: '',
      content_count: 0,
      gpgkey: '',
    },
    collection_version: { name: 'test-col', namespace: 'test-ns', version: '1.0.0' },
    repository_version: '1',
    is_highest: true,
    is_deprecated: false,
    is_signed: isSigned,
  } as CollectionVersionSearch;
}

function getBadgesColumn(): ITableColumn<CollectionVersionSearch> | undefined {
  const { result } = renderHook(() => useCollectionColumns());
  return result.current.find((col) => col.header === 'Badges');
}

function getBadgeValues(repoName: string, isSigned: boolean): LabelValue[] | undefined {
  const col = getBadgesColumn();
  if (!col || col.type !== 'labels') return undefined;
  return col.value(makeCollection(repoName, isSigned));
}

describe('useCollectionColumns badges column', () => {
  it('should return blue filled label for rh-certified repository', () => {
    const labels = getBadgeValues('rh-certified', false);
    expect(labels).toBeDefined();
    const repoLabel = labels![0];
    expect(typeof repoLabel).not.toBe('string');
    if (typeof repoLabel !== 'string') {
      expect(repoLabel.label).toBe('rh-certified');
      expect(repoLabel.color).toBe('blue');
      expect(repoLabel.variant).toBe('filled');
    }
  });

  it('should return purple filled label for validated repository', () => {
    const labels = getBadgeValues('validated', false);
    const repoLabel = labels![0];
    if (typeof repoLabel !== 'string') {
      expect(repoLabel.label).toBe('validated');
      expect(repoLabel.color).toBe('purple');
      expect(repoLabel.variant).toBe('filled');
    }
  });

  it('should return grey filled label for published repository', () => {
    const labels = getBadgeValues('published', false);
    const repoLabel = labels![0];
    if (typeof repoLabel !== 'string') {
      expect(repoLabel.label).toBe('published');
      expect(repoLabel.color).toBe('grey');
      expect(repoLabel.variant).toBe('filled');
    }
  });

  it('should return grey filled label for community repository', () => {
    const labels = getBadgeValues('community', false);
    const repoLabel = labels![0];
    if (typeof repoLabel !== 'string') {
      expect(repoLabel.label).toBe('community');
      expect(repoLabel.color).toBe('grey');
    }
  });

  it('should include Signed status label when collection is signed', () => {
    const labels = getBadgeValues('published', true);
    expect(labels).toHaveLength(2);
    const signedLabel = labels![1];
    if (typeof signedLabel !== 'string') {
      expect(signedLabel.label).toBe('Signed');
      expect(signedLabel.status).toBe('success');
      expect(signedLabel.variant).toBe('outline');
    }
  });

  it('should include Unsigned status label when collection is not signed', () => {
    const labels = getBadgeValues('published', false);
    expect(labels).toHaveLength(2);
    const unsignedLabel = labels![1];
    if (typeof unsignedLabel !== 'string') {
      expect(unsignedLabel.label).toBe('Unsigned');
      expect(unsignedLabel.status).toBe('warning');
      expect(unsignedLabel.variant).toBe('outline');
    }
  });

  it('should hide badges column from table and list views', () => {
    const col = getBadgesColumn();
    expect(col?.table).toBe('hidden');
    expect(col?.list).toBe('hidden');
  });
});
