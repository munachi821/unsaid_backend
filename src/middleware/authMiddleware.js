import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const getUserId = async (req, res, next) => {
  const userToken = req.cookies.jwt;

  if (!userToken) {
    return res.status(401).json({ err: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          createdAt: true,
        },
      },
    });

    req.user = user;
  } catch (error) {
    return res.status(401).json({ err: "Invalid or expired token" });
  }

  next();
};

export default getUserId;
