export const sendEmail = async ({ to, subject, text, html }) => {
  //create the transporter
  const response = await fetch("https://sendliberty.com/api/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SEND_LIBERTY_API}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: '"The Unsaid" <munaonye4@gmail.com>',
      to: to,
      subject: subject,
      html: html,
      text,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send email via sendLiberty");
  }

  return data;
};
