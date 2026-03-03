import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ConnectionFormData } from "../types";

export const createConnection = async (
  tenantId: string,
  data: ConnectionFormData
) => {
  const docRef = await addDoc(collection(db, "connections"), {
    tenantId,
    name: data.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateConnection = async (
  connectionId: string,
  data: Partial<ConnectionFormData>
) => {
  await updateDoc(doc(db, "connections", connectionId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteConnection = async (connectionId: string) => {
  await deleteDoc(doc(db, "connections", connectionId));
};
