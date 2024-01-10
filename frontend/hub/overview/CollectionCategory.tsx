import { CollectionVersionSearch } from '../collections/Collection';

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
