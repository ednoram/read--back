import { IUser } from "@types";
import { hashPassword, mailTransporter } from "@utils";
import { VerificationCode } from "@models";
import { MAIL_SENDER_EMAIL } from "@config";

const sendVerificationEmail = async (user: IUser): Promise<void> => {
  if (user.isVerified === true) {
    throw new Error("User is verified");
  }

  const code = String(Math.floor(Math.random() * 10000));

  const foundVerificationCode = await VerificationCode.findOne({
    userEmail: user.email,
  });

  if (foundVerificationCode) {
    await VerificationCode.findOneAndDelete({ userEmail: user.email });
  }

  const hashedCode = await hashPassword(code);

  await new VerificationCode({
    code: hashedCode,
    userEmail: user.email,
  }).save();

  const mailSubject = "Verify account - Read";
  const mailHtml = `
      <h1>Read - Verify your account</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
    `;

  const mailOptions = {
    from: `"Read" ${MAIL_SENDER_EMAIL}`,
    html: mailHtml,
    to: user.email,
    subject: mailSubject,
  };

  await mailTransporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
