import { prisma } from "../config/db.js";
const platformStats = async (req, res) => {
  try {
    const last24hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalUsers, totalMessages, active24hrs] = await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
      prisma.user.count({
        where: {
          OR: [
            { updatedAt: { gte: last24hours } },
            { messages: { some: { createdAt: { gte: last24hours } } } },
          ],
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: totalUsers,
        totalMessages: totalMessages,
        activeUsersLast24hrs: active24hrs,
      },
    });
  } catch (err) {
    res.status(400).json({ err: `Failed to fetch stats: ${err.message}` });
  }
};

export { platformStats };
