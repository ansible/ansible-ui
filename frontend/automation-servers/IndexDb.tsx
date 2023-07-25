import { DBSchema, IDBPDatabase, openDB, StoreNames } from 'idb';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AutomationServer } from './AutomationServer';

/**
 * This is the base interface for all the data types that are stored in the indexdb.
 * It supports polling the database for only the items that have been modified since the last poll.
 */
export type IndexedDbItem = {
  id: number | string;
  created: string;
  modified: string;
  deleted?: boolean;
  labels?: string[];
};

export type CreateItem<T extends IndexedDbItem> = Omit<T, 'id' | 'created' | 'modified'>;

export function indexedDbItemKey(item: IndexedDbItem) {
  return item.id;
}

export interface MyDBSchema extends DBSchema {
  servers: { key: number | string; value: AutomationServer; indexes: { modified: string } };
}

const IndexedDbContext = createContext<IDBPDatabase<MyDBSchema> | null>(null);

export function IndexedDbProvider(props: { children: React.ReactNode; databaseName: string }) {
  const { children, databaseName } = props;
  const [db, setDB] = useState<IDBPDatabase<MyDBSchema> | null>(null);
  useEffect(() => {
    void openDB<MyDBSchema>(databaseName, 1, {
      upgrade(db) {
        const userStore = db.createObjectStore('servers', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('modified', 'modified');
      },
    }).then(setDB);
  }, [databaseName]);
  return <IndexedDbContext.Provider value={db}>{children}</IndexedDbContext.Provider>;
}

export function useIndexDb() {
  return useContext(IndexedDbContext);
}

export function useIndexDbPutItem<Name extends StoreNames<MyDBSchema>>(
  storeName: Name
): (
  item: Omit<MyDBSchema[Name]['value'], 'id' | 'created' | 'modified'>
) => Promise<MyDBSchema[Name]['key'] | undefined> {
  const db = useIndexDb();
  return useCallback(
    async (item: Omit<MyDBSchema[Name]['value'], 'id' | 'created' | 'modified'>) => {
      if (!db) return;
      const now = new Date().toISOString();
      const updatedItem = { ...item, created: now, modified: now };
      return db.put(storeName, updatedItem as MyDBSchema[Name]['value']);
    },
    [db, storeName]
  );
}

export function useIndexDbUpdateItem<Name extends StoreNames<MyDBSchema>>(
  storeName: Name
): (
  id: MyDBSchema[Name]['key'],
  item: Partial<MyDBSchema[Name]['value']>
) => Promise<MyDBSchema[Name]['key'] | undefined> {
  const db = useIndexDb();
  return useCallback(
    async (id: MyDBSchema[Name]['key'], item: Partial<MyDBSchema[Name]['value']>) => {
      if (!db) return;
      const now = new Date().toISOString();
      const existingItem = await db.get(storeName, id);
      if (existingItem) {
        const updatedItem = {
          ...existingItem,
          ...item,
          id,
          created: existingItem.created,
          modified: now,
        };
        if (item) return db.put(storeName, updatedItem);
      }
    },
    [db, storeName]
  );
}

export function useIndexedDbDeleteItem<Name extends StoreNames<MyDBSchema>>(
  storeName: Name
): (id: MyDBSchema[Name]['key']) => Promise<MyDBSchema[Name]['key'] | undefined> {
  const updateItem = useIndexDbUpdateItem(storeName);
  return useCallback(
    async (id: MyDBSchema[Name]['key']) => {
      return updateItem(id, { deleted: true } as MyDBSchema[Name]['value']);
    },
    [updateItem]
  );
}

export function useIndexedDbItem<Name extends StoreNames<MyDBSchema>>(
  storeName: Name,
  id: MyDBSchema[Name]['key']
) {
  const db = useIndexDb();
  const [item, setItem] = useState<MyDBSchema[Name]['value'] | undefined>();

  const abortControllerRef = useRef<AbortController>(new AbortController());
  useEffect(() => () => abortControllerRef.current.abort(), []);

  useEffect(() => {
    if (!db) return;
    setItem(undefined);
    void db.get(storeName, id).then((item) => {
      if (abortControllerRef.current.signal.aborted) return;
      setItem(item);
    });
  }, [db, id, storeName]);
  return item;
}

export function useIndexedDbItems<Name extends StoreNames<MyDBSchema>>(
  storeName: Name,
  refreshInterval?: number
) {
  const db = useIndexDb();

  const [items, setItems] = useState<MyDBSchema[Name]['value'][] | undefined>();

  const itemMapRef = useRef<Map<MyDBSchema[Name]['key'], MyDBSchema[Name]['value']>>(new Map());
  const lastModifiedRef = useRef<{ lastModified: string }>({ lastModified: '' });

  const update = useCallback(
    async (abortSignal: AbortSignal) => {
      if (!db) return;
      const itemMap = itemMapRef.current;
      const lastModified = lastModifiedRef.current;
      const newItems = await db.getAllFromIndex(
        storeName,
        'modified',
        IDBKeyRange.lowerBound(lastModified.lastModified, true)
      );
      if (abortSignal.aborted) return;
      if (newItems && newItems.length > 0) {
        // console.log(storeName, newItems)
        for (const item of newItems) {
          if (item.deleted) {
            itemMap.delete(item.id);
          } else {
            itemMap.set(item.id, item);
          }
          if (item.modified > lastModified.lastModified) {
            lastModified.lastModified = item.modified;
          }
        }
        setItems(Array.from(itemMap.values()));
      } else {
        setItems((items) => (items ? items : []));
      }
    },
    [db, storeName]
  );

  usePolling(update, refreshInterval ?? 500);

  return items;
}

function usePolling(callback: (abortSignal: AbortSignal) => Promise<void>, interval: number) {
  useEffect(() => {
    const abortController = new AbortController();
    let timeout: NodeJS.Timeout | undefined;
    const update = () => {
      void callback(abortController.signal).then(() => {
        if (abortController.signal.aborted) return;
        timeout = setTimeout(update, interval);
      });
    };
    update();
    return () => {
      abortController.abort();
      clearTimeout(timeout);
    };
  }, [callback, interval]);
}
