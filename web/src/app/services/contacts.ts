import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ContactFormData } from "../types";

const validateConnectionOwnership = async (
  connectionId: string,
  tenantId: string
): Promise<boolean> => {
  try {
    const snap = await getDoc(doc(db, "connections", connectionId));
    return snap.exists() && snap.data()?.tenantId === tenantId;
  } catch {
    return false;
  }
};

export const createContact = async (
  tenantId: string,
  data: ContactFormData
) => {
  const isOwned = await validateConnectionOwnership(
    data.connectionId,
    tenantId
  );
  if (!isOwned) {
    throw new Error("Connection does not belong to this tenant.");
  }

  const docRef = await addDoc(collection(db, "contacts"), {
    tenantId,
    connectionId: data.connectionId,
    name: data.name,
    phone: data.phone,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateContact = async (
  contactId: string,
  data: Partial<ContactFormData>
) => {
  const updateData: Record<string, string> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;

  await updateDoc(doc(db, "contacts", contactId), updateData);
};

export const deleteContact = async (contactId: string) => {
  await deleteDoc(doc(db, "contacts", contactId));
};
