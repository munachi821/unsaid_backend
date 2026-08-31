import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generatetoken.js";
import { sendEmail } from "../utils/sendEmails.js";
import crypto from "crypto";
import { success } from "zod";

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  //check if user email exists
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(200).json({
        err: "If that email exists in our system, a password reset link has been sent.",
      });
    }

    //Generating and hashing tokens
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); //15 minutes

    //Saving token and expiry token to db
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      },
    });

    //construct the reset URL
    const clientUrl = process.env.CLIENT_URL || "https://localhost:5001";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    //sending email
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - The Unsaid",
        text: `You requested a password reset. Pllease click this link to reset your Password: ${resetUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Hello ${user.name || user.username},</p>
            <p>You requested a password reset for your account on <strong>The Unsaid</strong>.</p>
            <p>Click the link below to set a new password (valid for 15 minutes):</p>
            <p><a href="${resetUrl}" style="background: #111; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      return res.status(200).json({
        success: true,
        message:
          "if that email exists in our system, a password reset link has been sent.",
      });
    } catch (emailError) {
      //if email sending fails, clear token from db
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return res.status(500).json({
        success: false,
        message: "Error sending reset email. Please try again later.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  //hashing the token to match what's stored in the db
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    //finding user with the same resetToken
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    //throwing error if not found
    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired password reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Passwprd updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { register, login, logout, getMe, forgotPassword, resetPassword };
