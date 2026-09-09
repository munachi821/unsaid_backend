import { prisma } from "../config/db.js";

const checkUsername_Exists = async (req, res) => {
  const username = req.params.username;

  const checkDb = await prisma.user.findUnique({
    where: { username: username },
    select: {
      username: true,
    },
  });

  if (!checkDb) {
    return res.status(404).json({ err: "User not found" });
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

export { checkUsername_Exists };
