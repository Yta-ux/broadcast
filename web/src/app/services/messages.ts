import {
  addDoc,
  deleteDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { MessageFormData } from "../types";

import { getDoc } from "firebase/firestore";

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

const validateContactsBelongToConnection = async (
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
  // Validate text
  if (!data.text.trim()) {
    throw new Error("Message text cannot be empty.");
  }

  // Validate scheduledAt is in the future (UTC)
  const scheduledTimestamp = Timestamp.fromDate(data.scheduledAt);
  if (scheduledTimestamp.toMillis() <= Date.now()) {
    throw new Error("Scheduled time must be in the future.");
  }

  // Validate connectionId belongs to tenant
  const isConnectionOwned = await validateConnectionOwnership(
    data.connectionId,
    tenantId
  );
  if (!isConnectionOwned) {
    throw new Error("Connection does not belong to this tenant.");
  }

  // Validate contactIds belong to the connection
  const contactsValid = await validateContactsBelongToConnection(
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

export const deleteMessage = async (messageId: string) => {
  await deleteDoc(doc(db, "messages", messageId));
};
