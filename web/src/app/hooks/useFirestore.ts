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

  const constraintsKey = JSON.stringify(
    constraints.map((c) => c.type)
  );

  useEffect(() => {
    if (constraints.length === 0) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(collection(db, collectionName), ...constraints);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, constraintsKey]);

  return { data, loading, error };
};

export const useFilteredCollection = <T extends DocumentData>(
  collectionName: string,
  tenantId: string | null,
  extraConstraints: QueryConstraint[] = []
): UseCollectionResult<T> => {
  const constraints = useMemo(() => {
    if (!tenantId) return [];
    return [where("tenantId", "==", tenantId), ...extraConstraints];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, JSON.stringify(extraConstraints.map((c) => c.type))]);

  return useCollection<T>(collectionName, constraints);
};
