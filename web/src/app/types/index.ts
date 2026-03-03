import { Timestamp } from "firebase/firestore";

export interface Tenant {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface TenantUser {
  userId: string;
  tenantId: string;
  email: string;
  createdAt: Timestamp;
}

export type MessageStatus = "scheduled" | "sent" | "failed";

export interface Connection {
  id: string;
  tenantId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Contact {
  id: string;
  tenantId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  tenantId: string;
  connectionId: string;
  contactIds: string[];
  text: string;
  status: MessageStatus;
  scheduledAt: Timestamp;
  sentAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface SignupData {
  email: string;
  password: string;
  tenantName: string;
}

export interface ConnectionFormData {
  name: string;
}

export interface ContactFormData {
  connectionId: string;
  name: string;
  phone: string;
}

export interface MessageFormData {
  connectionId: string;
  contactIds: string[];
  text: string;
  scheduledAt: Date;
}
