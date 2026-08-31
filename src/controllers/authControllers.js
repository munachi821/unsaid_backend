import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generatetoken.js";

const register = async (req, res) => {
  const { name, username, password, email } = req.body;

  const userExists = await prisma.user.findUnique({
    where: { email: email },
  });

  if (userExists) {
    return res.status(400).json({ err: "User already exists with this email" });
  }

  //Hashing password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //Adding user to table
  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
    },
  });

  //Generate JWT Token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: name,
        username: username,
        email: email,
        role: "user",
      },
      token,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  //check if user email exists
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    return res.status(401).json({ err: "Invalid email or password" });
  }

  //verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ err: "Invalid email or password" });
  }

  //Generate JWT token
  const token = generateToken(user.id, res);

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: email,
        username: user.username,
        role: "user",
      },
      token,
    },
  });
};

const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

const getMe = async (req, res) => {
  res.status(200).json({ message: "success", data: { user: req.user } });
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  //check if user email exists
  const checkEmail = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!checkEmail) {
    return res.status(401).json({ err: "user with this email does not exist" });
  }

  //configure sending emails
};

export { register, login, logout, getMe };
