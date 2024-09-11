import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.HOST_SERVICE,
  port: 587,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

export const sendOtp = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.log('Error sending email:', error);
    throw new Error('Error sending email');
  }
};
