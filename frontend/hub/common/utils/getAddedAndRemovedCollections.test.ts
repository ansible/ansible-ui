import { describe, expect, it } from 'vitest';
import { CollectionVersionSearch } from '../../collections/Collection';
import { getAddedAndRemovedCollections } from './getAddedAndRemovedCollections';

function mockCollection(
  namespace: string,
  name: string,
  repo = 'published',
  href = `/pulp/cv/${namespace}/${name}/`
): CollectionVersionSearch {
  return {
    collection_version: {
      namespace,
      name,
      version: '1.0.0',
      pulp_href: href,
      requires_ansible: '>=2.9',
      require_ansible: '>=2.9',
      pulp_created: '',
      contents: [],
      dependencies: {},
      description: '',
      tags: [],
    },
    repository: {
      name: repo,
      pulp_href: '/repo/',
      pulp_id: '1',
      pulp_last_updated: '',
      content_count: 0,
      gpgkey: '',
      latest_version_href: '',
      description: '',
    },
    repository_version: 'latest',
    namespace_metadata: {
      name: namespace,
      pulp_href: '/ns/',
      company: '',
      description: '',
      avatar_url: '',
    },
    is_highest: true,
    is_deprecated: false,
    is_signed: false,
  };
}

describe('getAddedAndRemovedCollections', () => {
  it('returns added and removed collections between two lists', () => {
    const original = [mockCollection('ns', 'a'), mockCollection('ns', 'b')];
    const current = [mockCollection('ns', 'b'), mockCollection('ns', 'c')];

    const { added, removed } = getAddedAndRemovedCollections(original, current);

    expect(added.map((c) => c.collection_version?.name)).toEqual(['c']);
    expect(removed.map((c) => c.collection_version?.name)).toEqual(['a']);
  });

  it('handles empty original and current lists', () => {
    expect(getAddedAndRemovedCollections([], [])).toEqual({ added: [], removed: [] });
  });
});
