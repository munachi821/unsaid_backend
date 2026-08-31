import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  //create the transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  //Define the message
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"The Unsaid"<noreply@theunsaid.app>',
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
