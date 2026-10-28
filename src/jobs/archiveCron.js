import cron from "node-cron";
import { prisma } from "../config/db.js";

let isJobRunning = false;

export const archiveOldMessages = async () => {
  if (isJobRunning) {
    console.log(
      "[Archive Cron] Previous job still running, skipping this tick.",
    );
    return;
  }

  isJobRunning = true;
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await prisma.message.updateMany({
      where: {
        isArchived: false,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
      data: {
        isArchived: true,
      },
    });

    if (result.count > 0) {
      console.log(
        `[Archive Cron] Successfully archived ${result.count} messages(s).`,
      );
    }
  } catch (err) {
    console.error("[Archive Cron] Error during archive job:", err.message);
  } finally {
    isJobRunning = false;
  }
};

export const initArchiveCron = () => {
  archiveOldMessages();

  cron.schedule("0 * * * *", archiveOldMessages);
  console.log("[Archive Cron] Hourly message job initialized.");
};
