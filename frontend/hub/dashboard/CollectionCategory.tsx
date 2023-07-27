import { CollectionVersionSearch } from '../collections/CollectionVersionSearch';

export interface CollectionCategory {
  id: string;
  name: string;
  searchKey: string;
  searchValue: string;
<<<<<<< HEAD
  showInDashoard?: boolean;
  selected?: boolean;
=======
  showInDashboard?: boolean;
>>>>>>> d2a0a914 (temp)
}

export interface CategorizedCollections {
  // Maps category ID to collections from Search API
  [key: string]: CollectionVersionSearch[];
}
