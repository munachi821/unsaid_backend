import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generatetoken.js";
import { sendEmail } from "../utils/sendEmails.js";
import crypto from "crypto";

const createVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { rawToken, hashedToken, expiresAt };
};

const sendVerificationEmail = async (user, rawToken) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify Your Email - The Unsaid",
    text: `Welcome to The Unsaid! Please verify your email by clicking this link: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify Your Email</h2>
        <p>Hello ${user.name || user.username},</p>
        <p>Thanks for signing up for <strong>The Unsaid</strong>!</p>
        <p>Click the button below to verify your email address (valid for 24 hours):</p>
        <p><a href="${verifyUrl}" style="background: #111; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a></p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const register = async (req, res) => {
  const { name, username, password, email } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      return res
        .status(400)
        .json({ err: `User already exists with this ${field}` });
    }

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rawToken, hashedToken, expiresAt } = createVerificationToken();

    // Adding user to table
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken: hashedToken,
        verificationTokenExpires: expiresAt,
      },
    });

    try {
      await sendVerificationEmail(user, rawToken);
    } catch (emailError) {
      console.error("Verification email failed:", emailError.message);
      return res.status(500).json({
        success: false,
        message:
          "Account created, but failed to send verification email. Please request a new verification link.",
      });
    }

    return res.status(201).json({
      status: "success",
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Registration error: ${error.message}`,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // check if user email exists
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    return res.status(401).json({ err: "Invalid email or password" });
  }

  if (!user.password) {
    return res.status(401).json({
      err: "This account uses Google Sign-In. Please log in with Google.",
    });
  }

  // verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ err: "Invalid email or password" });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      err: "Please verify your email address before logging in.",
    });
  }

  // Generate JWT token
  const token = generateToken(user.id, res);

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: email,
        username: user.username,
        role: user.role,
      },
      token,
    },
  });
};

  const verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
        verificationTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    const jwtToken = generateToken(updatedUser.id, res);

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully",
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
        },
        token: jwtToken,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If that email exists in our system, a verification link has been sent.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified.",
      });
    }

    const { rawToken, hashedToken, expiresAt } = createVerificationToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: hashedToken,
        verificationTokenExpires: expiresAt,
      },
    });

    await sendVerificationEmail(user, rawToken);

    return res.status(200).json({
      success: true,
      message:
        "If that email exists in our system, a verification link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending verification email. Please try again later.",
    });
  }
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
    const clientUrl = process.env.CLIENT_URL || "https://localhost:5173";
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
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
