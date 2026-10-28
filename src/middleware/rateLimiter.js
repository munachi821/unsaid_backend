import rateLimit from "express-rate-limit";

export const sendMessageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 mins
  limit: 10, //max 10 req per ip
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message:
          "You've sent too many messages, Please try again after 15 minutes",
      },
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // max 5 attempts
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts. Please try again after 15 minutes.",
      },
    });
  },
});
