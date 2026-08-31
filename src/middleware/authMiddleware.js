import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const getUserId = async (req, res, next) => {
  let userToken = req.cookies.jwt;

  if (!userToken && req.headers.authorization?.startsWith("Bearer ")) {
    userToken = req.headers.authorization.split(" ")[1];
  }
  if (!userToken) {
    return res.status(401).json({ err: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }

    req.user = user;
  } catch (error) {
    return res.status(401).json({ err: "Invalid or expired token" });
  }

  next();
};

export { getUserId };
