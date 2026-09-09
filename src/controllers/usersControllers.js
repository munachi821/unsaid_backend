import { prisma } from "../config/db.js";

const getPublicProfile = async (req, res) => {
  const username = req.params.username;

  try {
    const checkDb = await prisma.user.findUnique({
      where: { username: username },
      select: {
        username: true,
      },
    });
    if (!checkDb) {
      return res.status(404).json({ err: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: `database error: ${err}` });
  }

  res.status(200).json({
    success: true,
    data: {
      username: username,
      acceptsMessages: true,
      allowImages: true,
    },
  });
};

const checkUsernameAvailability = async (req, res) => {
  const user = req.user;
  const username = req.query.username;

  if (!user) {
    return res.status(401).json({ error: "not-authenticated" });
  }

  const checkUsername = await prisma.user.findUnique({
    where: { username: username },
    select: { id: true },
  });

  const isAvilable = !checkUsername;

  res.status(200).json({
    success: true,
    data: {
      username: username,
      available: isAvilable,
    },
  });
};

export { getPublicProfile, checkUsernameAvailability };
