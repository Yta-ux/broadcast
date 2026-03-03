import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore";
import { db } from "../lib/firebase";

interface UseCollectionResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export const useCollection = <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): UseCollectionResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const constraintsKey = useMemo(() => 
    JSON.stringify(constraints.map((c) => c.type)), 
    [constraints]
  );

  const q = useMemo(() => {
    if (constraints.length === 0) return null;
    return query(collection(db, collectionName), ...constraints);
  }, [collectionName, constraints, constraintsKey]);

  useEffect(() => {
    if (!q) {
      setData((prev) => (prev.length === 0 ? prev : []));
      setLoading((prev) => (prev === false ? prev : false));
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as T[];
        setData(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
};

export const useFilteredCollection = <T extends DocumentData>(
  collectionName: string,
  tenantId: string | null,
  extraConstraints: QueryConstraint[] = []
): UseCollectionResult<T> => {
  const extraConstraintsKey = useMemo(() => 
    JSON.stringify(extraConstraints.map((c) => c.type)),
    [extraConstraints]
  );
  
  const constraints = useMemo(() => {
    if (!tenantId) return [];
    return [where("tenantId", "==", tenantId), ...extraConstraints];
  }, [tenantId, extraConstraints, extraConstraintsKey]);

  return useCollection<T>(collectionName, constraints);
};


