import { prisma } from "../config/db.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import { sendEmail } from "../utils/sendEmails.js";
const sendMessage = async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ err: "username is required" });
  }

  const { message, img } = req.body;

  let imageUrl = null;
  try {
    //checking if username exists
    const recipient = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        allowImages: true,
        emailNotif: true,
        status: true,
      },
    });

    if (!recipient || recipient.status === "banned") {
      return res.status(404).json({ err: "user not found" });
    }

    if (req.file && !recipient.allowImages) {
      return res.status(400).json({
        err: "This user does not accept images",
      });
    }

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    if ((!message || message.trim() === "") && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Must provide either a message or an image",
      });
    }

    await prisma.message.create({
      data: {
        recipientId: recipient.id,
        mainMessage: message || null,
        imageUrl: imageUrl,
      },
    });

    if (recipient.emailNotif) {
      await sendEmail({
        to: recipient.email,
        subject: "New Anonymous Message - The Unsaid",
        text: `you just recieved a new anonymous message`,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Message sent anonymously!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Database error: ${error.message}`,
    });
  }
};

const getMessageInbox = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ err: "not authenticated" });
  }

  const { filter = "all" } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const where = {
    recipientId: user.id,
    isArchived: false,
  };

  if (filter === "text") {
    where.imageUrl = null;
  } else if (filter === "img") {
    where.imageUrl = { not: null };
  }

  try {
    const messages = await prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.message.count({ where });

    return res.status(200).json({
      success: true,
      data: {
        messages: messages.map((msg) => ({
          id: msg.id,
          message: msg.mainMessage,
          img: msg.imageUrl,
          isArchived: msg.isArchived,
          createdAt: msg.createdAt,
        })),

        pagination: {
          total: total,
          page: page,
          totalPages: Math.ceil(total / limit) || 0,
        },
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: `Database err: ${err.message}` });
  }
};

const getArchivedMessage = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ err: "not authenticated" });
  }

  const { filter = "all" } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const where = {
    recipientId: user.id,
    isArchived: true,
  };

  if (filter === "text") {
    where.imageUrl = null;
  } else if (filter === "img") {
    where.imageUrl = { not: null };
  }

  try {
    const archiveMessage = await prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.message.count({ where });

    if (!archiveMessage) {
      return res.status(400).json({ err: "No archived message" });
    }

    return res.status(200).json({
      success: true,
      data: {
        messages: archiveMessage.map((msg) => ({
          img: msg.imageUrl,
          text: msg.mainMessage,
          createdAt: msg.createdAt,
        })),

        pagination: {
          total: total,
          page: page,
          totalPages: Math.ceil(total / limit) || 0,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      msg: `databse error ${err}`,
    });
  }
};

const archiveMessage = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ err: "not authenticated" });
  }

  const { id } = req.params;

  try {
    const archiveMessage = await prisma.message.findFirst({
      where: {
        id: id,
        recipientId: user.id,
      },
    });

    if (!archiveMessage) {
      return res.status(404).json({ err: "Message not found" });
    }

    await prisma.message.update({
      where: {
        id: id,
      },
      data: {
        isArchived: true,
      },
    });

    return res.status(200).json({ msg: "messaged archived successfully" });
  } catch (err) {
    return res.status(500).json({
      msg: `databse error ${err}`,
    });
  }
};

const unarchiveMessage = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ err: "not authenticated" });
  }

  const { id } = req.params;

  try {
    const checkMsg = await prisma.message.findFirst({
      where: {
        id: id,
        recipientId: user.id,
      },
    });

    if (!checkMsg) {
      return res.status(404).json({ err: "Message not found" });
    }

    await prisma.message.update({
      where: {
        id: id,
      },
      data: {
        isArchived: false,
      },
    });

    return res.status(200).json({ msg: "Message restored to inbox" });
  } catch (err) {
    return res.status(500).json({
      msg: `databse error ${err}`,
    });
  }
};

const deleteMessage = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ err: "not authenticated" });
  }

  const { id } = req.params;

  try {
    const checkMsg = await prisma.message.findFirst({
      where: {
        id: id,
        recipientId: user.id,
      },
    });

    if (!checkMsg) {
      return res.status(404).json({ err: "Message not found" });
    }

    if (checkMsg.imageUrl) {
      await deleteFromCloudinary(checkMsg.imageUrl);
    }

    await prisma.message.delete({
      where: {
        id: id,
      },
    });

    return res.status(200).json({ msg: "Message deleted" });
  } catch (err) {
    return res.status(500).json({
      msg: `databse error ${err}`,
    });
  }
};

const deleteAllMessage = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ err: "not authenticated" });
  }

  const { confirmation } = req.body;

  try {
    if (!confirmation) {
      return res.status(400).json({
        success: false,
        message: "Confirmation is required to clear all messages",
      });
    }
    const messagesWithImages = await prisma.message.findMany({
      where: {
        recipientId: user.id,
        imageUrl: { not: null },
      },
      select: { imageUrl: true },
    });

    await prisma.message.deleteMany({
      where: {
        recipientId: user.id,
      },
    });

    await Promise.all(
      messagesWithImages.map((m) => deleteFromCloudinary(m.imageUrl)),
    );

    return res.status(200).json({ msg: "All messages cleared successfully" });
  } catch (err) {
    return res.status(500).json({
      msg: `databse error ${err}`,
    });
  }
};

export {
  sendMessage,
  getMessageInbox,
  getArchivedMessage,
  archiveMessage,
  unarchiveMessage,
  deleteMessage,
  deleteAllMessage,
};
