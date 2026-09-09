import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";

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

const updateUsername = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "not-authenticated" });
  }

  const { username } = req.body;

  try {
    const updateUsername = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username,
      },
    });

    if (!updateUsername) {
      return res.status(401).json({ err: "invalid user" });
    }
  } catch (err) {
    return res.status(500).json({ err: `db issue: ${err}` });
  }

  res.status(200).json({
    success: true,
    message: "username updated successfully",
    data: {
      username: username,
    },
  });
};

const updatePassword = async (req, res) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;
  if (!user) {
    return res.status(401).json({ error: "not-authenticated" });
  }

  try {
    const checkCurrentPass = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      checkCurrentPass.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({ err: "password dosen't match" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword,
      },
    });
  } catch (err) {
    return res.status(500).json({ err: `db error: ${err}` });
  }

  res.status(200).json({
    success: true,
    message: "password changed successfully",
  });
};

export {
  getPublicProfile,
  checkUsernameAvailability,
  updateUsername,
  updatePassword,
};
