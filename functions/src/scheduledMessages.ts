import { onSchedule } from "firebase-functions/v2/scheduler";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "./firebaseAdmin";

const MAX_BATCH_SIZE = 200;

export const processScheduledMessages = onSchedule(
  {
    schedule: "* * * * *", // changed to standard cron to force update
    region: "us-central1",
    timeZone: "UTC",
    maxInstances: 1,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async () => {
    const now = Timestamp.now();

    const snapshot = await db
      .collection("messages")
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .limit(MAX_BATCH_SIZE)
      .get();

    if (snapshot.empty) {
      return;
    }

    const batch = db.batch();

    for (const docSnap of snapshot.docs) {
      batch.update(docSnap.ref, {
        status: "sent",
        sentAt: now,
        updatedAt: now,
      });
    }

    await batch.commit();
  }
);
