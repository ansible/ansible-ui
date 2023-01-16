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

export function useDB(hostName: string) {
  const [db, setDB] = useState<IDBPDatabase<IndexedDbSchema>>();
  useEffect(() => {
    async function asyncGetDB() {
      const db = await getDB(simpleHash(hostName));
      setDB(db);
    }
    void asyncGetDB();
  }, [hostName]);
  return db;
}

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return new Uint32Array([hash])[0].toString(36);
};
