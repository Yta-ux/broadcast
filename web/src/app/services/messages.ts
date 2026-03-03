import {
  addDoc,
  deleteDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { MessageFormData } from "../types";

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

const validateContactsOwnership = async (
  contactIds: string[],
  connectionId: string,
  tenantId: string
): Promise<boolean> => {
  if (contactIds.length === 0) return false;

  const q = query(
    collection(db, "contacts"),
    where("tenantId", "==", tenantId),
    where("connectionId", "==", connectionId)
  );
  const snap = await getDocs(q);
  const validIds = new Set(snap.docs.map((d) => d.id));

  return contactIds.every((id) => validIds.has(id));
};

export const scheduleMessage = async (
  tenantId: string,
  data: MessageFormData
) => {
  if (!data.text.trim()) {
    throw new Error("Message text cannot be empty.");
  }

  const scheduledTimestamp = Timestamp.fromDate(data.scheduledAt);
  if (scheduledTimestamp.toMillis() <= Date.now()) {
    throw new Error("Scheduled time must be in the future.");
  }

  const isConnectionOwned = await validateConnectionOwnership(
    data.connectionId,
    tenantId
  );
  if (!isConnectionOwned) {
    throw new Error("Connection does not belong to this tenant.");
  }

  const contactsValid = await validateContactsOwnership(
    data.contactIds,
    data.connectionId,
    tenantId
  );
  if (!contactsValid) {
    throw new Error(
      "One or more contacts do not belong to the selected connection."
    );
  }

  const docRef = await addDoc(collection(db, "messages"), {
    tenantId,
    connectionId: data.connectionId,
    contactIds: data.contactIds,
    text: data.text.trim(),
    status: "scheduled",
    scheduledAt: scheduledTimestamp,
    sentAt: null,
    createdAt: Timestamp.now(),
  });

  return docRef.id;
};

export const updateMessage = async (
  messageId: string,
  tenantId: string,
  data: Partial<MessageFormData>
) => {
  const messageRef = doc(db, "messages", messageId);
  const snap = await getDoc(messageRef);
  
  if (!snap.exists()) throw new Error("Message not found.");
  if (snap.data().status !== "scheduled") {
    throw new Error("Cannot edit a message that has already been sent.");
  }

  const updates: Record<string, string | string[] | ReturnType<typeof Timestamp.now>> = { 
    updatedAt: Timestamp.now() 
  };

  if (data.text !== undefined) {
    if (!data.text.trim()) throw new Error("Message text cannot be empty.");
    updates.text = data.text.trim();
  }

  if (data.scheduledAt !== undefined) {
    const scheduledTimestamp = Timestamp.fromDate(data.scheduledAt);
    if (scheduledTimestamp.toMillis() <= Date.now()) {
      throw new Error("Scheduled time must be in the future.");
    }
    updates.scheduledAt = scheduledTimestamp;
  }

  const connectionId = data.connectionId ?? snap.data().connectionId;
  const contactIds = data.contactIds ?? snap.data().contactIds;

  if (data.connectionId || data.contactIds) {
    const isConnectionOwned = await validateConnectionOwnership(
      connectionId,
      tenantId
    );
    if (!isConnectionOwned) {
      throw new Error("Connection does not belong to this tenant.");
    }

    const contactsValid = await validateContactsOwnership(
      contactIds,
      connectionId,
      tenantId
    );
    if (!contactsValid) {
      throw new Error("One or more contacts do not belong to the connection.");
    }
    if (data.connectionId) updates.connectionId = connectionId;
    if (data.contactIds) updates.contactIds = contactIds;
  }

  await updateDoc(messageRef, updates);
};

export const deleteMessage = (messageId: string) => 
  deleteDoc(doc(db, "messages", messageId));

