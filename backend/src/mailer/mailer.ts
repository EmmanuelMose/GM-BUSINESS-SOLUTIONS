import nodemailer from "nodemailer";

export const sendEmail = async (
  email: string,
  subject: string,
  message: string,
  html?: string
): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"GM BUSINESS SERVICES" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: message,
      html: html || message,
    };

    const info = await transporter.sendMail(mailOptions);

    if (!info.accepted || info.accepted.length === 0) {
      throw new Error("Email not accepted by SMTP server");
    }

    return true;
  } catch (error: any) {
    throw new Error("Failed to send email: " + error.message);
  }
};