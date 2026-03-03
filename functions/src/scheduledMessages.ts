import { onSchedule } from "firebase-functions/v2/scheduler";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "./firebaseAdmin";

const MAX_BATCH_SIZE = 200;

export const processScheduledMessages = onSchedule(
  { schedule: "every 1 minutes", timeoutSeconds: 60 },
  async () => {
    const now = Timestamp.now();

    const snapshot = await db
      .collection("messages")
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .limit(MAX_BATCH_SIZE)
      .get();

    if (snapshot.empty) {
      console.log("No scheduled messages to process.");
      return;
    }

    const batch = db.batch();

    for (const doc of snapshot.docs) {
      batch.update(doc.ref, {
        status: "sent",
        sentAt: Timestamp.now(),
      });
    }

    await batch.commit();

    console.log(`Processed ${snapshot.size} scheduled messages.`);
  }
);
