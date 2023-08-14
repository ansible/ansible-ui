import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';

export interface CollectionCategory {
  id: string;
  name: string;
  searchKey: string;
  searchValue: string;
}

export interface CategorizedCollections {
  // Maps category ID to collections from Search API
  [key: string]: CollectionVersionSearch[];
}
