import nodemailer from "nodemailer";

// sending otp using nodemailer
export const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your NSS Admin OTP",
    text: `Your OTP is ${otp}. Valid for 5 minutes.`,
  });
};
