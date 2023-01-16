import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { useEffect, useState } from 'react';
import { UnifiedJobSummary } from './JobsChart';

interface IndexedDbSchema extends DBSchema {
  jobHistory: {
    value: UnifiedJobSummary;
    key: string;
    indexes: { finished: string };
  };
}

export async function getDB(name: string) {
  const db = await openDB<IndexedDbSchema>(name, 1, {
    upgrade(db) {
      db.createObjectStore('jobHistory', { keyPath: 'id' });
    },
  });
  return db;
}

export function useDB(dbName: string) {
  const [db, setDB] = useState<IDBPDatabase<IndexedDbSchema>>();
  useEffect(() => {
    async function asyncGetDB() {
      const db = await getDB(dbName);
      setDB(db);
    }
    void asyncGetDB();
  }, [dbName]);
  return db;
}
