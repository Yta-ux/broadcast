import { useMemo } from "react";
import { where, orderBy, limit } from "firebase/firestore";
import { useFilteredCollection } from "./useFirestore";
import { toDayKey, formatShortDay } from "../lib/format";
import type { Connection, Contact, Message } from "../types";

interface TrendPoint {
  day: string;
  label: string;
  sent: number;
  scheduled: number;
}

interface PieSlice {
  name: string;
  value: number;
}

interface UpcomingMessage {
  id: string;
  text: string;
  scheduledAt: Date | null;
  contactCount: number;
  status: string;
  connectionId: string;
}

interface TopConnection {
  connectionId: string;
  name: string;
  contacts: number;
}

interface ConnectionOption {
  id: string;
  name: string;
}

export interface DashboardData {
  isLoading: boolean;
  kpis: {
    connections: number;
    contacts: number;
    messagesLast7d: number;
    scheduledNext24h: number;
  };
  trend7d: TrendPoint[];
  statusPie: PieSlice[];
  upcomingScheduled: UpcomingMessage[];
  topConnections: TopConnection[];
  connectionsOptions: ConnectionOption[];
}

export const useDashboardData = (
  tenantId: string | null,
  selectedConnectionId: string
): DashboardData => {
  const { data: connections, loading: loadingConn } =
    useFilteredCollection<Connection>("connections", tenantId);

  const contactConstraints = useMemo(() => {
    if (!selectedConnectionId) return [];
    return [where("connectionId", "==", selectedConnectionId)];
  }, [selectedConnectionId]);

  const { data: contacts, loading: loadingContacts } =
    useFilteredCollection<Contact>("contacts", tenantId, contactConstraints);

  const messageConstraints = useMemo(() => {
    const c = [orderBy("createdAt", "desc"), limit(500)];
    if (selectedConnectionId) {
      return [where("connectionId", "==", selectedConnectionId), ...c];
    }
    return c;
  }, [selectedConnectionId]);

  const { data: messages, loading: loadingMsg } =
    useFilteredCollection<Message>("messages", tenantId, messageConstraints);

  const now = useMemo(() => new Date(), []);

  const kpis = useMemo(() => {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const messagesLast7d = messages.filter((m) => {
      const created = m.createdAt?.toDate?.();
      return created && created >= sevenDaysAgo;
    }).length;

    const scheduledNext24h = messages.filter((m) => {
      if (m.status !== "scheduled") return false;
      const at = m.scheduledAt?.toDate?.();
      return at && at >= now && at <= next24h;
    }).length;

    return {
      connections: connections.length,
      contacts: contacts.length,
      messagesLast7d,
      scheduledNext24h,
    };
  }, [connections.length, contacts.length, messages, now]);

  const trend7d = useMemo(() => {
    const days: TrendPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({
        day: toDayKey(d),
        label: formatShortDay(d),
        sent: 0,
        scheduled: 0,
      });
    }

    for (const msg of messages) {
      const created = msg.createdAt?.toDate?.();
      if (!created) continue;
      const key = toDayKey(created);
      const point = days.find((d) => d.day === key);
      if (!point) continue;
      if (msg.status === "sent") point.sent++;
      else if (msg.status === "scheduled") point.scheduled++;
    }

    return days;
  }, [messages, now]);

  const statusPie = useMemo(() => {
    const counts: Record<string, number> = { sent: 0, scheduled: 0, failed: 0 };
    for (const msg of messages) {
      if (msg.status in counts) counts[msg.status]++;
    }
    return [
      { name: "Enviadas", value: counts.sent },
      { name: "Agendadas", value: counts.scheduled },
      { name: "Falhou", value: counts.failed },
    ].filter((s) => s.value > 0);
  }, [messages]);

  const upcomingScheduled = useMemo(() => {
    return messages
      .filter((m) => {
        if (m.status !== "scheduled") return false;
        const at = m.scheduledAt?.toDate?.();
        return at && at >= now;
      })
      .sort((a, b) => {
        const aTime = a.scheduledAt?.toDate?.()?.getTime() ?? 0;
        const bTime = b.scheduledAt?.toDate?.()?.getTime() ?? 0;
        return aTime - bTime;
      })
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        text: m.text,
        scheduledAt: m.scheduledAt?.toDate?.() ?? null,
        contactCount: m.contactIds.length,
        status: m.status,
        connectionId: m.connectionId,
      }));
  }, [messages, now]);

  const topConnections = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const c of contacts) {
      countMap.set(c.connectionId, (countMap.get(c.connectionId) ?? 0) + 1);
    }

    return Array.from(countMap.entries())
      .map(([connectionId, count]) => ({
        connectionId,
        name: connections.find((c) => c.id === connectionId)?.name ?? "—",
        contacts: count,
      }))
      .sort((a, b) => b.contacts - a.contacts)
      .slice(0, 5);
  }, [contacts, connections]);

  const connectionsOptions = useMemo(
    () => connections.map((c) => ({ id: c.id, name: c.name })),
    [connections]
  );

  return {
    isLoading: loadingConn || loadingContacts || loadingMsg,
    kpis,
    trend7d,
    statusPie,
    upcomingScheduled,
    topConnections,
    connectionsOptions,
  };
};
