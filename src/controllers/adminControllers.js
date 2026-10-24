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

const listAllUsers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const skip = (page - 1) * limit;
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mide: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          createdAt: true,
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      messageCount: user._count.messages,
      createdAt: user.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        users: formattedUsers,
      },
      pagination: {
        total: total,
        page: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve users: ${err.message}`,
    });
  }
};

export { platformStats, listAllUsers };
