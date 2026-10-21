import { prisma } from "../config/db.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
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
export { sendMessage };
