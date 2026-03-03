export interface Tenant {
  id: string;
  name: string;
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface TenantUser {
  userId: string;
  tenantId: string;
  email: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export type MessageStatus = "scheduled" | "sent" | "failed";

export interface Connection {
  id: string;
  tenantId: string;
  name: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Contact {
  id: string;
  tenantId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Message {
  id: string;
  tenantId: string;
  connectionId: string;
  contactIds: string[];
  text: string;
  status: MessageStatus;
  scheduledAt: FirebaseFirestore.Timestamp;
  sentAt: FirebaseFirestore.Timestamp | null;
  createdAt: FirebaseFirestore.Timestamp;
}
